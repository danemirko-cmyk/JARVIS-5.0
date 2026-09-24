import {
  logError,
  logCommand
} from '../utils/logger.js';

import {
  prepare
} from '../database/database.js';

import {
  isUserMuted
} from '../utils/admin.js';

import {
  hasSession,
  getMessages,
  addMessage,
  getLastBotMessageId,
  setLastBotMessageId
} from '../middleware/sessions.js';

import {
  askAI
} from '../services/ai.js';

import {
  formatUserMemory,
  processMemoryMessage
} from '../services/memory.js';

import {
  getGameFromReply
} from '../services/games.js';

import {
  handleIndovinelloAnswer
} from '../commands/fun/indovinello.js';

import {
  handleQuizAnswer
} from '../commands/fun/quiz.js';

import {
  handleTriviaAnswer
} from '../commands/fun/trivia.js';

import {
  handleMatematicaAnswer
} from '../commands/fun/matematica.js';

import {
  handleImpiccatoAnswer
} from '../commands/fun/impiccato.js';

import {
  handleGroupMessageControls,
  handleGroupParticipantsUpdate,
  getGroupSettings
} from '../services/groupFunctions.js';

import {
  handleOwnerFlowMessage
} from '../commands/owner/ownerFlows.js';

import {
  isUserBlocked
} from '../services/blockFunctions.js';

import {
  handleControlMessage
} from '../services/control.js';

/* =========================================================
   ANTI-DUPLICAZIONE
========================================================= */

const processedMessages =
  new Map();

const MESSAGE_DEDUPE_TTL =
  60 * 1000;

function isDuplicateMessage(
  message
) {

  const id =
    message?.key?.id;

  const chat =
    message?.key?.remoteJid;

  if (!id || !chat) {
    return false;
  }

  const key =
    `${chat}:${id}`;

  const now =
    Date.now();

  const previous =
    processedMessages.get(
      key
    );

  if (
    previous &&
    now - previous <
      MESSAGE_DEDUPE_TTL
  ) {

    return true;
  }

  processedMessages.set(
    key,
    now
  );

  for (
    const [
      storedKey,
      timestamp
    ] of processedMessages
  ) {

    if (
      now - timestamp >
      MESSAGE_DEDUPE_TTL
    ) {

      processedMessages.delete(
        storedKey
      );
    }
  }

  return false;
}

/* =========================================================
   CACHE NOMI GRUPPI
========================================================= */

const groupInfoCache =
  new Map();

const GROUP_INFO_TTL =
  5 * 60 * 1000;

async function getGroupInfo(
  sock,
  chat
) {

  if (
    !isGroup(chat)
  ) {

    return null;
  }

  const now =
    Date.now();

  const cached =
    groupInfoCache.get(
      chat
    );

  if (
    cached &&
    now - cached.timestamp <
      GROUP_INFO_TTL
  ) {

    return cached.data;
  }

  try {

    const metadata =
      await sock.groupMetadata(
        chat
      );

    const data = {
      subject:
        metadata?.subject ||
        'Gruppo senza nome',

      id:
        chat
    };

    groupInfoCache.set(
      chat,
      {
        timestamp: now,
        data
      }
    );

    return data;

  } catch (error) {

    return {
      subject:
        'Gruppo non disponibile',

      id:
        chat
    };
  }
}

/* =========================================================
   TESTO MESSAGGIO
========================================================= */

function getMessageContent(message) {
  let content = message?.message;

  if (!content) {
    return null;
  }

  // Messaggi ephemeral
  if (content.ephemeralMessage?.message) {
    content = content.ephemeralMessage.message;
  }

  // View once
  if (content.viewOnceMessage?.message) {
    content = content.viewOnceMessage.message;
  }

  if (content.viewOnceMessageV2?.message) {
    content = content.viewOnceMessageV2.message;
  }

  if (content.viewOnceMessageV2Extension?.message) {
    content = content.viewOnceMessageV2Extension.message;
  }

  return content;
}

/* =========================================================
   TESTO MESSAGGIO
========================================================= */

export function getMessageText(
  message
) {

  const content =
    getMessageContent(message);

  if (!content) {
    return '';
  }

  if (
    typeof content.conversation ===
    'string'
  ) {

    return content.conversation;
  }

  if (
    typeof content.extendedTextMessage
      ?.text ===
    'string'
  ) {

    return content
      .extendedTextMessage
      .text;
  }

  if (
    typeof content.imageMessage
      ?.caption ===
    'string'
  ) {

    return content
      .imageMessage
      .caption;
  }

  if (
    typeof content.videoMessage
      ?.caption ===
    'string'
  ) {

    return content
      .videoMessage
      .caption;
  }

  if (
    typeof content.documentMessage
      ?.caption ===
    'string'
  ) {

    return content
      .documentMessage
      .caption;
  }

  return '';
}

