export function registerTwinCommand(registerCommand) {
  registerCommand(
    'twin',
    async ({ sock, chat, message }) => {
      try {
        const context =
          message?.message?.extendedTextMessage?.contextInfo;

        const mentioned =
          context?.mentionedJid || [];

        if (mentioned.length < 1) {
          await sock.sendMessage(
            chat,
            {
              text:
                '👯 *TWIN*\n\n' +
                'Tagga una persona con `.twin @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const target = mentioned[0];

        if (!target) return;

        const percentage =
          Math.floor(Math.random() * 101);

        let result;

        if (percentage >= 95) {
          result =
            '👯 Siete praticamente gemelli separati alla nascita. 😂';
        } else if (percentage >= 80) {
          result =
            '🤝 Amicizia fortissima. Vi capite al volo!';
        } else if (percentage >= 60) {
          result =
            '😎 C’è una bella sintonia tra voi!';
        } else if (percentage >= 40) {
          result =
            '🙂 Amicizia nella norma.';
        } else if (percentage >= 20) {
          result =
            '😭 Uno dei due probabilmente sopporta l’altro.';
        } else {
          result =
            '💀 JARVIS consiglia di non farvi incontrare.';
        }

        const number =
          String(target)
            .split('@')[0]
            .split(':')[0];

        await sock.sendMessage(
          chat,
          {
            text:
`╭━━━━━━━━━━━━━━━━━━━━━━╮
┃      👯 TWIN 👯      ┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

👤 @${number}

🤝 *Compatibilità di amicizia:*
*${percentage}%*

${result}

🤖 JARVIS 5.0`,
            mentions: [target]
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[TWIN]',
          error
        );
      }
    }
  );
}
