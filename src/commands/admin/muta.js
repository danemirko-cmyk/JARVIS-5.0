import {
  getTargetParticipant,
  participantJid,
  muteUser,
  isBotAdmin
} from '../../utils/admin.js';

export function registerMutaCommand(registerCommand) {
  registerCommand(
    'muta',
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
            '⚠️ Devo essere amministratore per poter mutare gli utenti.'
        });
        return;
      }

      const targetJid = participantJid(target);

      muteUser(chat, targetJid);

      await sock.sendMessage(chat, {
        text:
          `🔇 *UTENTE MUTATO*\n\n` +
          `👤 @${targetJid.split('@')[0]}\n\n` +
          `Da questo momento i suoi messaggi verranno rimossi.`,
        mentions: [targetJid]
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