/* =========================================================
   TIPO MESSAGGIO
========================================================= */

export function getMessageType(
  message
) {

  const content =
    getMessageContent(message);

  if (!content) {
    return {
      type: 'SCONOSCIUTO',
      icon: '❓',
      description: 'Messaggio non riconosciuto'
    };
  }

  if (content.conversation) {
    return {
      type: 'TESTO',
      icon: '💬',
      description: 'Messaggio di testo'
    };
  }

  if (content.extendedTextMessage) {
    return {
      type: 'TESTO',
      icon: '💬',
      description: 'Messaggio di testo'
    };
  }

  if (content.imageMessage) {

    const caption =
      content.imageMessage.caption;

    return {
      type: 'FOTO',
      icon: '🖼️',
      description:
        caption
          ? `Foto con didascalia: ${JSON.stringify(caption)}`
          : 'Foto senza didascalia'
    };
  }

  if (content.videoMessage) {

    const caption =
      content.videoMessage.caption;

    return {
      type: 'VIDEO',
      icon: '🎥',
      description:
        caption
          ? `Video con didascalia: ${JSON.stringify(caption)}`
          : 'Video senza didascalia'
    };
  }

  if (content.stickerMessage) {

    return {
      type: 'STICKER',
      icon: '🎟️',
      description: 'Sticker'
    };
  }

  if (content.audioMessage) {

    const ptt =
      Boolean(
        content.audioMessage.ptt
      );

    return {
      type: ptt
        ? 'VOCALE'
        : 'AUDIO',
      icon: ptt
        ? '🎤'
        : '🎵',
      description: ptt
        ? 'Messaggio vocale'
        : 'File audio'
    };
  }

  if (content.documentMessage) {

    const fileName =
      content.documentMessage.fileName;

    return {
      type: 'DOCUMENTO',
      icon: '📄',
      description:
        fileName
          ? `Documento: ${fileName}`
          : 'Documento senza nome'
    };
  }

  if (content.contactMessage) {

    return {
      type: 'CONTATTO',
      icon: '👤',
      description:
        content.contactMessage.displayName
          ? `Contatto: ${content.contactMessage.displayName}`
          : 'Contatto'
    };
  }

  if (content.contactsArrayMessage) {

    return {
      type: 'CONTATTI',
      icon: '👥',
      description: 'Più contatti'
    };
  }

  if (content.locationMessage) {

    return {
      type: 'POSIZIONE',
      icon: '📍',
      description: 'Posizione condivisa'
    };
  }

  if (content.liveLocationMessage) {

    return {
      type: 'POSIZIONE LIVE',
      icon: '📍',
      description: 'Posizione in tempo reale'
    };
  }

  if (content.pollCreationMessage) {

    return {
      type: 'SONDAGGIO',
      icon: '📊',
      description: 'Sondaggio creato'
    };
  }

  if (content.pollUpdateMessage) {

    return {
      type: 'SONDAGGIO',
      icon: '📊',
      description: 'Risposta a un sondaggio'
    };
  }

  if (content.reactionMessage) {

    return {
      type: 'REAZIONE',
      icon: '❤️',
      description:
        content.reactionMessage.text
          ? `Reazione: ${content.reactionMessage.text}`
          : 'Reazione'
    };
  }

  if (content.buttonsResponseMessage) {

    return {
      type: 'PULSANTE',
      icon: '🔘',
      description: 'Risposta a un pulsante'
    };
  }

  if (content.listResponseMessage) {

    return {
      type: 'LISTA',
      icon: '📋',
      description: 'Risposta a una lista'
    };
  }

  if (content.interactiveResponseMessage) {

    return {
      type: 'INTERATTIVO',
      icon: '🔘',
      description: 'Risposta interattiva'
    };
  }

  return {
    type: 'ALTRO',
    icon: '📦',
    description:
      `Tipo WhatsApp: ${
        Object.keys(content)[0] ||
        'sconosciuto'
      }`
  };
}

/* =========================================================
   MITTENTE
========================================================= */

