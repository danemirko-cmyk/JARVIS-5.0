const ANSWERS = [
  'Assolutamente sì. 😎',
  'Direi proprio di sì. ✅',
  'Le probabilità sono alte. 👀',
  'Sì, ma non contarci troppo. 🤔',
  'Non posso esserne certo. 🧐',
  'Il futuro è incerto... 🔮',
  'Chiedimelo più tardi. ⏳',
  'Direi di no. ❌',
  'Molto probabilmente no. 💀',
  'Assolutamente no. 😂',
  'JARVIS non approva questa idea. 🤖',
  'Le stelle dicono: riprova. 🌌'
];

export function register8BallCommand(
  registerCommand
) {
  registerCommand(
    '8ball',
    async ({
      sock,
      chat,
      sender,
      argumentText
    }) => {

      const question =
        String(argumentText || '')
          .trim();

      if (!question) {
        await sock.sendMessage(
          chat,
          {
            text:
`🔮 *8 BALL*

Fammi una domanda!

Esempio:

*.8ball Troverò 100 JCoins oggi?*`
          }
        );

        return;
      }

      const answer =
        ANSWERS[
          Math.floor(
            Math.random() *
            ANSWERS.length
          )
        ];

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`🔮 *J.A.R.V.I.S 8 BALL*

══════ •⊰✧⊱• ══════

👤 ${mention}

❓ Domanda:
*${question}*

🔮 Risposta:
*${answer}*

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender
          ]
        }
      );
    }
  );
}
