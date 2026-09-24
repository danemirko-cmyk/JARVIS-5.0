import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerAdminCommand(registerCommand) {
  registerCommand(
    'admin',

    async ({ sock, chat }) => {

      const text =
`🛡️ *J.A.R.V.I.S 5.0*

🛠️ *GESTIONE GRUPPO*

══════ •⊰✧⊱• ══════

• 👢 .kick
• ⚠️ .warn
• ↩️ .unwarn

• 🔇 .muta
• 🔊 .smuta

• ⬆️ .promuovi
• ⬇️ .degrada

• 👑 .admins
• 🔗 .link

• 🗑️ .elimina
• 🔓 .aperto
• 🔒 .chiuso

🛡️ *BLOCCO UTENTI*

• 🚫 .block @utente
• 🔓 .unblock @utente
• 📋 .blocklist

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text
      });
    },

    {
      permission: 'ADMIN'
    }
  );
}
