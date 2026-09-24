const activeGames = new Map();

/* =========================================================
   NORMALIZZAZIONE
========================================================= */

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeGameAnswer(value) {
  return normalizeText(value);
}

/* =========================================================
   REGISTRA GIOCO
========================================================= */

export function registerGame(messageKey, game) {
  const id = messageKey?.id;

  if (!id) {
    return false;
  }

  activeGames.set(
    id,
    {
      ...game,
      messageId: id,
      createdAt: Date.now()
    }
  );

  return true;
}

/* =========================================================
   RECUPERA GIOCO DA RISPOSTA
========================================================= */

export function getGameFromReply(message) {
  const context =
    message?.message
      ?.extendedTextMessage
      ?.contextInfo;

  const stanzaId =
    context?.stanzaId;

  if (!stanzaId) {
    return null;
  }

  return (
    activeGames.get(stanzaId) ||
    null
  );
}

/* =========================================================
   RECUPERA GIOCO PER CHAT
========================================================= */

export function getActiveGameByChat(
  chat,
  type = null
) {
  if (!chat) {
    return null;
  }

  const games = [
    ...activeGames.values()
  ];

  for (const game of games) {
    if (
      game.chat !== chat
    ) {
      continue;
    }

    if (
      type &&
      String(game.type || '').toLowerCase() !==
      String(type).toLowerCase()
    ) {
      continue;
    }

    return game;
  }

  return null;
}

/* =========================================================
   RIMUOVI GIOCO
========================================================= */

export function removeGame(messageId) {
  if (!messageId) {
    return;
  }

  activeGames.delete(
    messageId
  );
}

/* =========================================================
   RIMUOVI GIOCO PER CHAT
========================================================= */

export function removeGameByChat(
  chat,
  type = null
) {
  const game =
    getActiveGameByChat(
      chat,
      type
    );

  if (!game) {
    return false;
  }

  activeGames.delete(
    game.messageId
  );

  return true;
}

/* =========================================================
   CONTROLLO RISPOSTA
========================================================= */

export function checkGameAnswer(
  game,
  answer
) {
  if (!game) {
    return false;
  }

  const normalized =
    normalizeText(answer);

  if (!normalized) {
    return false;
  }

  if (
    Array.isArray(
      game.answers
    )
  ) {
    return game.answers.some(
      item =>
        normalizeText(item) ===
        normalized
    );
  }

  if (
    Array.isArray(
      game.acceptedAnswers
    )
  ) {
    return game.acceptedAnswers.some(
      item =>
        normalizeText(item) ===
        normalized
    );
  }

  return (
    normalizeText(
      game.answer
    ) === normalized
  );
}

/* =========================================================
   STATISTICHE
========================================================= */

export function getActiveGamesCount() {
  return activeGames.size;
}