export function getSender(
  message
) {

  /*
   * participantPn viene preferito perché,
   * quando disponibile, contiene il JID telefonico
   * anche quando WhatsApp usa un LID.
   */

  return (
    message?.key?.participantPn ||
    message?.key?.participant ||
    message?.key?.participantAlt ||
    message?.key?.remoteJidAlt ||
    message?.key?.remoteJid ||
    ''
  );
}

/* =========================================================
   CHAT
========================================================= */

export function getChat(
  message
) {

  return (
    message?.key?.remoteJid ||
    ''
  );
}

/* =========================================================
   GRUPPO
========================================================= */

export function isGroup(
  jid
) {

  return (
    typeof jid === 'string' &&
    jid.endsWith('@g.us')
  );
}

/* =========================================================
   NORMALIZZA JID
========================================================= */

export function normalizeJid(
  value
) {

  return String(
    value || ''
  )
    .trim()
    .toLowerCase()
    .replace(
      /:\d+(?=@)/,
      ''
    );
}

/* =========================================================
   NUMERO
========================================================= */

export function getNumber(
  value
) {

  return String(
    value || ''
  )
    .split('@')[0]
    .split(':')[0]
    .replace(
      /[^0-9]/g,
      ''
    );
}

/* =========================================================
   JID TELEFONICO
========================================================= */

function getPhoneJid(
  message,
  chat
) {

  const candidates =
    isGroup(chat)

      ? [
          message?.key?.participantPn,
          message?.key?.participantAlt,
          message?.key?.participant
        ]

      : [
          message?.key?.remoteJidAlt,
          message?.key?.participantPn,
          message?.key?.remoteJid
        ];

  /*
   * Prima cerca un JID @s.whatsapp.net.
   */

  const phoneJid =
    candidates.find(
      jid =>
        typeof jid === 'string' &&
        jid.includes('@s.whatsapp.net')
    );

  if (phoneJid) {
    return phoneJid;
  }

  /*
   * Se non disponibile, restituisce
   * comunque il primo identificativo.
   */

  return (
    candidates.find(Boolean) ||
    ''
  );
}

/* =========================================================
   TIPO CHAT
========================================================= */

function getChatType(
  chat
) {

  if (
    isGroup(chat)
  ) {

    return '👥 Gruppo';
  }

  if (
    typeof chat === 'string' &&
    chat.includes('@newsletter')
  ) {

    return '📢 Canale';
  }

  return '🔒 Chat privata';
}

/* =========================================================
   LOG MESSAGGIO
========================================================= */

async function logReceivedMessage({
  sock,
  message,
  chat,
  sender,
  text,
  pushName,
  parsed
}) {

  try {

    const groupInfo =
      await getGroupInfo(
        sock,
        chat
      );

    const phoneJid =
      getPhoneJid(
        message,
        chat
      );

    const number =
      getNumber(
        phoneJid ||
        sender
      );

    const displayName =
      pushName ||
      'Nome non disponibile';

    const chatType =
      getChatType(
        chat
      );

    const media =
      getMessageType(
        message
      );

    const now =
      new Date();

    const time =
      now.toLocaleTimeString(
        'it-IT',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }
      );

    const isCommandMessage =
      Boolean(
        parsed?.command
      );

    const headerIcon =
      isCommandMessage
        ? '⚡'
        : media.icon;

    const headerType =
      isCommandMessage
        ? 'COMANDO'
        : media.type;

    console.log('');
    console.log(
      '╔════════════════════════════════════════════╗'
    );

    console.log(
      `║        📩 ${headerIcon} ${headerType}`.padEnd(46) + '║'
    );

    console.log(
      '╚════════════════════════════════════════════╝'
    );

    console.log('');

    console.log(
      `👤 Nome: ${displayName}`
    );

    console.log(
      `📱 Numero: ${
        number
          ? '+' + number
          : 'non disponibile'
      }`
    );

    if (
      phoneJid &&
      !phoneJid.endsWith('@s.whatsapp.net')
    ) {

      console.log(
        `🆔 JID: ${phoneJid}`
      );
    }

    console.log('');

    /*
     * =====================================================
     * COMANDO
     * =====================================================
     */

    if (
      isCommandMessage
    ) {

      console.log(
        `📌 Comando: .${parsed.command}`
      );

      if (
        parsed.args?.length
      ) {

        console.log(
          `📝 Argomenti: ${parsed.args.join(' ')}`
        );
      }

    /*
     * =====================================================
     * TESTO
     * =====================================================
     */

    } else if (
      media.type === 'TESTO'
    ) {

      console.log(
        `💬 Messaggio: ${
          text
            ? JSON.stringify(text)
            : '(vuoto)'
        }`
      );

    /*
     * =====================================================
     * MEDIA
     * =====================================================
     */

    } else {

      console.log(
        `${media.icon} Tipo: ${media.type}`
      );

      console.log(
        `${media.icon} ${media.description}`
      );

      /*
       * Se il media possiede una caption,
       * mostriamola separatamente.
       */

      if (text) {

        console.log(
          `💬 Didascalia: ${JSON.stringify(text)}`
        );
      }
    }

    console.log('');

    console.log(
      `📍 Dove: ${chatType}`
    );

    if (
      groupInfo
    ) {

      console.log(
        `🏷️ Gruppo: ${groupInfo.subject}`
      );

      console.log(
        `🆔 ID gruppo: ${groupInfo.id}`
      );

    } else {

      console.log(
        `🆔 Chat ID: ${chat}`
      );
    }

    console.log('');

    console.log(
      `🕐 Ora: ${time}`
    );

    console.log(
      `🤖 Da JARVIS: ❌ NO`
    );

    console.log('');

    console.log(
      '════════════════════════════════════════════'
    );

    console.log('');

  } catch (error) {

    console.log(
      '[LOG] Impossibile creare il log dettagliato:',
      error?.message || error
    );
  }
}

