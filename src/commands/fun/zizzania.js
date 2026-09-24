const MESSAGGI = [
  'secondo JARVIS parla troppo alle spalle dell’altro 😂',
  'uno dei due ha detto che l’altro non sa giocare a niente 💀',
  'uno dei due pensa di essere molto più simpatico dell’altro 😭',
  'uno dei due ha detto che l’altro arriva sempre in ritardo 😂',
  'uno dei due secondo JARVIS ruba sempre le patatine 🍟',
  'uno dei due pensa di essere il preferito del gruppo 👀',
  'uno dei due ha detto che l’altro non capisce mai niente 🤡',
  'uno dei due probabilmente cambierebbe squadra per una pizza 🍕',
  'uno dei due ha detto che l’altro è troppo competitivo 🎮',
  'uno dei due pensa di avere sempre ragione 😭',
  'JARVIS sospetta una rivalità segreta tra questi due 👀',
  'uno dei due ha appena ricevuto un voto molto basso da JARVIS 😂'
];

export async function registerZizzaniaCommand(registerCommand) {
  registerCommand(
    'zizzania',
    async ({ sock, chat, message }) => {
      try {
        if (!chat.endsWith('@g.us')) {
          await sock.sendMessage(
            chat,
            {
              text:
                '😂 `.zizzania` funziona nei gruppi.'
            },
            { quoted: message }
          );
          return;
        }

        const metadata =
          await sock.groupMetadata(chat);

        const participants =
          (metadata?.participants || [])
            .map(p =>
              p.id ||
              p.lid ||
              p.phoneNumber
            )
            .filter(Boolean);

        if (participants.length < 2) {
          await sock.sendMessage(
            chat,
            {
              text:
                '❌ Non ci sono abbastanza persone.'
            },
            { quoted: message }
          );
          return;
        }

        const shuffled =
          [...participants]
            .sort(
              () => Math.random() - 0.5
            );

        const first =
          shuffled[0];

        const second =
          shuffled[1];

        const phrase =
          MESSAGGI[
            Math.floor(
              Math.random() *
              MESSAGGI.length
            )
          ];

        await sock.sendMessage(
          chat,
          {
            text:
`🔥 *JARVIS ZIZZANIA*

👤 @${String(first).split('@')[0]}
👤 @${String(second).split('@')[0]}

🗣️ JARVIS ha scoperto che ${phrase}

⚠️ Ovviamente è tutto inventato.
😂 NON LITIGATE DAVVERO!`,
            mentions: [
              first,
              second
            ]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[ZIZZANIA]',
          error
        );
      }
    }
  );
}
