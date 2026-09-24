export function registerBacioCommand(registerCommand) {
  registerCommand(
    'bacio',
    async ({ sock, chat, message, sender }) => {
      try {
        const context =
          message?.message?.extendedTextMessage?.contextInfo;

        const mentioned =
          context?.mentionedJid || [];

        let target =
          mentioned[0] ||
          context?.participant;

        if (!target) {
          await sock.sendMessage(
            chat,
            {
              text:
                '💋 Tagga qualcuno con `.bacio @utente`!'
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
`💋 *BACINO JARVIS*

@${from} ha dato un bacino a @${to}! 😘

💕 Che dolcezza!`,
            mentions: [
              sender,
              target
            ].filter(Boolean)
          },
          { quoted: message }
        );

      } catch (error) {
        console.error(
          '[BACIO]',
          error
        );
      }
    }
  );
}