/* =========================================================
   COMANDO
========================================================= */

export function isCommand(
  text,
  prefix = '.'
) {

  return (
    typeof text === 'string' &&
    text
      .trim()
      .startsWith(prefix)
  );
}

/* =========================================================
   PARSE COMMAND
========================================================= */

export function parseCommand(
  text,
  prefix = '.'
) {

  const raw =
    String(
      text || ''
    ).trim();

  if (
    !raw.startsWith(prefix)
  ) {

    return {
      command: null,
      args: [],
      text: raw
    };
  }

  const withoutPrefix =
    raw
      .slice(prefix.length)
      .trim();

  if (!withoutPrefix) {

    return {
      command: null,
      args: [],
      text: raw
    };
  }

  const parts =
    withoutPrefix.split(
      /\s+/
    );

  const command =
    String(
      parts.shift() || ''
    )
      .toLowerCase()
      .trim();

  return {
    command,
    args: parts,
    text: raw
  };
}

/* =========================================================
   BESTEMMIOMETRO
========================================================= */

export function containsBlasphemy(
  text
) {

  const normalized =
    String(
      text || ''
    )
      .toLowerCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  const phrases = [
    'dio porco',
    'dio cane',
    'dio boia',
    'dio bastardo',
    'porco dio',
    'porco cane',
    'madonna porca',
    'cristo dio',
    'cristo porco'
  ];

  return phrases.some(
    phrase =>
      normalized.includes(
        phrase
      )
  );
}

/* =========================================================
   UTENTE
========================================================= */

export function getUserByPhone(
  phone
) {

  const normalizedPhone =
    getNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  try {

    return (
      prepare(`
        SELECT *
        FROM users
        WHERE phone = ?
        LIMIT 1
      `).get(
        normalizedPhone
      ) || null
    );

  } catch (error) {

    logError(
      'Errore recupero utente database',
      error
    );

    return null;
  }
}

/* =========================================================
   ASSICURA UTENTE
========================================================= */

export function ensureUser(
  phone,
  name = null
) {

  const normalizedPhone =
    getNumber(phone);

  if (!normalizedPhone) {
    return null;
  }

  try {

    let user =
      prepare(`
        SELECT *
        FROM users
        WHERE phone = ?
        LIMIT 1
      `).get(
        normalizedPhone
      );

    if (!user) {

      prepare(`
        INSERT INTO users (
          phone,
          name,
          level,
          xp,
          coins,
          messages,
          blasphemy_count
        )
        VALUES (
          ?,
          ?,
          1,
          0,
          0,
          0,
          0
        )
      `).run(
        normalizedPhone,
        name || null
      );

      user =
        prepare(`
          SELECT *
          FROM users
          WHERE phone = ?
          LIMIT 1
        `).get(
          normalizedPhone
        );

    } else if (
      name &&
      String(name).trim() &&
      name !== user.name
    ) {

      try {

        prepare(`
          UPDATE users
          SET name = ?
          WHERE id = ?
        `).run(
          name,
          user.id
        );

      } catch {
        // Mantiene comunque l'utente.
      }

      user =
        prepare(`
          SELECT *
          FROM users
          WHERE id = ?
          LIMIT 1
        `).get(
          user.id
        );
    }

    return user || null;

  } catch (error) {

    logError(
      'Errore ensureUser',
      error
    );

    return null;
  }
}

