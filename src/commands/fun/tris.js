import {
  registerGame,
  getActiveGameByChat,
  removeGameByChat
} from '../../services/games.js';

function normalizeJid(jid) {
  return String(jid || '').replace(/:\d+(?=@)/, '');
}

function mentionFromJid(jid) {
  return `@${normalizeJid(jid).split('@')[0]}`;
}

function getMentionedUsers(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  return context?.mentionedJid || [];
}

function getBoardText(board) {
  const cells = board.map(cell => {
    if (cell === 'X') return '❌';
    if (cell === 'O') return '🔵';
    return '⬜';
  });

  return [
    `${cells[0]} │ ${cells[1]} │ ${cells[2]}`,
    `───┼───┼───`,
    `${cells[3]} │ ${cells[4]} │ ${cells[5]}`,
    `───┼───┼───`,
    `${cells[6]} │ ${cells[7]} │ ${cells[8]}`
  ].join('\n');
}

function checkWinner(board) {
  const combinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of combinations) {
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }

  if (board.every(Boolean)) {
    return 'DRAW';
  }

  return null;
}

function buildBoardMessage({
  game,
  currentPlayer
}) {
  const playerX =
    mentionFromJid(game.playerX);

  const playerO =
    mentionFromJid(game.playerO);

  const currentMention =
    currentPlayer === 'X'
      ? playerX
      : playerO;

  return `⭕ *TRIS — J.A.R.V.I.S 5.0*

❌ ${playerX}
🔵 ${playerO}

══════ •⊰✧⊱• ══════

${getBoardText(game.board)}

══════ •⊰✧⊱• ══════

🎯 *Tocca a:* ${currentMention}

💡 *Scegli una casella:*

↖️ 1   ⬆️ 2   ↗️ 3
⬅️ 4   ⏺️ 5   ➡️ 6
↙️ 7   ⬇️ 8   ↘️ 9

👉 *.tris 1-9*`;
}

