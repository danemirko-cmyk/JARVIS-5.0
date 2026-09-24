import fs from 'node:fs';
import path from 'node:path';

import {
  prepare,
  exec
} from '../database/database.js';

import {
  logError
} from '../utils/logger.js';

/* =========================================================
   CONFIGURAZIONE
========================================================= */

const FLOOD_WINDOW = 5000;
const FLOOD_LIMIT = 6;

const floodMap = new Map();

/* =========================================================
   BESTEMMIOMETRO
========================================================= */

const BESTEMMIE_PATH = path.resolve(
  process.cwd(),
  'data',
  'bestemmie.json'
);

let bestemmieVariants = [];
let bestemmieRegex = null;

/* =========================================================
   NORMALIZZAZIONE BESTEMMIE
========================================================= */

function normalizeBlasphemyText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   ESCAPE REGEX
========================================================= */

function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

/* =========================================================
   CARICAMENTO DATABASE BESTEMMIE
========================================================= */

function loadBestemmieDatabase() {

  try {

    if (!fs.existsSync(BESTEMMIE_PATH)) {

      console.warn(
        `[BESTEMMIOMETRO] File non trovato: ${BESTEMMIE_PATH}`
      );

      bestemmieVariants = [];
      bestemmieRegex = null;

      return;
    }

    const raw =
      fs.readFileSync(
        BESTEMMIE_PATH,
        'utf8'
      );

    const database =
      JSON.parse(raw);

    if (
      !database ||
      !Array.isArray(database.variants)
    ) {

      console.warn(
        '[BESTEMMIOMETRO] Il file bestemmie.json non contiene "variants".'
      );

      bestemmieVariants = [];
      bestemmieRegex = null;

      return;
    }

    const normalized =
      database.variants
        .map(normalizeBlasphemyText)
        .filter(Boolean);

    bestemmieVariants = [
      ...new Set(normalized)
    ];

    bestemmieVariants.sort(
      (a, b) =>
        b.length - a.length
    );

    if (
      !bestemmieVariants.length
    ) {

      bestemmieRegex = null;

      console.warn(
        '[BESTEMMIOMETRO] Nessuna variante caricata.'
      );

      return;
    }

    const pattern =
      bestemmieVariants
        .map(escapeRegex)
        .join('|');

    bestemmieRegex =
      new RegExp(
        `(?:^|\\s)(?:${pattern})(?=\\s|$)`,
        'iu'
      );

    console.log(
      `[BESTEMMIOMETRO] Caricate ${bestemmieVariants.length} varianti.`
    );

  } catch (error) {

    bestemmieVariants = [];
    bestemmieRegex = null;

    logError(
      'Errore caricamento database bestemmie',
      error
    );
  }
}

loadBestemmieDatabase();

/* =========================================================
   RILEVAMENTO BESTEMMIA
========================================================= */

export function containsBlasphemy(text) {

  if (
    !bestemmieRegex ||
    !text
  ) {
    return false;
  }

  const normalized =
    normalizeBlasphemyText(text);

  if (!normalized) {
    return false;
  }

  return bestemmieRegex.test(
    normalized
  );
}

/* =========================================================
   INCREMENTO BESTEMMIOMETRO
========================================================= */

function incrementBlasphemyCount(sender) {

  const phone =
    getNumber(sender);

  if (!phone) {
    return null;
  }

  try {

    const result =
      prepare(`
        UPDATE users
        SET blasphemy_count =
          COALESCE(blasphemy_count, 0) + 1
        WHERE phone = ?
      `).run(phone);

    if (
      Number(result?.changes || 0) > 0
    ) {

      const user =
        prepare(`
          SELECT
            COALESCE(blasphemy_count, 0)
              AS blasphemy_count
          FROM users
          WHERE phone = ?
          LIMIT 1
        `).get(phone);

      return Number(
        user?.blasphemy_count || 0
      );
    }

    prepare(`
      INSERT INTO users (
        phone,
        name,
        level,
        xp,
        coins,
        messages,
        blasphemy_count,
        warns
      )
      VALUES (
        ?,
        ?,
        1,
        0,
        0,
        0,
        1,
        0
      )
      ON CONFLICT(phone)
      DO UPDATE SET
        blasphemy_count =
          COALESCE(
            users.blasphemy_count,
            0
          ) + 1
    `).run(
      phone,
      phone
    );

    const user =
      prepare(`
        SELECT
          COALESCE(blasphemy_count, 0)
            AS blasphemy_count
        FROM users
        WHERE phone = ?
        LIMIT 1
      `).get(phone);

    return Number(
      user?.blasphemy_count || 1
    );

  } catch (error) {

    logError(
      'Errore incremento bestemmiometro',
      error
    );

    return null;
  }
}

