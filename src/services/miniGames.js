const games = new Map();

export function getMiniGame(chat) {
  return games.get(chat) || null;
}

export function setMiniGame(chat, game) {
  games.set(chat, game);
}

export function deleteMiniGame(chat) {
  games.delete(chat);
}

export function hasMiniGame(chat, type = null) {
  const game = games.get(chat);

  if (!game) return false;

  if (
    type &&
    String(game.type).toLowerCase() !==
    String(type).toLowerCase()
  ) {
    return false;
  }

  return true;
}
