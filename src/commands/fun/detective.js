const ACCUSE = [
  'ha rubato l’ultima patatina 🍟',
  'nasconde un segreto enorme 👀',
  'è probabilmente il colpevole del caos nel gruppo 💀',
  'ha mangiato qualcosa che non era suo 😂',
  'sta tramando qualcosa da almeno 3 giorni 🕵️',
  'potrebbe essere responsabile della sparizione delle merendine 🍫',
  'ha un livello sospetto di innocenza 😭',
  'è stato visto vicino alla scena del crimine 👀',
  'potrebbe sapere più di quanto ammetta 🤨',
  'secondo JARVIS ha sicuramente un piano segreto 🤖'
];

export function registerDetectiveCommand(registerCommand) {
  registerCommand(
    'detective',
    async ({ sock, chat, message }) => {
      try {
        const context =
          message?.message?.extendedTextMessage?.contextInfo;

        const mentioned =
          context?.mentionedJid || [];

        const target =
          mentioned[0] ||
          context?.participant;

        if (!target) {
          await sock.sendMessage(
            chat,
            {
              text:
                '🕵️ Usa `.detective @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const accusation =
          ACCUSE[
            Math.floor(
              Math.random() *
              ACCUSE.length
            )
          ];

        const probability =
          Math.floor(
            Math.random() * 101
          );

        const number =
          String(target)
            .split('@')[0]
            .split(':')[0];

        await sock.sendMessage(
          chat,
          {
            text:
`🕵️ *JARVIS DETECTIVE*

🔎 Soggetto:
@${number}

📂 Accusa:
${accusation}

📊 Livello di sospetto:
*${probability}%*

🕵️ Indagine completamente scientifica...
😂 O forse no.`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[DETECTIVE]',
          error
        );
      }
    }
  );
}
