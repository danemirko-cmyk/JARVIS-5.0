function randomDice() {
  return Math.floor(
    Math.random() * 6
  ) + 1;
}

export function registerDadoCommand(
  registerCommand
) {
  registerCommand(
    'dado',
    async ({
      sock,
      chat,
      sender
    }) => {

      const result =
        randomDice();

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`🎲 *LANCIO DEL DADO*

══════ •⊰✧⊱• ══════

👤 ${mention}

🎲 Risultato:
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
