import {
  blockUser
} from '../../services/blockFunctions.js';

import {
  isGroupAdmin
} from '../../services/groupFunctions.js';

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

export function registerBlockCommand(registerCommand) {

  registerCommand(
    'block',

    async ({
      sock,
      chat,
      message
    }) => {

      if (!chat.endsWith('@g.us')) {
        await sock.sendMessage(
          chat,
          {
            text: '❌ Questo comando può essere usato solo nei gruppi.'
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
              '❌ Devi menzionare l\'utente da bloccare.\n\n' +
              'Esempio:\n' +
              '.block @utente'
          }
        );
        return;
      }

      const admin =
        await isGroupAdmin(
          sock,
          chat,
          target
        );

      if (admin) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non puoi bloccare un amministratore.'
          }
        );
        return;
      }

      await blockUser(
        chat,
        target,
        null,
        'manual'
      );

      await sock.sendMessage(
        chat,
        {
          text:
            `🚫 @${target.split('@')[0]} è stato bloccato dal gruppo.`,
          mentions: [target]
        }
      );
    },

    {
      permission: 'ADMIN'
    }
  );
}
