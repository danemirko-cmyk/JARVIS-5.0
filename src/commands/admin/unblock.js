import {
  unblockUser
} from '../../services/blockFunctions.js';

function getTargetJid(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  if (context?.mentionedJid?.length) {
    return context.mentionedJid[0];
  }

  if (context?.participant) {
    return context.participant;
  }

  return null;
}

export function registerUnblockCommand(registerCommand) {

  registerCommand(
    'unblock',

    async ({
      sock,
      chat,
      message
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

      const target =
        getTargetJid(message);

      if (!target) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Devi menzionare l\'utente da sbloccare.\n\n' +
              'Esempio:\n' +
              '.unblock @utente'
          }
        );
        return;
      }

      const removed =
        await unblockUser(
          chat,
          target
        );

      if (!removed) {
        await sock.sendMessage(
          chat,
          {
            text:
              `ℹ️ @${target.split('@')[0]} non risulta bloccato.`,
            mentions: [target]
          }
        );
        return;
      }

      await sock.sendMessage(
        chat,
        {
          text:
            `🔓 @${target.split('@')[0]} è stato sbloccato.`,
          mentions: [target]
        }
      );
    },

    {
      permission: 'ADMIN'
    }
  );
}