/* =========================================================
   STATISTICHE
========================================================= */

export function updateUserStats(
  user,
  messageText,
  {
    countBlasphemy = true
  } = {}
) {

  if (!user?.id) {
    return user;
  }

  try {

    const oldXp =
      Number(user.xp) || 0;

    const oldMessages =
      Number(user.messages) || 0;

    const oldBlasphemies =
      Number(
        user.blasphemy_count
      ) || 0;

    const addedXp =
      100;

    const newXp =
      oldXp + addedXp;

    const newMessages =
      oldMessages + 1;

    const detectedBlasphemy =
      containsBlasphemy(
        messageText
      );

    const newBlasphemies =
      oldBlasphemies +
      (
        countBlasphemy &&
        detectedBlasphemy
          ? 1
          : 0
      );

    const newLevel =
      Math.floor(
        newXp / 1000
      ) + 1;

    try {

      prepare(`
        UPDATE users
        SET
          xp = ?,
          level = ?,
          messages = ?,
          blasphemy_count = ?
        WHERE id = ?
      `).run(
        newXp,
        newLevel,
        newMessages,
        newBlasphemies,
        user.id
      );

    } catch (error) {

      logError(
        'Errore aggiornamento statistiche users',
        error
      );
    }

    try {

      const xpRow =
        prepare(`
          SELECT user_id
          FROM xp
          WHERE user_id = ?
          LIMIT 1
        `).get(
          user.id
        );

      if (xpRow) {

        prepare(`
          UPDATE xp
          SET
            total_xp = ?,
            level = ?
          WHERE user_id = ?
        `).run(
          newXp,
          newLevel,
          user.id
        );

      } else {

        prepare(`
          INSERT INTO xp (
            user_id,
            total_xp,
            level
          )
          VALUES (?, ?, ?)
        `).run(
          user.id,
          newXp,
          newLevel
        );
      }

    } catch {
      // XP opzionale.
    }

    if (
      countBlasphemy &&
      detectedBlasphemy
    ) {

      console.log(
        `[BESTEMMIAMETRO] ${user.phone} → totale: ${newBlasphemies}`
      );
    }

    try {

      return (
        prepare(`
          SELECT *
          FROM users
          WHERE id = ?
          LIMIT 1
        `).get(
          user.id
        ) || user
      );

    } catch {

      return user;
    }

  } catch (error) {

    logError(
      'Errore statistiche utente',
      error
    );

    return user;
  }
}

/* =========================================================
   REPLY AL BOT
========================================================= */

export function isReplyToBot(
  message,
  sock
) {

  const contextInfo =
    message
      ?.message
      ?.extendedTextMessage
      ?.contextInfo;

  const quotedParticipant =
    contextInfo?.participant ||
    contextInfo?.participantAlt ||
    contextInfo?.participantPn;

  if (!quotedParticipant) {
    return false;
  }

  const botIds = [
    sock?.user?.id,
    sock?.user?.lid,
    sock?.user?.jid,
    sock?.user?.phoneNumber
  ]
    .filter(Boolean)
    .map(
      normalizeJid
    );

  return botIds.includes(
    normalizeJid(
      quotedParticipant
    )
  );
}

/* =========================================================
   REPLY ALL'ULTIMO BOT
========================================================= */

function getReplyMessageId(
  message
) {

  const contextInfo =
    message
      ?.message
      ?.extendedTextMessage
      ?.contextInfo;

  return (
    contextInfo?.stanzaId ||
    contextInfo?.quotedMessageId ||
    null
  );
}

function isReplyToLastBotMessage(
  message,
  chat
) {

  const replyId =
    getReplyMessageId(
      message
    );

  if (!replyId) {
    return false;
  }

  const lastBotMessageId =
    getLastBotMessageId(
      chat
    );

  if (!lastBotMessageId) {
    return false;
  }

  return (
    String(replyId) ===
    String(lastBotMessageId)
  );
}

/* =========================================================
   OWNER
========================================================= */

