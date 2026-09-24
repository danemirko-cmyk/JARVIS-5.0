import { config } from '../../utils/config.js';

import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerOwnerCommand(registerCommand) {
  registerCommand(
    'owner',
    async ({ sock, chat }) => {

      const ownerNumber =
        config.bot.ownerNumber;

      const ownerJid =
        `${ownerNumber}@s.whatsapp.net`;

      // 📇 Contatto del proprietario
      await sock.sendMessage(chat, {
        contacts: {
          displayName: 'Dada',
          contacts: [
            {
              vcard:
`BEGIN:VCARD
VERSION:3.0
FN:Dada
N:Dada;;;;
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:+${ownerNumber}
NOTE:Proprietario principale di J.A.R.V.I.S 5.0
END:VCARD`
            }
          ]
        }
      });

      // ℹ️ Informazioni del proprietario
      const text =
`👑 *J.A.R.V.I.S 5.0*

══════ •⊰✧⊱• ══════

👤 *Dada*
👑 Proprietario principale

🤖 *J.A.R.V.I.S 5.0*
⚡ Prefisso: *${config.bot.prefix}*

📞 *Contatto ufficiale del proprietario*

══════ •⊰✧⊱• ══════

💬 Per assistenza o informazioni,
contatta direttamente il proprietario.

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text,
        mentions: [ownerJid]
      });
    }
  );
}
