import {
  getUserByJid,
  getBalance
} from '../../services/economy.js';

export function registerSaldoCommand(
  registerCommand
) {

  registerCommand(
    'saldo',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const user =
        getUserByJid(sender);

      if (!user) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *J.A.R.V.I.S 5.0*

Il tuo profilo non è ancora presente nel database.

Invia prima un messaggio e riprova.`
          }
        );

        return;
      }

      const balance =
        getBalance(user.id);

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`💰 *PORTAFOGLIO J.A.R.V.I.S*

══════ •⊰✧⊱• ══════

👤 ${mention}

💵 JCoins:
*${balance} JCoins*

══════ •⊰✧⊱• ══════

💡 Usa *.giornaliero* per ricevere
la tua ricompensa giornaliera.

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender
          ]
        }
      );
    }
  );
}