/* =========================================================
   LINK
========================================================= */

const LINK_REGEX =
  /(?:https?:\/\/|www\.)\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i;

const INSTAGRAM_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\S*/i;

const TIKTOK_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:tiktok\.com|vm\.tiktok\.com)\S*/i;

/* =========================================================
   JID
========================================================= */

function cleanJid(value) {

  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/:\d+(?=@)/, '');
}

function getNumber(value) {

  return cleanJid(value)
    .split('@')[0]
    .replace(/[^0-9]/g, '');
}

/* =========================================================
   AGGIORNAMENTO DATABASE
========================================================= */

function ensureGroupFunctionColumns() {

  try {

    const columns =
      prepare(
        `PRAGMA table_info(group_settings)`
      ).all();

    const names =
      columns.map(
        column => column.name
      );

    if (
      !names.includes('soloadmin')
    ) {

      exec(`
        ALTER TABLE group_settings
        ADD COLUMN soloadmin
        INTEGER NOT NULL DEFAULT 0
      `);

      console.log(
        '[GROUP] Colonna soloadmin aggiunta.'
      );
    }

    if (
      !names.includes('bestemmiometro')
    ) {

      exec(`
        ALTER TABLE group_settings
        ADD COLUMN bestemmiometro
        INTEGER NOT NULL DEFAULT 0
      `);

      console.log(
        '[GROUP] Colonna bestemmiometro aggiunta.'
      );
    }

    if (
      !names.includes('control')
    ) {

      exec(`
        ALTER TABLE group_settings
        ADD COLUMN control
        INTEGER NOT NULL DEFAULT 0
      `);

      console.log(
        '[GROUP] Colonna control aggiunta.'
      );
    }

  } catch (error) {

    logError(
      'Errore aggiornamento colonne funzioni gruppo',
      error
    );
  }
}

ensureGroupFunctionColumns();

/* =========================================================
   GRUPPO
========================================================= */

export function ensureGroup(
  jid,
  name = null
) {

  if (
    !jid ||
    !String(jid).endsWith('@g.us')
  ) {
    return null;
  }

  try {

    let group =
      prepare(`
        SELECT *
        FROM groups
        WHERE jid = ?
        LIMIT 1
      `).get(jid);

    if (!group) {

      prepare(`
        INSERT INTO groups (
          jid,
          name
        )
        VALUES (?, ?)
      `).run(
        jid,
        name || null
      );

      group =
        prepare(`
          SELECT *
          FROM groups
          WHERE jid = ?
          LIMIT 1
        `).get(jid);

    } else if (
      name &&
      String(name).trim() &&
      name !== group.name
    ) {

      prepare(`
        UPDATE groups
        SET
          name = ?,
          updated_at = unixepoch()
        WHERE id = ?
      `).run(
        name,
        group.id
      );

      group =
        prepare(`
          SELECT *
          FROM groups
          WHERE id = ?
          LIMIT 1
        `).get(group.id);
    }

    prepare(`
      INSERT OR IGNORE INTO group_settings (
        group_id
      )
      VALUES (?)
    `).run(group.id);

    return group;

  } catch (error) {

    logError(
      'Errore ensureGroup',
      error
    );

    return null;
  }
}

/* =========================================================
   IMPOSTAZIONI
========================================================= */

export function getGroupSettings(
  jid,
  name = null
) {

  const group =
    ensureGroup(
      jid,
      name
    );

  if (!group) {
    return null;
  }

  try {

    return (
      prepare(`
        SELECT *
        FROM group_settings
        WHERE group_id = ?
        LIMIT 1
      `).get(group.id) || null
    );

  } catch (error) {

    logError(
      'Errore recupero impostazioni gruppo',
      error
    );

    return null;
  }
}

