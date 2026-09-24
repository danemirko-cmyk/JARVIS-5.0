import {
  getGroupMetadata,
  participantJid
} from '../../utils/admin.js';

export function registerAdminsCommand(registerCommand) {
  registerCommand(
    'admins',
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

      const metadata =
        await getGroupMetadata(
          sock,
          chat
        );

      if (!metadata) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Non riesco a recuperare le informazioni del gruppo.'
        });
        return;
      }

      const admins =
        (metadata.participants || [])
          .filter(participant =>
            participant?.admin === 'admin' ||
            participant?.admin === 'superadmin' ||
            participant?.isAdmin === true ||
            participant?.isSuperAdmin === true
          );

      if (!admins.length) {
        await sock.sendMessage(chat, {
          text: '🛡️ Nessun amministratore trovato.'
        });
        return;
      }

      const mentions =
        admins
          .map(participantJid)
          .filter(Boolean);

      let text =
        `🛡️ *AMMINISTRATORI*\n\n`;

      admins.forEach((admin, index) => {
        const jid = participantJid(admin);

        if (!jid) {
          return;
        }

        const role =
          admin.admin === 'superadmin' ||
          admin.isSuperAdmin === true
            ? '👑'
            : '🛡️';

        text +=
          `${role} ${index + 1}. @${jid.split('@')[0]}\n`;
      });

      await sock.sendMessage(chat, {
        text,
        mentions
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
