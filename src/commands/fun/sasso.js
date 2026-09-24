const MOVES = {
  sasso: '🪨',
  carta: '📄',
  forbici: '✂️'
};

const ALIASES = {
  sasso: 'sasso',
  pietra: 'sasso',
  carta: 'carta',
  forbici: 'forbici',
  forbice: 'forbici'
};

function getWinner(
  player,
  bot
) {
  if (player === bot) {
    return 'pareggio';
  }

  if (
    (player === 'sasso' &&
      bot === 'forbici') ||
    (player === 'carta' &&
      bot === 'sasso') ||
    (player === 'forbici' &&
      bot === 'carta')
  ) {
    return 'vittoria';
  }

  return 'sconfitta';
}

export function registerSassoCommand(
  registerCommand
) {
  registerCommand(
    'sasso',
    async ({
      sock,
      chat,
      sender,
      argumentText
    }) => {

      const input =
        String(argumentText || '')
          .trim()
          .toLowerCase();

      const player =
        ALIASES[input];

      if (!player) {
        await sock.sendMessage(
          chat,
          {
            text:
`✊ *SASSO, CARTA O FORBICI*

Scegli una mossa:

🪨 *sasso*
📄 *carta*
✂️ *forbici*

Esempio:

*.sasso sasso*`
          }
        );

        return;
      }

      const choices =
        Object.keys(MOVES);

      const bot =
        choices[
          Math.floor(
            Math.random() *
            choices.length
          )
        ];

      const result =
        getWinner(
          player,
          bot
        );

      let resultText;
      let emoji;

      if (result === 'vittoria') {
        resultText =
          'HAI VINTO! 🎉';
        emoji = '🏆';
      } else if (
        result === 'sconfitta'
      ) {
        resultText =
          'HAI PERSO! 😂';
        emoji = '💀';
      } else {
        resultText =
          'PAREGGIO! 🤝';
        emoji = '🤝';
      }

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`✊ *SASSO, CARTA O FORBICI*

══════ •⊰✧⊱• ══════

👤 ${mention}

Tu:
${MOVES[player]} *${player}*

JARVIS:
${MOVES[bot]} *${bot}*

${emoji} *${resultText}*

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender
          ]
        }
      );
    }
  );
}
