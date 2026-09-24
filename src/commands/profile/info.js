import { prepare } from '../../database/database.js';

function normalizeJid(jid) {
  return String(jid || '')
    .replace(/:\d+(?=@)/, '');
}

function getPhone(jid) {
  return normalizeJid(jid)
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

function getMentionedJid(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  const mentioned =
    context?.mentionedJid;

  if (
    !Array.isArray(mentioned) ||
    !mentioned.length
  ) {
    return null;
  }

  return normalizeJid(
    mentioned[0]
  );
}

function getQuotedJid(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  if (!context?.participant) {
    return null;
  }

  return normalizeJid(
    context.participant
  );
}

function getTargetJid(
  message,
  sender
) {
  const mentioned =
    getMentionedJid(message);

  if (mentioned) {
    return mentioned;
  }

  const quoted =
    getQuotedJid(message);

  if (quoted) {
    return quoted;
  }

  return normalizeJid(sender);
}

function getUserByJid(jid) {
  try {
    const phone =
      getPhone(jid);

    if (!phone) {
      return null;
    }

    return prepare(`
      SELECT *
      FROM users
      WHERE phone = ?
      LIMIT 1
    `).get(phone) || null;

  } catch {
    return null;
  }
}

function getEconomy(userId) {
  try {
    return prepare(`
      SELECT *
      FROM economy
      WHERE user_id = ?
      LIMIT 1
    `).get(userId) || null;
  } catch {
    return null;
  }
}

function getBank(userId) {
  try {
    return prepare(`
      SELECT *
      FROM bank
      WHERE user_id = ?
      LIMIT 1
    `).get(userId) || null;
  } catch {
    return null;
  }
}

function getAchievements(userId) {
  try {
    const result =
      prepare(`
        SELECT COUNT(*) AS total
        FROM achievements
        WHERE user_id = ?
      `).get(userId);

    return Number(
      result?.total || 0
    );

  } catch {
    return 0;
  }
}

function getInstagram(userId) {
  try {
    const result =
      prepare(`
        SELECT username
        FROM instagram
        WHERE user_id = ?
        LIMIT 1
      `).get(userId);

    if (!result?.username) {
      return null;
    }

    return String(
      result.username
    )
      .replace(/^@/, '')
      .trim();

  } catch {
    return null;
  }
}

function createXpBar(xp) {
  const levelXp = 1000;

  const current =
    Number(xp || 0) % levelXp;

  const percentage =
    Math.floor(
      (current / levelXp) * 100
    );

  const totalBlocks = 10;

  const filled =
    Math.round(
      (percentage / 100) *
      totalBlocks
    );

  return {
    current,
    percentage,
    bar:
      '▰'.repeat(filled) +
      '▱'.repeat(
        totalBlocks - filled
      )
  };
}

export function registerInfoCommand(
  registerCommand
) {

  registerCommand(
    'info',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targetJid =
        getTargetJid(
          message,
          sender
        );

      const user =
        getUserByJid(
          targetJid
        );

      if (!user) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *J.A.R.V.I.S 5.0*

Non riesco a trovare questo utente nel database.

💡 Invia almeno un messaggio nel gruppo e riprova con *.info*.`
          }
        );

        return;
      }

      const userId =
        Number(user.id);

      const level =
        Number(
          user.level || 1
        );

      const xp =
        Number(
          user.xp || 0
        );

      const coins =
        Number(
          user.coins || 0
        );

      const messages =
        Number(
          user.messages || 0
        );

      const blasphemies =
        Number(
          user.blasphemy_count || 0
        );

      const warns =
        Number(
          user.warns || 0
        );

      const economy =
        getEconomy(userId);

      const bank =
        getBank(userId);

      const achievements =
        getAchievements(userId);

      const instagram =
        getInstagram(userId);

      const bankBalance =
        Number(
          bank?.balance || 0
        );

      const balance =
        economy &&
        economy.balance !== undefined
          ? Number(
              economy.balance || 0
            )
          : coins;

      const xpBar =
        createXpBar(xp);

      const mention =
        `@${getPhone(targetJid)}`;

      const instagramText =
        instagram
          ? `https://instagram.com/${instagram}`
          : 'Non impostato';

      const caption =
`📊 *PROFILO J.A.R.V.I.S 5.0*

══════ •⊰✧⊱• ══════

👤 *${mention}*

⭐ Livello: *${level}*
✨ XP: *${xp}*

${xpBar.bar} ${xpBar.percentage}%
📈 ${xpBar.current}/1000 XP

══════ •⊰✧⊱• ══════

💰 JCoins: *${balance}*
🏦 Banca: *${bankBalance}*

⚠️ Warns: *${warns}*

💬 Messaggi: *${messages}*
🤬 Bestemmie: *${blasphemies}*

🏆 Achievements: *${achievements}*

📸 Instagram:
${instagramText}

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

      let profilePicture = null;

      try {
        profilePicture =
          await sock.profilePictureUrl(
            targetJid,
            'image'
          );
      } catch {
        profilePicture = null;
      }

      const options = {
        mentions: [
          targetJid
        ]
      };

      if (profilePicture) {

        await sock.sendMessage(
          chat,
          {
            image: {
              url: profilePicture
            },
            caption,
            mentions:
              options.mentions
          }
        );

        return;
      }

      await sock.sendMessage(
        chat,
        {
          text: caption,
          mentions:
            options.mentions
        }
      );
    }
  );
}
