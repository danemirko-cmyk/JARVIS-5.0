export function registerDebugTagCommand(registerCommand) {
  registerCommand(
    'debugtag',
    async ({ sock, chat, message }) => {
      try {
        if (!chat?.endsWith('@g.us')) {
          await sock.sendMessage(
            chat,
            {
              text: '❌ Questo comando funziona solo nei gruppi.'
            },
            {
              quoted: message
            }
          );

          return;
        }

        console.log('');
        console.log('========== DEBUG GROUP METADATA ==========');
        console.log('[DEBUG] CHAT:', chat);

        const metadata =
          await sock.groupMetadata(chat);

        console.log(
          '[DEBUG] addressingMode:',
          metadata?.addressingMode
        );

        console.log(
          '[DEBUG] subject:',
          metadata?.subject
        );

        console.log(
          '[DEBUG] participants:',
          metadata?.participants?.length
        );

        const participants =
          metadata?.participants || [];

        for (
          let i = 0;
          i < Math.min(participants.length, 10);
          i++
        ) {
          const participant =
            participants[i];

          console.log('');
          console.log(
            `[DEBUG] PARTICIPANTE ${i + 1}`
          );

          console.log(
            JSON.stringify(
              participant,
              null,
              2
            )
          );
        }

        console.log('');
        console.log(
          '========== FINE DEBUG =========='
        );

        await sock.sendMessage(
          chat,
          {
            text:
              `🔎 *DEBUGTAG*\n\n` +
              `Modalità gruppo: ${metadata?.addressingMode || 'undefined'}\n` +
              `Partecipanti: ${participants.length}\n\n` +
              `Controlla il terminale di JARVIS.`
          },
          {
            quoted: message
          }
        );
      } catch (error) {
        console.error(
          '[DEBUGTAG] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              `❌ DEBUGTAG\n\n${error.message}`
          },
          {
            quoted: message
          }
        );
      }
    },
    {
      permission: 'USER'
    }
  );
}
