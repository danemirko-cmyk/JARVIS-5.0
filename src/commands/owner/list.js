export function registerListCommand(registerCommand) {
  registerCommand(
    'list',
    async ({ sock, chat }) => {

      try {
        const groups =
          await sock.groupFetchAllParticipating();

        const entries =
          Object.values(groups || {});

        if (!entries.length) {
          await sock.sendMessage(chat, {
            text:
              '📋 JARVIS non è attualmente presente in nessun gruppo.'
          });

          return;
        }

        const lines = [];

        for (
          let i = 0;
          i < entries.length;
          i++
        ) {
          const group =
            entries[i];

          let link =
            '🔒 Link non disponibile';

          try {
            if (
              group?.id &&
              group.id.endsWith('@g.us')
            ) {
              const code =
                await sock.groupInviteCode(
                  group.id
                );

              if (code) {
                link =
                  `https://chat.whatsapp.com/${code}`;
              }
            }
          } catch {
            /*
             * Il bot potrebbe non essere admin
             * e quindi non poter ottenere il link.
             */
          }

          lines.push(
            `${i + 1}. *${group?.subject || 'Gruppo senza nome'}*\n` +
            `   👥 ${group?.size || group?.participants?.length || '?'} membri\n` +
            `   ${link}`
          );
        }

        await sock.sendMessage(chat, {
          text:
            `📋 *GRUPPI DI JARVIS*\n\n` +
            lines.join('\n\n')
        });

      } catch (error) {
        console.error(
          '[LIST] Errore:',
          error
        );

        await sock.sendMessage(chat, {
          text:
            '⚠️ Non riesco a recuperare la lista dei gruppi.'
        });
      }
    },
    {
      permission: 'OWNER'
    }
  );
}
