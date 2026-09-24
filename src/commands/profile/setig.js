import { prepare } from '../../database/database.js';

function getPhone(jid) {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

function getUser(sender) {
  const phone = getPhone(sender);

  return prepare(`
    SELECT id
    FROM users
    WHERE phone = ?
    LIMIT 1
  `).get(phone) || null;
}

function cleanUsername(value) {
  return String(value || '')
    .trim()
    .replace(/^@/, '')
    .replace(
      /^https?:\/\/(www\.)?instagram\.com\//i,
      ''
    )
    .replace(/[/?#].*$/, '')
    .trim();
}

export async function saveInstagram(
  userId,
  username
) {
  const existing =
    prepare(`
      SELECT user_id
      FROM instagram
      WHERE user_id = ?
      LIMIT 1
    `).get(userId);

  if (existing) {

    prepare(`
      UPDATE instagram
      SET
        username = ?,
        updated_at = unixepoch()
      WHERE user_id = ?
    `).run(
      username,
      userId
    );

  } else {

    prepare(`
      INSERT INTO instagram (
        user_id,
        username
      )
      VALUES (?, ?)
    `).run(
      userId,
      username
    );
  }
}

export function registerSetIGCommand(
  registerCommand
) {

  registerCommand(
    'setig',
    async ({
      sock,
      chat,
      sender,
      argumentText
    }) => {

      const user =
        getUser(sender);

      if (!user) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *J.A.R.V.I.S 5.0*

Il tuo profilo non è ancora presente nel database.

Invia prima un messaggio e riprova.`
          }
        );

        return;
      }

      const username =
        cleanUsername(
          argumentText
        );

      if (!username) {

        await sock.sendMessage(
          chat,
          {
            text:
`📸 *INSTAGRAM*

Inserisci il tuo username Instagram.

Esempio:

*.setig @mirko_danesi*

oppure:

*.setig mirko_danesi*`
          }
        );

        return;
      }

      await saveInstagram(
        user.id,
        username
      );

      await sock.sendMessage(
        chat,
        {
          text:
`✅ *INSTAGRAM AGGIORNATO*

📸 Instagram: *@${username}*

Il tuo profilo J.A.R.V.I.S è stato aggiornato.`
        }
      );
    }
  );
}
