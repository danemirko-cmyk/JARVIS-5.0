import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerProprietarioCommand(registerCommand) {

  registerCommand(
    'proprietario',

    async ({
      sock,
      chat
    }) => {

      const text =
`👤 *J.A.R.V.I.S 5.0*

👑 *COMANDI PROPRIETARIO*

══════ •⊰✧⊱• ══════

• ➕ .addowner
• ➖ .delowner
• 📢 .broadcast
• 🔄 .restart
• 🛑 .shutdown
• 📝 .setprefix
• 🤖 .setmodel
• 👑 .god
• 📊 .stats
• 💾 .backup
• 🛠️ .ss
• 🛡️ .dox
• 🚫 .ban
• 💻 .hack
• 📦 .amz
• 📋 .list
• 🤖 .bot
• 📎 .list

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text
      });
    },

    {
      permission: 'OWNER'
    }
  );
}