function isOwner(
  sender
) {

  const ownerNumber =
    getNumber(
      process.env.OWNER_NUMBER ||
      ''
    );

  if (!ownerNumber) {
    return false;
  }

  return (
    getNumber(sender) ===
    ownerNumber
  );
}

/* =========================================================
   ADMIN
========================================================= */

async function senderIsAdmin(
  sock,
  chat,
  sender,
  message
) {

  if (!isGroup(chat)) {
    return false;
  }

  if (
    isOwner(sender)
  ) {
    return true;
  }

  try {

    const metadata =
      await sock.groupMetadata(
        chat
      );

    const participants =
      metadata?.participants ||
      [];

    const candidates = [
      sender,
      message?.key?.participant,
      message?.key?.participantAlt,
      message?.key?.participantPn,
      message?.key?.senderPn
    ]
      .filter(Boolean)
      .map(
        normalizeJid
      );

    const candidateNumbers =
      candidates
        .map(getNumber)
        .filter(Boolean);

    return participants.some(
      participant => {

        const ids = [
          participant?.id,
          participant?.lid,
          participant?.phoneNumber
        ]
          .filter(Boolean)
          .map(
            normalizeJid
          );

        const numbers =
          ids
            .map(getNumber)
            .filter(Boolean);

        const admin =
          participant?.admin ===
            'admin' ||
          participant?.admin ===
            'superadmin' ||
          participant?.isAdmin ===
            true ||
          participant?.isSuperAdmin ===
            true;

        if (!admin) {
          return false;
        }

        return (
          candidates.some(
            id =>
              ids.includes(id)
          ) ||
          candidateNumbers.some(
            number =>
              numbers.includes(
                number
              )
          )
        );
      }
    );

  } catch (error) {

    logError(
      'Errore controllo amministratore',
      error
    );

    return false;
  }
}

/* =========================================================
   MUTE
========================================================= */

async function isSenderMuted(
  chat,
  sender,
  message
) {

  if (
    !isGroup(chat) ||
    !sender
  ) {

    return false;
  }

  const candidates = [
    sender,
    message?.key?.participant,
    message?.key?.participantAlt,
    message?.key?.participantPn,
    message?.key?.senderPn,
    message?.key?.remoteJidAlt
  ]
    .filter(Boolean)
    .map(
      normalizeJid
    );

  for (
    const candidate of [
      ...new Set(candidates)
    ]
  ) {

    try {

      if (
        isUserMuted(
          chat,
          candidate
        )
      ) {

        return true;
      }

    } catch (error) {

      logError(
        'Errore controllo MUTA',
        error
      );
    }
  }

  return false;
}

/* =========================================================
   GIOCHI
========================================================= */

export async function handleGameReply({
  sock,
  chat,
  message,
  sender,
  text
}) {

  let game = null;

  try {

    game =
      getGameFromReply(
        message
      );

  } catch (error) {

    logError(
      'Errore recupero partita',
      error
    );

    return false;
  }

  if (!game) {
    return false;
  }

  try {

    switch (
      String(
        game.type || ''
      ).toLowerCase()
    ) {

      case 'indovinello':

        await handleIndovinelloAnswer({
          sock,
          chat,
          message,
          sender,
          text,
          game
        });

        return true;

      case 'quiz':

        await handleQuizAnswer({
          sock,
          chat,
          message,
          sender,
          text,
          game
        });

        return true;

      case 'trivia':

        await handleTriviaAnswer({
          sock,
          chat,
          sender,
          text,
          game
        });

        return true;

      case 'matematica':

        await handleMatematicaAnswer({
          sock,
          chat,
          sender,
          text,
          game
        });

        return true;

      case 'impiccato':

        await handleImpiccatoAnswer({
          sock,
          chat,
          sender,
          text,
          game
        });

        return true;

      default:
        return false;
    }

  } catch (error) {

    logError(
      `Errore risposta gioco ${game.type}`,
      error
    );

    return true;
  }
}

/* =========================================================
   CHAT AI
========================================================= */

