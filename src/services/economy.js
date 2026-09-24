import { prepare } from '../database/database.js';

/* =========================================
   UTILITY
========================================= */

function getPhone(jid) {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

/* =========================================
   UTENTE
========================================= */

export function getUserByJid(jid) {
  const phone =
    getPhone(jid);

  if (!phone) {
    return null;
  }

  return prepare(`
    SELECT *
    FROM users
    WHERE phone = ?
    LIMIT 1
  `).get(phone) || null;
}

/* =========================================
   ECONOMIA
========================================= */

export function ensureEconomy(userId) {
  if (!userId) {
    return null;
  }

  let economy =
    prepare(`
      SELECT *
      FROM economy
      WHERE user_id = ?
      LIMIT 1
    `).get(userId);

  if (!economy) {

    prepare(`
      INSERT INTO economy (
        user_id,
        balance,
        last_daily,
        last_work,
        last_rob
      )
      VALUES (?, 0, 0, 0, 0)
    `).run(userId);

    economy =
      prepare(`
        SELECT *
        FROM economy
        WHERE user_id = ?
        LIMIT 1
      `).get(userId);
  }

  return economy;
}

/* =========================================
   SALDO
========================================= */

export function getBalance(userId) {
  const economy =
    ensureEconomy(userId);

  return Number(
    economy?.balance || 0
  );
}

/* =========================================
   AGGIUNTA JCOINS
========================================= */

export function addCoins(
  userId,
  amount
) {
  const value =
    Number(amount);

  if (
    !userId ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false;
  }

  ensureEconomy(userId);

  prepare(`
    UPDATE economy
    SET balance = balance + ?
    WHERE user_id = ?
  `).run(
    Math.floor(value),
    userId
  );

  return true;
}

/* =========================================
   RIMOZIONE JCOINS
========================================= */

export function removeCoins(
  userId,
  amount
) {
  const value =
    Number(amount);

  if (
    !userId ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return false;
  }

  const balance =
    getBalance(userId);

  if (balance < value) {
    return false;
  }

  prepare(`
    UPDATE economy
    SET balance = balance - ?
    WHERE user_id = ?
  `).run(
    Math.floor(value),
    userId
  );

  return true;
}

/* =========================================
   IMPOSTA SALDO
========================================= */

export function setBalance(
  userId,
  amount
) {
  const value =
    Number(amount);

  if (
    !userId ||
    !Number.isFinite(value) ||
    value < 0
  ) {
    return false;
  }

  ensureEconomy(userId);

  prepare(`
    UPDATE economy
    SET balance = ?
    WHERE user_id = ?
  `).run(
    Math.floor(value),
    userId
  );

  return true;
}

/* =========================================
   COOLDOWN GENERICO
========================================= */

export function getCooldown(
  userId,
  type
) {
  const economy =
    ensureEconomy(userId);

  if (!economy) {
    return 0;
  }

  const fieldMap = {
    daily: 'last_daily',
    work: 'last_work',
    rob: 'last_rob'
  };

  const field =
    fieldMap[type];

  if (!field) {
    return 0;
  }

  return Number(
    economy[field] || 0
  );
}

/* =========================================
   AGGIORNA COOLDOWN
========================================= */

export function setCooldown(
  userId,
  type,
  timestamp = Math.floor(
    Date.now() / 1000
  )
) {
  ensureEconomy(userId);

  const fieldMap = {
    daily: 'last_daily',
    work: 'last_work',
    rob: 'last_rob'
  };

  const field =
    fieldMap[type];

  if (!field) {
    return false;
  }

  prepare(`
    UPDATE economy
    SET ${field} = ?
    WHERE user_id = ?
  `).run(
    timestamp,
    userId
  );

  return true;
}

/* =========================================
   TEMPO RIMANENTE
========================================= */

export function getRemainingCooldown(
  userId,
  type,
  cooldownSeconds
) {
  const last =
    getCooldown(
      userId,
      type
    );

  if (!last) {
    return 0;
  }

  const now =
    Math.floor(
      Date.now() / 1000
    );

  const remaining =
    cooldownSeconds -
    (now - last);

  return Math.max(
    0,
    remaining
  );
}

/* =========================================
   FORMATTAZIONE TEMPO
========================================= */

export function formatCooldown(
  seconds
) {
  const value =
    Math.max(
      0,
      Math.floor(
        Number(seconds) || 0
      )
    );

  const hours =
    Math.floor(
      value / 3600
    );

  const minutes =
    Math.floor(
      (value % 3600) / 60
    );

  const secs =
    value % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(
      `${hours}h`
    );
  }

  if (
    minutes > 0 ||
    hours > 0
  ) {
    parts.push(
      `${minutes}m`
    );
  }

  parts.push(
    `${secs}s`
  );

  return parts.join(' ');
}
