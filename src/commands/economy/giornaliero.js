import {
  getUserByJid,
  getBalance,
  addCoins,
  getRemainingCooldown,
  setCooldown,
  formatCooldown
} from '../../services/economy.js';

const DAILY_REWARD = 100;
const DAILY_COOLDOWN = 24 * 60 * 60;

export function registerGiornalieroCommand(
  registerCommand
) {

  registerCommand(
    'giornaliero',
    async ({
      sock,
      chat,
      sender
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

      const remaining =
        getRemainingCooldown(
          user.id,
          'daily',
          DAILY_COOLDOWN
        );

      if (remaining > 0) {

        await sock.sendMessage(
          chat,
          {
            text:
`⏳ *RICOMPENSA GIORNALIERA*

Hai già ritirato la tua ricompensa.

🕐 Potrai ritirarla nuovamente tra:

*${formatCooldown(remaining)}*

💰 Ricompensa: *${DAILY_REWARD} JCoins*`
          }
        );

        return;
      }

      addCoins(
        user.id,
        DAILY_REWARD
      );

      setCooldown(
        user.id,
        'daily'
      );

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
`🎁 *RICOMPENSA GIORNALIERA*

══════ •⊰✧⊱• ══════

👤 ${mention}

💰 Hai ricevuto:
*+${DAILY_REWARD} JCoins*

💳 Saldo attuale:
*${balance} JCoins*

⏰ Torna tra 24 ore per
una nuova ricompensa!

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