export function registerTrisCommand(registerCommand) {
  registerCommand(
    'tris',
    async ({
      sock,
      chat,
      sender,
      message,
      args
    }) => {
      const activeGame =
        getActiveGameByChat(chat, 'tris');

      /*
       * ========================================
       * PARTITA GIÀ IN CORSO
       * ========================================
       */

      if (activeGame) {
        const player =
          normalizeJid(sender);

        const playerX =
          normalizeJid(activeGame.playerX);

        const playerO =
          normalizeJid(activeGame.playerO);

        /*
         * Controllo giocatore
         */

        if (
          player !== playerX &&
          player !== playerO
        ) {
          await sock.sendMessage(
            chat,
            {
              text:
                '🚫 Questa partita è già in corso tra altri due giocatori.'
            },
            { quoted: message }
          );

          return;
        }

        /*
         * Controllo turno
         */

        const currentPlayer =
          activeGame.turn;

        const expectedPlayer =
          currentPlayer === 'X'
            ? playerX
            : playerO;

        if (player !== expectedPlayer) {
          await sock.sendMessage(
            chat,
            {
              text:
`⏳ *Non è il tuo turno!*

🎯 Tocca a ${mentionFromJid(expectedPlayer)}`
            },
            {
              quoted: message,
              mentions: [expectedPlayer]
            }
          );

          return;
        }

        /*
         * Controllo posizione
         */

        const position =
          Number(args?.[0]);

        if (
          !Number.isInteger(position) ||
          position < 1 ||
          position > 9
        ) {
          await sock.sendMessage(
            chat,
            {
              text:
`❌ *Mossa non valida!*

Scegli una casella da *1 a 9*.

↖️ 1   ⬆️ 2   ↗️ 3
⬅️ 4   ⏺️ 5   ➡️ 6
↙️ 7   ⬇️ 8   ↘️ 9`
            },
            { quoted: message }
          );

          return;
        }

        const index =
          position - 1;

        /*
         * Controllo casella occupata
         */

        if (activeGame.board[index]) {
          await sock.sendMessage(
            chat,
            {
              text:
                '🚫 *Casella occupata!*\n\nScegline un’altra.'
            },
            { quoted: message }
          );

          return;
        }

        /*
         * Inserisce la mossa
         */

        activeGame.board[index] =
          currentPlayer;

        /*
         * Controlla risultato
         */

        const winner =
          checkWinner(activeGame.board);

        /*
         * ========================================
         * VITTORIA
         * ========================================
         */

        if (
          winner === 'X' ||
          winner === 'O'
        ) {
          const winnerJid =
            winner === 'X'
              ? activeGame.playerX
              : activeGame.playerO;

          const loserJid =
            winner === 'X'
              ? activeGame.playerO
              : activeGame.playerX;

          removeGameByChat(
            chat,
            'tris'
          );

          await sock.sendMessage(
            chat,
            {
              text:
`🏆 *TRIS — VITTORIA!*

❌ ${mentionFromJid(activeGame.playerX)}
🔵 ${mentionFromJid(activeGame.playerO)}

══════ •⊰✧⊱• ══════

${getBoardText(activeGame.board)}

══════ •⊰✧⊱• ══════

👑 *VINCE:* ${mentionFromJid(winnerJid)}

💀 ${mentionFromJid(loserJid)} è stato asfaltato! 😂

🎉 Complimenti!`,
              mentions: [
                normalizeJid(activeGame.playerX),
                normalizeJid(activeGame.playerO)
              ]
            }
          );

          return;
        }

        /*
         * ========================================
         * PAREGGIO
         * ========================================
         */

        if (winner === 'DRAW') {
          removeGameByChat(
            chat,
            'tris'
          );

          await sock.sendMessage(
            chat,
            {
              text:
`🤝 *TRIS — PAREGGIO!*

❌ ${mentionFromJid(activeGame.playerX)}
🔵 ${mentionFromJid(activeGame.playerO)}

══════ •⊰✧⊱• ══════

${getBoardText(activeGame.board)}

══════ •⊰✧⊱• ══════

🤝 *Nessuno ha vinto!*

😎 Partita equilibrata.`
            },
            {
              mentions: [
                normalizeJid(activeGame.playerX),
                normalizeJid(activeGame.playerO)
              ]
            }
          );

          return;
        }

        /*
         * ========================================
         * CAMBIO TURNO
         * ========================================
         */

        activeGame.turn =
          currentPlayer === 'X'
            ? 'O'
            : 'X';

        const nextPlayer =
          activeGame.turn === 'X'
            ? activeGame.playerX
            : activeGame.playerO;

        await sock.sendMessage(
          chat,
          {
            text: buildBoardMessage({
              game: activeGame,
              currentPlayer:
                activeGame.turn
            }),
            mentions: [
              normalizeJid(activeGame.playerX),
              normalizeJid(activeGame.playerO)
            ]
          }
        );

        return;
      }

      /*
       * ========================================
       * NUOVA PARTITA
       * ========================================
       */

      const mentioned =
        getMentionedUsers(message);

      if (!mentioned.length) {
        await sock.sendMessage(
          chat,
          {
            text:
`⭕ *TRIS — J.A.R.V.I.S 5.0*

Per iniziare una partita devi sfidare qualcuno.

👉 *Esempio:*
.tris @utente

❌ Primo giocatore
🔵 Secondo giocatore`
          },
          { quoted: message }
        );

        return;
      }

      const opponent =
        normalizeJid(mentioned[0]);

      const player =
        normalizeJid(sender);

      /*
       * Non può sfidare se stesso
       */

      if (opponent === player) {
        await sock.sendMessage(
          chat,
          {
            text:
              '😂 Non puoi sfidare te stesso!'
          },
          { quoted: message }
        );

        return;
      }

      /*
       * Crea la partita
       */

      const board =
        Array(9).fill(null);

      const game = {
        type: 'tris',
        chat,
        playerX: player,
        playerO: opponent,
        board,
        turn: 'X'
      };

      const sent =
        await sock.sendMessage(
          chat,
          {
            text:
`⭕ *TRIS — J.A.R.V.I.S 5.0*

❌ ${mentionFromJid(player)}
🔵 ${mentionFromJid(opponent)}

══════ •⊰✧⊱• ══════

${getBoardText(board)}

══════ •⊰✧⊱• ══════

🎯 *Inizia:* ${mentionFromJid(player)}

💡 *Scegli una casella:*

↖️ 1   ⬆️ 2   ↗️ 3
⬅️ 4   ⏺️ 5   ➡️ 6
↙️ 7   ⬇️ 8   ↘️ 9

👉 *.tris 1-9*`,
            mentions: [
              player,
              opponent
            ]
          }
        );

      /*
       * IMPORTANTE:
       * registerGame vuole il message key,
       * non l'intero WebMessageInfo.
       */

      registerGame(
        sent?.key,
        game
      );
    },
    {
      permission: 'USER'
    }
  );
}
