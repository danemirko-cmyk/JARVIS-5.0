const RESULTS = [
  'Testa',
  'Croce'
];

export function registerMonetaCommand(
  registerCommand
) {
  registerCommand(
    'moneta',
    async ({
      sock,
      chat,
      sender
    }) => {

      const result =
        RESULTS[
          Math.floor(
            Math.random() *
            RESULTS.length
          )
        ];

      const emoji =
        result === 'Testa'
          ? '🙂'
          : '🪙';

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`🪙 *LANCIO DELLA MONETA*

══════ •⊰✧⊱• ══════

👤 ${mention}

${emoji} Risultato:
*${result}*

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
