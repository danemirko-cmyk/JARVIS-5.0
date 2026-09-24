import {
  getMiniGame,
  setMiniGame,
  deleteMiniGame
} from '../../services/miniGames.js';

export function registerIndovinaNumeroCommand(
  registerCommand
) {
  registerCommand(
    'indovina',
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
       * =================================
       * AVVIO
       * =================================
       */

      if (
        !game &&
        String(args?.[0] || '')
          .toLowerCase() === 'numero'
      ) {
        const number =
          Math.floor(
            Math.random() * 100
          ) + 1;

        game = {
          type: 'indovina-numero',
          number,
          attempts: 0,
          players: new Set()
        };

        setMiniGame(chat, game);

        await sock.sendMessage(
          chat,
          {
            text:
`🔢 *INDOVINA IL NUMERO*

Ho scelto un numero da *1 a 100*.

══════ •⊰✧⊱• ══════

🎯 Tutti possono partecipare.

👉 Scrivi:
*.indovina 50*

🤖 Io ti dirò:
⬆️ troppo basso
⬇️ troppo alto
🎯 corretto

🏆 Chi lo trova vince!`
          },
          { quoted: message }
        );

        return;
      }

      /*
       * =================================
       * NESSUNA PARTITA
       * =================================
       */

      if (!game) {
        await sock.sendMessage(
          chat,
          {
            text:
`🔢 *INDOVINA IL NUMERO*

Prima devi iniziare una partita.

👉 Scrivi:
*.indovina numero*`
          },
          { quoted: message }
        );

        return;
      }

      /*
       * =================================
       * CONTROLLO TIPO
       * =================================
       */

      if (
        game.type !==
        'indovina-numero'
      ) {
        return;
      }

      /*
       * =================================
       * TENTATIVO
       * =================================
       */

      const guess =
        Number(args?.[0]);

      if (
        !Number.isInteger(guess) ||
        guess < 1 ||
        guess > 100
      ) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Inserisci un numero intero da *1 a 100*.'
          },
          { quoted: message }
        );

        return;
      }

      game.players.add(sender);
      game.attempts++;

      /*
       * =================================
       * CORRETTO
       * =================================
       */

      if (
        guess === game.number
      ) {
        deleteMiniGame(chat);

        await sock.sendMessage(
          chat,
          {
            text:
`🎯 *NUMERO INDOVINATO!*

🏆 Complimenti @${sender.split('@')[0]}!

══════ •⊰✧⊱• ══════

🔢 Numero:
*${game.number}*

🎯 Tentativi totali:
*${game.attempts}*

👥 Partecipanti:
*${game.players.size}*`,
            mentions: [sender]
          }
        );

        return;
      }

      /*
       * =================================
       * SUGGERIMENTO
       * =================================
       */

      const hint =
        guess < game.number
          ? '⬆️ *Troppo basso!*'
          : '⬇️ *Troppo alto!*';

      const difference =
        Math.abs(
          game.number - guess
        );

      let extra = '';

      if (difference <= 5) {
        extra =
          '\n🔥 Ci sei vicinissimo!';
      } else if (
        difference <= 15
      ) {
        extra =
          '\n👀 Ci stai andando vicino...';
      }

      await sock.sendMessage(
        chat,
        {
          text:
`🔢 *INDOVINA IL NUMERO*

${hint}${extra}

🎯 Tentativo:
*${guess}*

👤 @${sender.split('@')[0]}

💡 Riprova con:
*.indovina numero* per una nuova partita oppure
*.indovina <numero>* per continuare.`,
          mentions: [sender]
        }
      );
    }
  );
}