/* =========================================================
   CONTROLLO FUNZIONE
========================================================= */

export function isGroupFunctionEnabled(
  jid,
  setting,
  name = null
) {

  const settings =
    getGroupSettings(
      jid,
      name
    );

  if (!settings) {
    return false;
  }

  return (
    Number(
      settings[setting]
    ) === 1
  );
}

/* =========================================================
   TOGGLE
========================================================= */

export function toggleGroupFunction(
  jid,
  setting,
  name = null
) {

  const allowedSettings = [
    'welcome',
    'goodbye',
    'antilink',
    'antilink_ig',
    'antilink_tiktok',
    'antiflood',
    'soloadmin',
    'bestemmiometro',
    'control'
  ];

  if (
    !allowedSettings.includes(
      setting
    )
  ) {

    logError(
      `Impostazione gruppo non consentita: ${setting}`
    );

    return null;
  }

  const group =
    ensureGroup(
      jid,
      name
    );

  if (!group) {
    return null;
  }

  try {

    const current =
      prepare(`
        SELECT ${setting} AS value
        FROM group_settings
        WHERE group_id = ?
        LIMIT 1
      `).get(group.id);

    const next =
      Number(current?.value) === 1
        ? 0
        : 1;

    prepare(`
      UPDATE group_settings
      SET
        ${setting} = ?,
        updated_at = unixepoch()
      WHERE group_id = ?
    `).run(
      next,
      group.id
    );

    return next === 1;

  } catch (error) {

    logError(
      `Errore toggle funzione ${setting}`,
      error
    );

    return null;
  }
}

/* =========================================================
   ADMIN
========================================================= */

export async function isGroupAdmin(
  sock,
  chat,
  sender
) {

  if (
    !chat?.endsWith('@g.us')
  ) {
    return false;
  }

  try {

    const metadata =
      await sock.groupMetadata(
        chat
      );

    const senderJid =
      cleanJid(sender);

    const senderNumber =
      getNumber(sender);

    return (
      metadata?.participants || []
    ).some(
      participant => {

        const ids = [
          participant?.id,
          participant?.lid,
          participant?.phoneNumber
        ]
          .filter(Boolean)
          .map(cleanJid);

        const numbers =
          ids
            .map(getNumber)
            .filter(Boolean);

        const admin =
          participant?.admin === 'admin' ||
          participant?.admin === 'superadmin' ||
          participant?.isAdmin === true ||
          participant?.isSuperAdmin === true;

        if (!admin) {
          return false;
        }

        return (
          ids.includes(
            senderJid
          ) ||
          (
            senderNumber &&
            numbers.includes(
              senderNumber
            )
          )
        );
      }
    );

  } catch (error) {

    logError(
      'Errore controllo admin',
      error
    );

    return false;
  }
}

/* =========================================================
   ADMIN DA TAGGARE
========================================================= */

export async function getAdminMentions(
  sock,
  chat
) {

  try {

    const metadata =
      await sock.groupMetadata(
        chat
      );

    const admins =
      (
        metadata?.participants || []
      )
        .filter(
          participant =>
            participant?.admin === 'admin' ||
            participant?.admin === 'superadmin' ||
            participant?.isAdmin === true ||
            participant?.isSuperAdmin === true
        )
        .map(
          participant =>
            participant?.id ||
            participant?.lid ||
            participant?.phoneNumber
        )
        .filter(Boolean);

    return [
      ...new Set(
        admins.map(cleanJid)
      )
    ];

  } catch (error) {

    logError(
      'Errore recupero amministratori',
      error
    );

    return [];
  }
}

/* =========================================================
   CHIUSURA GRUPPO
========================================================= */

