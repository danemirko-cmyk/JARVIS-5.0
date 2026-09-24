import { CHARACTERS } from '../../data/characters.js';

const COOLDOWN = 20 * 60 * 1000;

const cooldowns = new Map();

function cleanJid(jid) {
  if (!jid) return null;

  return String(jid)
    .replace(/:\d+(?=@)/, '');
}

function getNumber(jid) {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0];
}

function getTarget(message, sender) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  const mentioned =
    context?.mentionedJid || [];

  if (mentioned.length > 0) {
    return cleanJid(mentioned[0]);
  }

  const quoted =
    context?.participant;

  if (quoted) {
    return cleanJid(quoted);
  }

  return cleanJid(sender);
}

function getRandomCharacter() {
  return CHARACTERS[
    Math.floor(
      Math.random() * CHARACTERS.length
    )
  ];
}

export function registerCharacterCommand(registerCommand) {
  registerCommand(
    'character',
    async ({
      sock,
      chat,
      message,
      sender
    }) => {

      try {

        const target =
          getTarget(
            message,
            sender
          );

        if (!target) {
          return;
        }

        const now =
          Date.now();

        const lastUse =
          cooldowns.get(target) || 0;

        const remaining =
          COOLDOWN -
          (now - lastUse);

        if (remaining > 0) {

          const minutes =
            Math.ceil(
              remaining / 60000
            );

          await sock.sendMessage(
            chat,
            {
              text:
`⏳ *CHARACTER*

@${getNumber(target)}

Hai già usato `.character`.

🕐 Potrai usarlo di nuovo tra *${minutes} minuti*.

🤖 JARVIS 5.0`,
              mentions: [target]
            },
            { quoted: message }
          );

          return;
        }

        cooldowns.set(
          target,
          now
        );

        const character =
          getRandomCharacter();

        await sock.sendMessage(
          chat,
          {
            text:
`🎭 *JARVIS CHARACTER*

👤 @${getNumber(target)}

🎬 Il personaggio che JARVIS ha scelto per te è...

✨ *${character.name}*

📂 Categoria:
*${character.category}*

🎞️ Universo:
*${character.source}*

🤖 JARVIS ha deciso.
Non puoi contestare il risultato. 😂`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {

        console.error(
          '[CHARACTER]',
          error
        );

      }
    }
  );
}
