import { getRegisteredCommands } from '../../handlers/commands.js';
import { config } from '../../utils/config.js';

import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerInfobotCommand(registerCommand) {
  registerCommand(
    'infobot',
    async ({ sock, chat, message }) => {

      const commands =
        getRegisteredCommands();

      const uptime =
        process.uptime();

      const days =
        Math.floor(uptime / 86400);

      const hours =
        Math.floor(
          (uptime % 86400) / 3600
        );

      const minutes =
        Math.floor(
          (uptime % 3600) / 60
        );

      const seconds =
        Math.floor(
          uptime % 60
        );

      const uptimeText =
        days > 0
          ? `${days}g ${hours}h ${minutes}m ${seconds}s`
          : `${hours}h ${minutes}m ${seconds}s`;

      const text =
`🤖 *J.A.R.V.I.S 5.0*

══════ •⊰✧⊱• ══════

📌 *INFORMAZIONI BOT*

🤖 Nome:
*JARVIS 5.0*

📦 Versione:
*5.0.0*

⚙️ Prefisso:
*${config.bot.prefix}*

📚 Comandi registrati:
*${commands.length}*

🟢 Stato:
*ONLINE*

⏱️ Uptime:
*${uptimeText}*

══════ •⊰✧⊱• ══════

👑 *CREATORE*

Dada
*(Mirko)*

👑 Proprietario:
*Dada*

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

      await sendChannelButtonMessage({
        sock,
        chat,
        text,
        quoted: message
      });
    },
    {
      permission: 'USER'
    }
  );
}
