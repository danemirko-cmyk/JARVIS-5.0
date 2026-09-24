import {
  getTargetParticipant,
  participantJid,
  isBotAdmin
} from '../../utils/admin.js';

export function registerPromuoviCommand(registerCommand) {
  registerCommand(
    'promuovi',
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

      if (!(await isBotAdmin(sock, chat))) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Devo essere amministratore del gruppo.'
        });
        return;
      }

      const targetJid = participantJid(target);

      await sock.groupParticipantsUpdate(
        chat,
        [targetJid],
        'promote'
      );

      await sock.sendMessage(chat, {
        text:
          `⬆️ @${targetJid.split('@')[0]} è ora amministratore del gruppo.`,
        mentions: [targetJid]
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
