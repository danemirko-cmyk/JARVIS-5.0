export function registerAbbracciaCommand(registerCommand) {
  registerCommand(
    'abbraccia',
    async ({ sock, chat, message, sender }) => {
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
                '🤗 Tagga qualcuno con `.abbraccia @utente`!'
            },
            { quoted: message }
          );
          return;
        }

        const from =
          String(sender || '')
            .split('@')[0]
            .split(':')[0];

        const to =
          String(target)
            .split('@')[0]
            .split(':')[0];

        await sock.sendMessage(
          chat,
          {
            text:
`🤗 *ABBRACCIO JARVIS*

@${from} ha dato un abbraccio a @${to}! 🫂

❤️ Che teneri!`,
            mentions: [
              sender,
              target
            ].filter(Boolean)
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[ABBRACCIA]',
          error
        );
      }
    }
  );
}
