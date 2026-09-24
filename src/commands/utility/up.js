import {
  sendChannelButtonMessage
} from '../../utils/channelButton.js';

export function registerUpCommand(registerCommand) {
  registerCommand(
    'up',
    async ({ sock, chat, message }) => {

      const uptime =
        process.uptime();

      const days =
        Math.floor(
          uptime / 86400
        );

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

      const parts = [];

      if (days > 0) {
        parts.push(`${days}g`);
      }

      if (hours > 0 || days > 0) {
        parts.push(`${hours}h`);
      }

      if (
        minutes > 0 ||
        hours > 0 ||
        days > 0
      ) {
        parts.push(`${minutes}m`);
      }

      parts.push(`${seconds}s`);

      const uptimeText =
        parts.join(' ');

      const text =
`🤖 *J.A.R.V.I.S 5.0*

══════ •⊰✧⊱• ══════

🟢 *STATO BOT*

JARVIS è online e operativo.

⏱️ Uptime:
*${uptimeText}*

🟢 WhatsApp:
*ONLINE*

⚡ Sistema:
*OPERATIVO*

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