async function closeGroupAndNotifyAdmins(
  sock,
  chat,
  reason
) {

  const admins =
    await getAdminMentions(
      sock,
      chat
    );

  try {

    await sock.groupSettingUpdate(
      chat,
      'announcement'
    );

  } catch (error) {

    logError(
      'Errore chiusura gruppo',
      error
    );
  }

  if (!admins.length) {

    await sock.sendMessage(
      chat,
      {
        text: reason
      }
    );

    return;
  }

  const tags =
    admins
      .map(
        jid =>
          `@${getNumber(jid)}`
      )
      .join(' ');

  await sock.sendMessage(
    chat,
    {
      text:
        `${reason}\n\n` +
        `🔔 *Amministratori:*\n${tags}\n\n` +
        `Riaprite il gruppo quando necessario.`,
      mentions: admins
    }
  );
}

/* =========================================================
   ELIMINA MESSAGGIO
========================================================= */

async function deleteMessage(
  sock,
  chat,
  message
) {

  try {

    await sock.sendMessage(
      chat,
      {
        delete: message.key
      }
    );

    return true;

  } catch (error) {

    logError(
      'Errore eliminazione messaggio',
      error
    );

    return false;
  }
}

/* =========================================================
   ANTIFLOOD
========================================================= */

function registerFlood(
  chat,
  sender
) {

  const key =
    `${chat}:${cleanJid(sender)}`;

  const now =
    Date.now();

  const timestamps =
    floodMap.get(key) || [];

  const valid =
    timestamps.filter(
      timestamp =>
        now - timestamp <=
        FLOOD_WINDOW
    );

  valid.push(now);

  floodMap.set(
    key,
    valid
  );

  for (
    const [
      storedKey,
      values
    ] of floodMap.entries()
  ) {

    if (
      !values.some(
        timestamp =>
          now - timestamp <=
          FLOOD_WINDOW
      )
    ) {

      floodMap.delete(
        storedKey
      );
    }
  }

  return valid.length;
}

/* =========================================================
   CONTROLLO MESSAGGI
========================================================= */

export async function handleGroupMessageControls({
  sock,
  message,
  chat,
  sender,
  text
}) {

  if (
    !chat?.endsWith('@g.us') ||
    !sender ||
    !text
  ) {

    return {
      blocked: false,
      settings: null
    };
  }

  let metadata = null;

  try {

    metadata =
      await sock.groupMetadata(
        chat
      );

  } catch (error) {

    logError(
      'Errore recupero metadata gruppo',
      error
    );
  }

  const groupName =
    metadata?.subject ||
    null;

  const settings =
    getGroupSettings(
      chat,
      groupName
    );

  if (!settings) {

    return {
      blocked: false,
      settings: null
    };
  }

  const admin =
    await isGroupAdmin(
      sock,
      chat,
      sender
    );

  /* =======================================================
     BESTEMMIOMETRO
  ======================================================= */

  if (
    Number(
      settings.bestemmiometro
    ) === 1
  ) {

    const hasBlasphemy =
      containsBlasphemy(
        text
      );

    if (hasBlasphemy) {

      const total =
        incrementBlasphemyCount(
          sender
        );

      if (total !== null) {

        const jid =
          cleanJid(sender);

        await sock.sendMessage(
          chat,
          {
            text:
              `🤬 *BESTEMMIOMETRO*\n` +
              `@${getNumber(jid)} → +1 bestemmia\n` +
              `📊 Totale: ${total}`,
            mentions: [jid]
          }
        );

        console.log(
          `[BESTEMMIOMETRO] ${getNumber(sender)} → +1 | Totale: ${total}`
        );
      }
    }
  }

  /* =======================================================
     ANTILINK
  ======================================================= */

  const hasLink =
    LINK_REGEX.test(text);

  const hasInstagram =
    INSTAGRAM_REGEX.test(text);

  const hasTikTok =
    TIKTOK_REGEX.test(text);

  const genericLink =
    Number(
      settings.antilink
    ) === 1;

  const instagramLink =
    Number(
      settings.antilink_ig
    ) === 1 &&
    hasInstagram;

  const tiktokLink =
    Number(
      settings.antilink_tiktok
    ) === 1 &&
    hasTikTok;

  if (
    !admin &&
    (
      (
        genericLink &&
        hasLink
      ) ||
      instagramLink ||
      tiktokLink
    )
  ) {

    await deleteMessage(
      sock,
      chat,
      message
    );

    let reason =
      '🔗 *ANTILINK ATTIVO*\n' +
      'Il gruppo è stato chiuso perché è stato inviato un link.';

    if (
      instagramLink &&
      !genericLink
    ) {

      reason =
        '📸 *ANTILINK INSTAGRAM ATTIVO*\n' +
        'Il gruppo è stato chiuso perché è stato inviato un link Instagram.';
    }

    if (
      tiktokLink &&
      !genericLink
    ) {

      reason =
        '🎵 *ANTILINK TIKTOK ATTIVO*\n' +
        'Il gruppo è stato chiuso perché è stato inviato un link TikTok.';
    }

    await closeGroupAndNotifyAdmins(
      sock,
      chat,
      reason
    );

    return {
      blocked: true,
      settings
    };
  }

  /* =======================================================
     ANTIFLOOD
  ======================================================= */

  if (
    Number(
      settings.antiflood
    ) === 1 &&
    !admin
  ) {

    const count =
      registerFlood(
        chat,
        sender
      );

    if (
      count >=
      FLOOD_LIMIT
    ) {

      await deleteMessage(
        sock,
        chat,
        message
      );

      const jid =
        cleanJid(sender);

      floodMap.delete(
        `${chat}:${jid}`
      );

      await closeGroupAndNotifyAdmins(
        sock,
        chat,
        `🌊 *ANTIFLOOD ATTIVO*\n\n` +
        `Il gruppo è stato chiuso automaticamente ` +
        `a causa di un eccessivo numero di messaggi ` +
        `inviati troppo rapidamente.`
      );

      return {
        blocked: true,
        settings
      };
    }
  }

  return {
    blocked: false,
    settings
  };
}

