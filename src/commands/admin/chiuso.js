import {
  isBotAdmin
} from '../../utils/admin.js';

export function registerChiusoCommand(registerCommand) {
  registerCommand(
    'chiuso',
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
        'announcement'
      );

      await sock.sendMessage(chat, {
        text:
          '🔒 *GRUPPO CHIUSO*\n\n' +
          '🛡️ Ora possono scrivere solamente gli amministratori.'
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
