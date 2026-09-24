import {
  isBotAdmin
} from '../../utils/admin.js';

export function registerApertoCommand(registerCommand) {
  registerCommand(
    'aperto',
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
            '⚠️ Devo essere amministratore per modificare le impostazioni del gruppo.'
        });
        return;
      }

      await sock.groupSettingUpdate(
        chat,
        'not_announcement'
      );

      await sock.sendMessage(chat, {
        text:
          '🔓 *GRUPPO APERTO*\n\n' +
          '👥 Ora tutti i partecipanti possono scrivere.'
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