export async function handleChatMessage({
  sock,
  chat,
  sender,
  text
}) {

  if (
    !chat ||
    !sender
  ) {

    return null;
  }

  if (
    !hasSession(chat)
  ) {

    return null;
  }

  try {

    await processMemoryMessage(
      sender,
      text
    );

    const memory =
      formatUserMemory(
        sender
      );

    addMessage(
      chat,
      'user',
      text
    );

    const conversation =
      getMessages(
        chat
      );

    const systemPrompt =
`Sei JARVIS 5.0, assistente WhatsApp personale.

Il tuo creatore e proprietario è Dada (Mirko).

Parla in italiano in modo naturale, simpatico,
diretto e amichevole.

Non dire che sei stato creato da OpenAI,
ChatGPT o Groq.

Groq è solamente il servizio tecnico utilizzato
per generare le risposte.

MEMORIA:
${
  memory ||
  'Nessuna memoria disponibile.'
}`;

    const response =
      await askAI(
        conversation,
        {
          systemPrompt,
          temperature: 0.8,
          maxTokens: 1000
        }
      );

    const finalResponse =
      String(
        response ||
        '🤖 Non ho una risposta al momento.'
      ).trim();

    addMessage(
      chat,
      'assistant',
      finalResponse
    );

    const sent =
      await sock.sendMessage(
        chat,
        {
          text:
            finalResponse
        }
      );

    if (
      sent?.key?.id
    ) {

      setLastBotMessageId(
        chat,
        sent.key.id
      );
    }

    return sent;

  } catch (error) {

    logError(
      'Errore gestione chat AI',
      error
    );

    return null;
  }
}

/* =========================================================
   SOLO ADMIN
========================================================= */

async function handleSoloAdmin(
  sock,
  message,
  chat,
  sender,
  command
) {

  if (
    !isGroup(chat)
  ) {

    return false;
  }

  const settings =
    getGroupSettings(
      chat
    );

  if (
    !settings ||
    Number(
      settings.soloadmin
    ) !== 1
  ) {

    return false;
  }

  const admin =
    await senderIsAdmin(
      sock,
      chat,
      sender,
      message
    );

  if (admin) {
    return false;
  }

  await sock.sendMessage(
    chat,
    {
      text:
        `🔒 *SOLO ADMIN*\n\n` +
        `Il comando .${command} è disponibile ` +
        `solo agli amministratori del gruppo.`
    }
  );

  return true;
}

/* =========================================================
   ELIMINA MESSAGGIO BLOCCATO
========================================================= */

async function deleteBlockedMessage(
  sock,
  chat,
  message
) {

  try {

    await sock.sendMessage(
      chat,
      {
        delete:
          message.key
      }
    );

  } catch (error) {

    logError(
      'Errore eliminazione messaggio utente bloccato',
      error
    );
  }
}

/* =========================================================
   HANDLER
========================================================= */

