import { prepare } from '../../database/database.js';

import {
  getTargetParticipant,
  participantJid,
  getUserFromJid
} from '../../utils/admin.js';

export function registerWarnCommand(registerCommand) {
  registerCommand(
    'warn',
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
            '⚠️ Rispondi al messaggio dell’utente oppure menzionalo.'
        });
        return;
      }

      const targetJid = participantJid(target);
      const user = getUserFromJid(targetJid);

      if (!user) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Questo utente non è ancora registrato nel database.'
        });
        return;
      }

      const newWarns =
        Number(user.warns || 0) + 1;

      prepare(`
        UPDATE users
        SET
          warns = ?,
          updated_at = unixepoch()
        WHERE id = ?
      `).run(
        newWarns,
        user.id
      );

      let text =
        `⚠️ *WARN*\n\n` +
        `👤 @${targetJid.split('@')[0]}\n` +
        `📛 Avvertimenti: *${newWarns}/3*`;

      if (newWarns >= 3) {
        text +=
          '\n\n🚨 Ha raggiunto 3 avvertimenti.';
      }

      await sock.sendMessage(chat, {
        text,
        mentions: [targetJid]
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