/* =========================================================
   EVENTI PARTECIPANTI
========================================================= */

export async function handleGroupParticipantsUpdate(
  sock,
  update
) {

  const {
    id: chat,
    participants = [],
    action
  } = update || {};

  if (
    !chat?.endsWith('@g.us') ||
    !['add', 'remove'].includes(
      action
    )
  ) {
    return;
  }

  let metadata = null;

  try {

    metadata =
      await sock.groupMetadata(
        chat
      );

  } catch (error) {

    logError(
      'Errore recupero metadata evento gruppo',
      error
    );
  }

  const groupName =
    metadata?.subject ||
    'Gruppo';

  const settings =
    getGroupSettings(
      chat,
      groupName
    );

  if (!settings) {
    return;
  }

  const enabled =
    action === 'add'
      ? Number(
          settings.welcome
        ) === 1
      : Number(
          settings.goodbye
        ) === 1;

  if (!enabled) {
    return;
  }

  const cleanParticipants =
    participants
      .filter(Boolean)
      .map(cleanJid);

  if (
    !cleanParticipants.length
  ) {
    return;
  }

  const mentions =
    cleanParticipants;

  const tags =
    cleanParticipants
      .map(
        jid =>
          `@${getNumber(jid)}`
      )
      .join(' ');

  /* =======================================================
     BENVENUTO
  ======================================================= */

  if (
    action === 'add'
  ) {

    const text =
      `👋 *Benvenuto ${tags}!*\n` +
      `💬 *Presentati al gruppo!*`;

    try {

      const imageUrl =
        await sock.profilePictureUrl(
          chat,
          'image'
        );

      if (imageUrl) {

        const response =
          await fetch(
            imageUrl
          );

        if (response.ok) {

          const buffer =
            Buffer.from(
              await response.arrayBuffer()
            );

          await sock.sendMessage(
            chat,
            {
              image: buffer,
              caption: text,
              mentions
            }
          );

          return;
        }
      }

    } catch (error) {

      logError(
        'Errore foto gruppo benvenuto',
        error
      );
    }

    await sock.sendMessage(
      chat,
      {
        text,
        mentions
      }
    );

    return;
  }

  /* =======================================================
     ADDIO
  ======================================================= */

  const text =
    `👋 *ADDIO*\n\n` +
    `${tags} ha lasciato il gruppo.`;

  await sock.sendMessage(
    chat,
    {
      text,
      mentions
    }
  );
}