export function registerMessageHandler(
  sock,
  {
    prefix = '.',
    onCommand = null,
    onMessage = null
  } = {}
) {

  if (!sock) {

    throw new Error(
      'Socket WhatsApp mancante.'
    );
  }

  /* =======================================================
     PARTECIPANTI
  ======================================================= */

  sock.ev.on(
    'group-participants.update',
    async update => {

      try {

        await handleGroupParticipantsUpdate(
          sock,
          update
        );

      } catch (error) {

        logError(
          'Errore evento partecipanti',
          error
        );
      }
    }
  );

  /* =======================================================
     MESSAGGI
  ======================================================= */

  sock.ev.on(
    'messages.upsert',
    async ({
      messages,
      type
    }) => {

      console.log(
        `[MESSAGES] Evento ricevuto: ${messages?.length || 0} messaggi | tipo: ${type || 'unknown'}`
      );

      for (
        const message of
        messages || []
      ) {

        try {

          if (!message) {
            continue;
          }

          if (
            isDuplicateMessage(
              message
            )
          ) {

            continue;
          }

          if (
            message.key?.fromMe
          ) {

            continue;
          }

          const chat =
            getChat(
              message
            );

          if (!chat) {
            continue;
          }

          const text =
            getMessageText(
              message
            );

          const sender =
            getSender(
              message
            );

          const pushName =
            message.pushName ||
            message.verifiedBizName ||
            null;

          /* =================================================
             PARSING COMANDO
          ================================================= */

          const parsed =
            parseCommand(
              text,
              prefix
            );

          /* =================================================
             LOG DETTAGLIATO
          ================================================= */

          await logReceivedMessage({
            sock,
            message,
            chat,
            sender,
            text,
            pushName,
            parsed
          });

          /* =================================================
             OWNER FLOW
          ================================================= */

          try {

            if (
              typeof onMessage ===
              'function'
            ) {

              const handled =
                await onMessage({
                  sock,
                  message,
                  chat,
                  sender,
                  text,
                  pushName
                });

              if (handled) {
                continue;
              }
            }

          } catch (error) {

            logError(
              'Errore owner flow',
              error
            );
          }

          /* =================================================
             BLOCCO UTENTE
          ================================================= */

          if (
            isGroup(chat) &&
            sender
          ) {

            const blocked =
              isUserBlocked(
                chat,
                sender
              );

            if (blocked) {

              await deleteBlockedMessage(
                sock,
                chat,
                message
              );

              continue;
            }
          }

          /* =================================================
             MUTE
          ================================================= */

          if (
            isGroup(chat)
          ) {

            const muted =
              await isSenderMuted(
                chat,
                sender,
                message
              );

            if (muted) {

              const admin =
                await senderIsAdmin(
                  sock,
                  chat,
                  sender,
                  message
                );

              if (!admin) {

                try {

                  await sock.sendMessage(
                    chat,
                    {
                      delete:
                        message.key
                    }
                  );

                } catch (error) {

                  logError(
                    'Errore eliminazione messaggio mutato',
                    error
                  );
                }

                continue;
              }
            }
          }

          /* =================================================
             TESTO VUOTO
          ================================================= */

          if (!text) {
            continue;
          }

          /* =================================================
             CONTROL
          ================================================= */

          if (
            isGroup(chat)
          ) {

            try {

              const groupSettings =
                getGroupSettings(
                  chat
                );

              const controlEnabled =
                Number(
                  groupSettings?.control
                ) === 1;

              const controlTriggered =
                await handleControlMessage({
                  sock,
                  message,
                  chat,
                  sender,
                  text,
                  isCommand:
                    Boolean(
                      parsed.command
                    ),
                  enabled:
                    controlEnabled
                });

              if (
                controlTriggered
              ) {

                continue;
              }

            } catch (error) {

              logError(
                'Errore CONTROL',
                error
              );
            }
          }

          /* =================================================
             COMANDO
          ================================================= */

          if (
            parsed.command
          ) {

            console.log(
              `[COMMAND] Riconosciuto: .${parsed.command}`
            );

            if (
              await handleSoloAdmin(
                sock,
                message,
                chat,
                sender,
                parsed.command
              )
            ) {

              continue;
            }

            if (
              typeof onCommand ===
              'function'
            ) {

              console.log(
                `[COMMAND] Invio a executeCommand: .${parsed.command}`
              );

              await onCommand({
                sock,
                message,
                chat,
                sender,
                pushName,
                text,
                command:
                  parsed.command,
                args:
                  parsed.args,
                prefix,
                isGroup:
                  isGroup(chat),
                isReplyToBot:
                  isReplyToBot(
                    message,
                    sock
                  ),
                user:
                  ensureUser(
                    sender,
                    pushName
                  )
              });

              console.log(
                `[COMMAND] Fine executeCommand: .${parsed.command}`
              );
            }

            continue;
          }

          /* =================================================
             CONTROLLI AUTOMATICI GRUPPO
          ================================================= */

          let groupSettings =
            null;

          if (
            isGroup(chat)
          ) {

            try {

              const controls =
                await handleGroupMessageControls({
                  sock,
                  message,
                  chat,
                  sender,
                  text
                });

              groupSettings =
                controls?.settings ||
                getGroupSettings(
                  chat
                );

              if (
                controls?.blocked
              ) {

                continue;
              }

            } catch (error) {

              logError(
                'Errore controlli gruppo',
                error
              );
            }
          }

          /* =================================================
             UTENTE
          ================================================= */

          const user =
            ensureUser(
              sender,
              pushName
            );

          /* =================================================
             STATISTICHE
          ================================================= */

          if (user) {

            const countBlasphemy =
              !isGroup(chat) ||
              Number(
                groupSettings
                  ?.bestemmiometro
              ) === 1;

            updateUserStats(
              user,
              text,
              {
                countBlasphemy
              }
            );
          }

          /* =================================================
             GIOCHI
          ================================================= */

          const handledGame =
            await handleGameReply({
              sock,
              chat,
              message,
              sender,
              text
            });

          if (
            handledGame
          ) {

            continue;
          }

          /* =================================================
             CHAT AI
          ================================================= */

          if (
            hasSession(chat)
          ) {

            const replyToBot =
              isReplyToLastBotMessage(
                message,
                chat
              );

            if (
              replyToBot
            ) {

              await handleChatMessage({
                sock,
                chat,
                sender,
                text
              });
            }
          }

        } catch (error) {

          logError(
            'Errore gestione messaggio',
            error
          );
        }
      }
    }
  );
}
