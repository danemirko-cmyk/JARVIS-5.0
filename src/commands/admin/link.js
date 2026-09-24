import {
  isBotAdmin
} from '../../utils/admin.js';

export function registerLinkCommand(registerCommand) {
  registerCommand(
    'link',
    async ({
      sock,
      chat
    }) => {
      if (!chat.endsWith('@g.us')) {
        await sock.sendMessage(chat, {
          text: '⚠️ Questo comando funziona solo nei gruppi.'
        });
        return;
      }

      if (!(await isBotAdmin(sock, chat))) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Devo essere amministratore per ottenere il link del gruppo.'
        });
        return;
      }

      try {
        const code =
          await sock.groupInviteCode(chat);

        await sock.sendMessage(chat, {
          text:
            `🔗 *LINK DEL GRUPPO*\n\n` +
            `https://chat.whatsapp.com/${code}`
        });
      } catch (error) {
        throw error;
      }
    },
    {
      permission: 'ADMIN'
    }
  );
}
