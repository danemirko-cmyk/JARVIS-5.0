import {
  getBlockedUsers
} from '../../services/blockFunctions.js';

export function registerBlocklistCommand(registerCommand) {

  registerCommand(
    'blocklist',

    async ({
      sock,
      chat
    }) => {

      if (!chat.endsWith('@g.us')) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Questo comando può essere usato solo nei gruppi.'
          }
        );
        return;
      }

      const users =
        await getBlockedUsers(chat);

      if (!users.length) {
        await sock.sendMessage(
          chat,
          {
            text:
              '📋 *BLOCKLIST*\n\nNessun utente bloccato.'
          }
        );
        return;
      }

      const lines =
        users.map(
          (user, index) => {

            const number =
              user.user_jid
                .split('@')[0];

            let duration =
              'permanente';

            if (user.expires_at) {

              const remaining =
                Math.max(
                  0,
                  user.expires_at -
                  Date.now()
                );

              const minutes =
                Math.ceil(
                  remaining /
                  60000
                );

              duration =
                `${minutes} min`;
            }

            return (
              `${index + 1}. @${number} — ${duration}`
            );
          }
        );

      const mentions =
        users.map(
          user => user.user_jid
        );

      await sock.sendMessage(
        chat,
        {
          text:
            '📋 *BLOCKLIST*\n\n' +
            lines.join('\n'),

          mentions
        }
      );
    },

    {
      permission: 'ADMIN'
    }
  );
}
