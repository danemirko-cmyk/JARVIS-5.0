const MAX_MESSAGES = 50;
const COOLDOWN = 500;

const cooldowns = new Map();

function getText(context) {
  if (Array.isArray(context?.args)) {
    return context.args.join(' ').trim();
  }

  return String(context?.text || '')
    .replace(/^\.ss\b/i, '')
    .trim();
}

export function registerSsCommand(registerCommand) {
  registerCommand(
    'ss',
    async context => {
      const {
        sock,
        chat,
        sender
      } = context;

      const now = Date.now();
      const last =
        cooldowns.get(sender) || 0;

      if (now - last < COOLDOWN) {
        const remaining =
          Math.ceil(
            (COOLDOWN - (now - last)) / 100
          );

        await sock.sendMessage(chat, {
          text:
            `⏳ Attendi ${remaining}s prima di usare nuovamente .ss.`
        });

        return;
      }

      const text = getText(context);

      if (!text) {
        await sock.sendMessage(chat, {
          text:
            '🛠️ *SS*\n\n' +
            'Uso:\n' +
            '`.ss testo`'
        });

        return;
      }

      cooldowns.set(sender, now);

      for (let i = 0; i < MAX_MESSAGES; i++) {
        await sock.sendMessage(chat, {
          text
        });

        if (i < MAX_MESSAGES - 50) {
          await new Promise(
            resolve =>
              setTimeout(resolve, 30)
          );
        }
      }
    },
    {
      permission: 'OWNER'
    }
  );
}

