import {
  getTargetParticipant,
  participantJid,
  unmuteUser
} from '../../utils/admin.js';

export function registerSmutaCommand(registerCommand) {
  registerCommand(
    'smuta',
    async ({
      sock,
      chat,
      message
    }) => {
      if (!chat.endsWith('@g.us')) {
        await sock.sendMessage(chat, {
          text: '⚠️ Questo comando funziona solo nei gruppi.'
        });
        return;
      }

      const target = await getTargetParticipant(
        sock,
        chat,
        message
      );

      if (!target) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Rispondi al messaggio oppure menziona l’utente.'
        });
        return;
      }

      const targetJid = participantJid(target);

      unmuteUser(
        chat,
        targetJid
      );

      await sock.sendMessage(chat, {
        text:
          `🔊 *UTENTE SMUTATO*\n\n` +
          `👤 @${targetJid.split('@')[0]}`,
        mentions: [targetJid]
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
