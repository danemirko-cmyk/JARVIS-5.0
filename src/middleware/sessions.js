import {
  logAI,
  logError
} from '../utils/logger.js';


/* =========================================================
   CONFIGURAZIONE
========================================================= */

const sessions = new Map();

const DEFAULT_TIMEOUT =
  10 * 60 * 1000;

const MAX_MESSAGES = 20;


/* =========================================================
   NORMALIZZAZIONE CHIAVE SESSIONE
========================================================= */

function normalizeSessionId(
  value
) {
  return String(
    value || ''
  ).trim();
}


/* =========================================================
   CREAZIONE SESSIONE
========================================================= */

function createSession(
  sessionId
) {
  return {
    sessionId,

    messages: [],

    createdAt:
      Date.now(),

    lastActivity:
      Date.now(),

    lastBotMessageId:
      null
  };
}


/* =========================================================
   CONTROLLO SCADENZA
========================================================= */

function isExpired(
  session,
  timeout
) {
  return (
    Date.now() -
      session.lastActivity >
    timeout
  );
}


/* =========================================================
   GET / CREA SESSIONE
========================================================= */

export function getSession(
  sessionId,
  options = {}
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return null;
  }

  const timeout =
    options.timeout ||
    DEFAULT_TIMEOUT;

  let session =
    sessions.get(
      key
    );


  /* -------------------------------------------------------
     SESSIONE SCADUTA
  ------------------------------------------------------- */

  if (
    session &&
    isExpired(
      session,
      timeout
    )
  ) {
    sessions.delete(
      key
    );

    session = null;

    logAI(
      `Sessione scaduta: ${key}`
    );
  }


  /* -------------------------------------------------------
     NUOVA SESSIONE
  ------------------------------------------------------- */

  if (!session) {
    session =
      createSession(
        key
      );

    sessions.set(
      key,
      session
    );

    logAI(
      `Nuova sessione chat: ${key}`
    );
  }


  session.lastActivity =
    Date.now();

  return session;
}


/* =========================================================
   CONTROLLA SESSIONE SENZA CREARLA
========================================================= */

export function hasSession(
  sessionId,
  options = {}
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return false;
  }

  const session =
    sessions.get(
      key
    );

  if (!session) {
    return false;
  }

  const timeout =
    options.timeout ||
    DEFAULT_TIMEOUT;


  if (
    isExpired(
      session,
      timeout
    )
  ) {
    sessions.delete(
      key
    );

    logAI(
      `Sessione scaduta: ${key}`
    );

    return false;
  }

  return true;
}


/* =========================================================
   AGGIUNGE MESSAGGIO
========================================================= */

export function addMessage(
  sessionId,
  role,
  content
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (
    !key ||
    !content
  ) {
    return false;
  }


  const session =
    getSession(
      key
    );

  if (!session) {
    return false;
  }


  session.messages.push({
    role,
    content:
      String(content),
    timestamp:
      Date.now()
  });


  /* -------------------------------------------------------
     LIMITA CRONOLOGIA
  ------------------------------------------------------- */

  if (
    session.messages.length >
    MAX_MESSAGES
  ) {
    session.messages =
      session.messages.slice(
        -MAX_MESSAGES
      );
  }


  session.lastActivity =
    Date.now();

  return true;
}


/* =========================================================
   RECUPERA MESSAGGI
========================================================= */

export function getMessages(
  sessionId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return [];
  }

  const session =
    sessions.get(
      key
    );

  if (!session) {
    return [];
  }


  return session.messages.map(
    message => ({
      role:
        message.role,

      content:
        message.content
    })
  );
}


/* =========================================================
   ID ULTIMO MESSAGGIO JARVIS
========================================================= */

export function setLastBotMessageId(
  sessionId,
  messageId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (
    !key ||
    !messageId
  ) {
    return false;
  }


  const session =
    getSession(
      key
    );

  if (!session) {
    return false;
  }


  session.lastBotMessageId =
    String(
      messageId
    );

  session.lastActivity =
    Date.now();

  return true;
}


/* =========================================================
   RECUPERA ID ULTIMO MESSAGGIO JARVIS
========================================================= */

export function getLastBotMessageId(
  sessionId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return null;
  }

  const session =
    sessions.get(
      key
    );

  if (!session) {
    return null;
  }


  return (
    session.lastBotMessageId ||
    null
  );
}


/* =========================================================
   INFORMAZIONI SESSIONE
========================================================= */

export function getSessionInfo(
  sessionId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return null;
  }

  const session =
    sessions.get(
      key
    );

  if (!session) {
    return null;
  }


  return {
    sessionId:
      session.sessionId,

    createdAt:
      session.createdAt,

    lastActivity:
      session.lastActivity,

    messageCount:
      session.messages.length,

    lastBotMessageId:
      session.lastBotMessageId
  };
}


/* =========================================================
   AGGIORNA ATTIVITÀ
========================================================= */

export function touchSession(
  sessionId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return false;
  }

  const session =
    sessions.get(
      key
    );

  if (!session) {
    return false;
  }


  session.lastActivity =
    Date.now();

  return true;
}


/* =========================================================
   CHIUDI SESSIONE
========================================================= */

export function endSession(
  sessionId
) {
  const key =
    normalizeSessionId(
      sessionId
    );

  if (!key) {
    return false;
  }


  const deleted =
    sessions.delete(
      key
    );

  if (deleted) {
    logAI(
      `Sessione chiusa: ${key}`
    );
  }

  return deleted;
}


/* =========================================================
   CANCELLA TUTTE LE SESSIONI
========================================================= */

export function clearSessions() {
  sessions.clear();

  logAI(
    'Tutte le sessioni chat sono state cancellate.'
  );
}


/* =========================================================
   NUMERO SESSIONI ATTIVE
========================================================= */

export function getActiveSessionCount() {
  return sessions.size;
}


/* =========================================================
   PULIZIA SESSIONI SCADUTE
========================================================= */

export function cleanupSessions(
  timeout = DEFAULT_TIMEOUT
) {
  const now =
    Date.now();


  for (
    const [
      sessionId,
      session
    ] of sessions.entries()
  ) {

    if (
      now -
        session.lastActivity >
      timeout
    ) {

      sessions.delete(
        sessionId
      );

      logAI(
        `Sessione rimossa automaticamente: ${sessionId}`
      );
    }
  }
}


/* =========================================================
   CLEANUP AUTOMATICO
========================================================= */

const cleanupInterval =
  setInterval(
    () => {
      try {
        cleanupSessions();

      } catch (error) {
        logError(
          'Errore pulizia sessioni',
          error
        );
      }
    },
    60 * 1000
  );


cleanupInterval.unref?.();
