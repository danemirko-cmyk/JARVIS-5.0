import {
  prepare,
  transaction
} from '../database/database.js';

import {
  logAI,
  logError
} from '../utils/logger.js';

function normalizeUserId(userId) {
  return String(userId || '').trim();
}

function normalizeMemory(memory) {
  return String(memory || '').trim();
}

function ensureUser(userId) {
  const phone =
    normalizeUserId(userId);

  if (!phone) {
    return null;
  }

  try {
    const existing =
      prepare(`
        SELECT id, phone, name
        FROM users
        WHERE phone = ?
        LIMIT 1
      `).get(phone);

    if (existing) {
      return existing;
    }

    const result =
      prepare(`
        INSERT INTO users (
          phone,
          name
        )
        VALUES (?, ?)
      `).run(
        phone,
        phone
      );

    return prepare(`
      SELECT id, phone, name
      FROM users
      WHERE id = ?
      LIMIT 1
    `).get(result.lastInsertRowid);

  } catch (error) {
    logError(
      'Errore creazione utente memoria',
      error
    );

    return null;
  }
}

export function getUserMemory(
  userId
) {
  const user =
    ensureUser(userId);

  if (!user) {
    return [];
  }

  try {
    const rows =
      prepare(`
        SELECT
          id,
          memory,
          importance,
          source,
          created_at,
          updated_at
        FROM memories
        WHERE user_id = ?
        ORDER BY
          importance DESC,
          created_at ASC
      `).all(user.id);

    return rows.map(
      row => row.memory
    );

  } catch (error) {
    logError(
      'Errore lettura memoria utente',
      error
    );

    return [];
  }
}

export function addUserMemory(
  userId,
  memory,
  options = {}
) {
  const user =
    ensureUser(userId);

  const value =
    normalizeMemory(memory);

  if (!user || !value) {
    return false;
  }

  const importance =
    Math.max(
      1,
      Math.min(
        10,
        Number(options.importance) || 1
      )
    );

  const source =
    String(
      options.source || 'chat'
    ).trim();

  try {
    const existing =
      prepare(`
        SELECT id
        FROM memories
        WHERE user_id = ?
          AND lower(trim(memory)) =
              lower(trim(?))
        LIMIT 1
      `).get(
        user.id,
        value
      );

    if (existing) {
      prepare(`
        UPDATE memories
        SET
          importance = MAX(importance, ?),
          updated_at = unixepoch()
        WHERE id = ?
      `).run(
        importance,
        existing.id
      );

      return false;
    }

    transaction(() => {
      prepare(`
        INSERT INTO memories (
          user_id,
          memory,
          importance,
          source
        )
        VALUES (?, ?, ?, ?)
      `).run(
        user.id,
        value,
        importance,
        source
      );

      /*
       * Manteniamo un massimo di 50 memorie
       * per utente.
       */
      prepare(`
        DELETE FROM memories
        WHERE user_id = ?
          AND id NOT IN (
            SELECT id
            FROM memories
            WHERE user_id = ?
            ORDER BY
              importance DESC,
              updated_at DESC
            LIMIT 50
          )
      `).run(
        user.id,
        user.id
      );
    });

    logAI(
      `Memoria aggiunta per ${user.phone}: ${value}`
    );

    return true;

  } catch (error) {
    logError(
      'Errore aggiunta memoria',
      error
    );

    return false;
  }
}

export function removeUserMemory(
  userId,
  memory
) {
  const user =
    ensureUser(userId);

  const value =
    normalizeMemory(memory);

  if (!user || !value) {
    return false;
  }

  try {
    const result =
      prepare(`
        DELETE FROM memories
        WHERE user_id = ?
          AND lower(trim(memory)) =
              lower(trim(?))
      `).run(
        user.id,
        value
      );

    return result.changes > 0;

  } catch (error) {
    logError(
      'Errore rimozione memoria',
      error
    );

    return false;
  }
}

export function clearUserMemory(
  userId
) {
  const user =
    ensureUser(userId);

  if (!user) {
    return false;
  }

  try {
    const result =
      prepare(`
        DELETE FROM memories
        WHERE user_id = ?
      `).run(user.id);

    logAI(
      `Memoria cancellata per ${user.phone}`
    );

    return result.changes > 0;

  } catch (error) {
    logError(
      'Errore cancellazione memoria',
      error
    );

    return false;
  }
}

export function formatUserMemory(
  userId
) {
  const user =
    ensureUser(userId);

  if (!user) {
    return '';
  }

  try {
    const rows =
      prepare(`
        SELECT
          memory,
          importance
        FROM memories
        WHERE user_id = ?
        ORDER BY
          importance DESC,
          updated_at DESC
        LIMIT 50
      `).all(user.id);

    if (!rows.length) {
      return '';
    }

    return rows
      .map(
        (row, index) =>
          `${index + 1}. ${row.memory}`
      )
      .join('\n');

  } catch (error) {
    logError(
      'Errore formattazione memoria',
      error
    );

    return '';
  }
}

export function hasUserMemory(
  userId
) {
  const user =
    ensureUser(userId);

  if (!user) {
    return false;
  }

  try {
    const row =
      prepare(`
        SELECT 1 AS exists_memory
        FROM memories
        WHERE user_id = ?
        LIMIT 1
      `).get(user.id);

    return row?.exists_memory === 1;

  } catch (error) {
    logError(
      'Errore controllo memoria',
      error
    );

    return false;
  }
}

export function getMemoryCount(
  userId
) {
  const user =
    ensureUser(userId);

  if (!user) {
    return 0;
  }

  try {
    const row =
      prepare(`
        SELECT COUNT(*) AS count
        FROM memories
        WHERE user_id = ?
      `).get(user.id);

    return Number(
      row?.count || 0
    );

  } catch (error) {
    logError(
      'Errore conteggio memoria',
      error
    );

    return 0;
  }
}

export function detectMemoryFromMessage(
  text
) {
  const message =
    String(text || '').trim();

  if (!message) {
    return null;
  }

  const patterns = [
    /^ricordati che (.+)$/i,
    /^ricorda che (.+)$/i,
    /^memorizza che (.+)$/i,
    /^salva che (.+)$/i
  ];

  for (const pattern of patterns) {
    const match =
      message.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

export function processMemoryMessage(
  userId,
  text
) {
  try {
    const memory =
      detectMemoryFromMessage(text);

    if (!memory) {
      return false;
    }

    return addUserMemory(
      userId,
      memory,
      {
        source: 'chat',
        importance: 5
      }
    );

  } catch (error) {
    logError(
      'Errore gestione memoria',
      error
    );

    return false;
  }
}
