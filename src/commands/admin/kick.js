import {
  getTargetParticipant,
  participantJid,
  isSameParticipant,
  isBotAdmin
} from '../../utils/admin.js';

export function registerKickCommand(registerCommand) {
  registerCommand(
    'kick',
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
            '⚠️ Devi rispondere al messaggio della persona oppure menzionarla.'
        });
        return;
      }

      if (!(await isBotAdmin(sock, chat))) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Non sono amministratore del gruppo, quindi non posso rimuovere utenti.'
        });
        return;
      }

      const targetJid = participantJid(target);

      const botIds = [
        sock?.user?.id,
        sock?.user?.lid
      ].filter(Boolean);

      if (
        botIds.some(id =>
          isSameParticipant(id, targetJid)
        )
      ) {
        await sock.sendMessage(chat, {
          text: '🤖 Non posso rimuovere me stesso.'
        });
        return;
      }

      try {
        await sock.groupParticipantsUpdate(
          chat,
          [targetJid],
          'remove'
        );

        await sock.sendMessage(chat, {
          text: `👢 Utente rimosso dal gruppo.\n\n👤 @${targetJid.split('@')[0]}`,
          mentions: [targetJid]
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
