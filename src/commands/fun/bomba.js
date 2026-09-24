import {
  getMiniGame,
  setMiniGame,
  deleteMiniGame
} from '../../services/miniGames.js';

const CELLS = [
  '🌴',
  '🍀',
  '🍕',
  '🎁',
  '🐸',
  '💎',
  '🍔',
  '🎈',
  '🧸',
  '🚀',
  '🎯',
  '👑'
];

function shuffled(array) {
  return [...array].sort(
    () => Math.random() - 0.5
  );
}

function board(game) {
  return game.cells
    .map((emoji, index) => {
      if (game.revealed.includes(index)) {
        if (index === game.bomb) {
          return '💣';
        }

        return emoji;
      }

      return '❓';
    })
    .map((value, index) =>
      `${index + 1}️⃣ ${value}`
    )
    .join('\n');
}

export function registerBombaCommand(registerCommand) {
  registerCommand(
    'bomba',
    async ({
      sock,
      chat,
      sender,
      args,
      message
    }) => {
      let game =
        getMiniGame(chat);

      /*
       * ==========================
       * NUOVA PARTITA
       * ==========================
       */

      if (!game) {
        const cells =
          shuffled(CELLS);

        const bomb =
          Math.floor(
            Math.random() * cells.length
          );

        game = {
          type: 'bomba',
          cells,
          bomb,
          revealed: [],
          players: new Set(),
          startedBy: sender
        };

        setMiniGame(chat, game);

        await sock.sendMessage(
          chat,
          {
            text:
`💣 *BOMBA — J.A.R.V.I.S 5.0*

Una bomba è nascosta tra queste caselle.

══════ •⊰✧⊱• ══════

${board(game)}

══════ •⊰✧⊱• ══════

🎯 *Come si gioca?*

Tutti possono partecipare.

👉 Scrivi:
*.bomba 1*
*.bomba 2*
...
*.bomba 12*

⚠️ Se trovi la bomba... BOOM 💥

🏆 Vince chi sopravvive più a lungo!`
          },
          { quoted: message }
        );

        return;
      }

      /*
       * ==========================
       * CONTROLLO COMANDO
       * ==========================
       */

      const position =
        Number(args?.[0]);

      if (
        !Number.isInteger(position) ||
        position < 1 ||
        position > 12
      ) {
        await sock.sendMessage(
          chat,
          {
            text:
`❌ Scegli una casella da *1 a 12*.

${board(game)}`
          },
          { quoted: message }
        );

        return;
      }

      const index =
        position - 1;

      /*
       * Casella già aperta
       */

      if (
        game.revealed.includes(index)
      ) {
        await sock.sendMessage(
          chat,
          {
            text:
              '👀 Questa casella è già stata aperta!'
          },
          { quoted: message }
        );

        return;
      }

      game.players.add(sender);

      /*
       * ==========================
       * BOMBA
       * ==========================
       */

      if (index === game.bomb) {
        game.revealed.push(index);

        const survivors =
          game.players.size - 1;

        deleteMiniGame(chat);

        await sock.sendMessage(
          chat,
          {
            text:
`💥 *BOOOOOOM!*

${`@${sender.split('@')[0]}`} ha trovato la bomba! 😂

💣 *GAME OVER*

👥 Partecipanti: *${game.players.size}*
😎 Sopravvissuti: *${Math.max(0, survivors)}*

══════ •⊰✧⊱• ══════

${board(game)}

══════ •⊰✧⊱• ══════

💀 La prossima volta scegli meglio...`,
            mentions: [sender]
          }
        );

        return;
      }

      /*
       * ==========================
       * CASELLA SICURA
       * ==========================
       */

      game.revealed.push(index);

      const remaining =
        game.cells.length -
        game.revealed.length;

      if (remaining <= 0) {
        deleteMiniGame(chat);

        await sock.sendMessage(
          chat,
          {
            text:
`🏆 *BOMBA — VITTORIA!*

Avete aperto tutte le caselle senza trovare la bomba! 😳

${board(game)}

💣 La bomba era nascosta...
ma nessuno è saltato in aria! 😂`
          }
        );

        return;
      }

      await sock.sendMessage(
        chat,
        {
          text:
`✅ *CASSELLA SICURA!*

👤 @${sender.split('@')[0]}
🎁 Hai trovato: ${game.cells[index]}

══════ •⊰✧⊱• ══════

${board(game)}

══════ •⊰✧⊱• ══════

💣 Caselle ancora nascoste: *${remaining}*

👉 Tocca a chiunque voglia rischiare.`,
          mentions: [sender]
        }
      );
    }
  );
}
