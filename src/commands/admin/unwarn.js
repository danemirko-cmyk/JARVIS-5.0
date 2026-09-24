import { prepare } from '../../database/database.js';

import {
  getTargetParticipant,
  participantJid,
  getUserFromJid
} from '../../utils/admin.js';

export function registerUnwarnCommand(registerCommand) {
  registerCommand(
    'unwarn',
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
          text: '⚠️ Utente non trovato nel database.'
        });
        return;
      }

      const newWarns =
        Math.max(
          0,
          Number(user.warns || 0) - 1
        );

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

      await sock.sendMessage(chat, {
        text:
          `↩️ *WARN RIMOSSO*\n\n` +
          `👤 @${targetJid.split('@')[0]}\n` +
          `📛 Avvertimenti: *${newWarns}/3*`,
        mentions: [targetJid]
      });
    },
    {
      permission: 'ADMIN'
    }
  );
}
