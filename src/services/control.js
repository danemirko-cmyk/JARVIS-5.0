import {
  blockUserForTwoHours
} from './blockFunctions.js';

import {
  containsBlasphemy,
  isGroupAdmin
} from './groupFunctions.js';

const COMMAND_WINDOW = 7000;
const BLASPHEMY_WINDOW = 30000;

const COMMAND_LIMIT = 3;
const BLASPHEMY_LIMIT = 3;

const commandMap = new Map();
const blasphemyMap = new Map();

// ============================================================
// UTILS
// ============================================================

function normalizeJid(jid) {
  if (!jid) return null;

  return String(jid)
    .trim()
    .replace(/:[0-9]+(?=@)/, '');
}

function getKey(groupJid, userJid) {
  return `${normalizeJid(groupJid)}:${normalizeJid(userJid)}`;
}

function cleanupArray(array, windowMs) {

  const now = Date.now();

  return array.filter(
    timestamp =>
      now - timestamp <= windowMs
  );
}

// ============================================================
// DELETE MESSAGE
// ============================================================

async function deleteMessage(
  sock,
  message
) {

  try {

    if (!message?.key) {
      return;
    }

    await sock.sendMessage(
      message.key.remoteJid,
      {
        delete: message.key
      }
    );

  } catch (error) {

    console.error(
      '[CONTROL] Impossibile eliminare messaggio:',
      error.message
    );

  }
}

// ============================================================
// NOTIFICA BLOCCO
// ============================================================

async function notifyBlock(
  sock,
  chat,
  sender,
  reason
) {

  const number =
    sender
      .split('@')[0];

  await sock.sendMessage(
    chat,
    {
      text:
        `🛡️ *CONTROL*\n\n` +
        `🚫 @${number} è stato bloccato automaticamente per 2 ore.\n` +
        `📌 Motivo: ${reason}`,
      mentions: [sender]
    }
  );
}

// ============================================================
// CONTROL
// ============================================================

export async function handleControlMessage({
  sock,
  message,
  chat,
  sender,
  text,
  isCommand = false,
  enabled = false
}) {

  if (!enabled) {
    return false;
  }

  if (!chat?.endsWith('@g.us')) {
    return false;
  }

  if (!sender) {
    return false;
  }

  // ----------------------------------------------------------
  // GLI ADMIN SONO ESCLUSI DAL CONTROL
  // ----------------------------------------------------------

  let admin = false;

  try {

    admin =
      await isGroupAdmin(
        sock,
        chat,
        sender
      );

  } catch (error) {

    console.error(
      '[CONTROL] Errore controllo admin:',
      error.message
    );

    return false;
  }

  if (admin) {
    return false;
  }

  const key =
    getKey(
      chat,
      sender
    );

  const now =
    Date.now();

  // ==========================================================
  // COMANDI
  // ==========================================================

  if (isCommand) {

    const current =
      commandMap.get(key) || [];

    const updated =
      cleanupArray(
        [
          ...current,
          now
        ],
        COMMAND_WINDOW
      );

    commandMap.set(
      key,
      updated
    );

    if (
      updated.length >=
      COMMAND_LIMIT
    ) {

      commandMap.delete(key);

      await deleteMessage(
        sock,
        message
      );

      await blockUserForTwoHours(
        chat,
        sender,
        'spam di comandi'
      );

      await notifyBlock(
        sock,
        chat,
        sender,
        '3 comandi inviati in 7 secondi'
      );

      return true;
    }
  }

  // ==========================================================
  // BESTEMMIE
  // ==========================================================

  if (
    text &&
    containsBlasphemy(text)
  ) {

    const current =
      blasphemyMap.get(key) || [];

    const updated =
      cleanupArray(
        [
          ...current,
          now
        ],
        BLASPHEMY_WINDOW
      );

    blasphemyMap.set(
      key,
      updated
    );

    if (
      updated.length >=
      BLASPHEMY_LIMIT
    ) {

      blasphemyMap.delete(key);

      await deleteMessage(
        sock,
        message
      );

      await blockUserForTwoHours(
        chat,
        sender,
        'bestemmie ripetute'
      );

      await notifyBlock(
        sock,
        chat,
        sender,
        '3 bestemmie rilevate in 30 secondi'
      );

      return true;
    }
  }

  // ==========================================================
  // PULIZIA MAPPE
  // ==========================================================

  if (
    commandMap.size > 5000 ||
    blasphemyMap.size > 5000
  ) {

    cleanupMaps();
  }

  return false;
}

// ============================================================
// CLEANUP
// ============================================================

function cleanupMaps() {

  const now =
    Date.now();

  for (
    const [
      key,
      timestamps
    ] of commandMap
  ) {

    const filtered =
      cleanupArray(
        timestamps,
        COMMAND_WINDOW
      );

    if (filtered.length) {
      commandMap.set(
        key,
        filtered
      );
    } else {
      commandMap.delete(key);
    }
  }

  for (
    const [
      key,
      timestamps
    ] of blasphemyMap
  ) {

    const filtered =
      cleanupArray(
        timestamps,
        BLASPHEMY_WINDOW
      );

    if (filtered.length) {
      blasphemyMap.set(
        key,
        filtered
      );
    } else {
      blasphemyMap.delete(key);
    }
  }
}

export {
  COMMAND_WINDOW,
  BLASPHEMY_WINDOW,
  COMMAND_LIMIT,
  BLASPHEMY_LIMIT
};
