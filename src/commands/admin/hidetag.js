export function registerHidetagCommand(registerCommand) {
  registerCommand(
    'hidetag',
    async ({
      sock,
      message,
      chat,
      args,
      argumentText,
      isGroup
    }) => {

      if (!isGroup) {
        await sock.sendMessage(
          chat,
          {
            text: '❌ Questo comando può essere usato solo nei gruppi.'
          },
          {
            quoted: message
          }
        );

        return;
      }

      const text =
        String(
          argumentText ||
          (Array.isArray(args)
            ? args.join(' ')
            : '')
        ).trim();

      if (!text) {
        await sock.sendMessage(
          chat,
          {
            text: '❌ Usa: `.hidetag <messaggio>`'
          },
          {
            quoted: message
          }
        );

        return;
      }

      try {
        const metadata =
          await sock.groupMetadata(chat);

        const participants =
          metadata?.participants || [];

        const mentions =
          participants
            .map(participant =>
              participant?.id ||
              participant?.jid ||
              participant?.phoneNumber ||
              participant?.lid
            )
            .filter(Boolean);

        if (!mentions.length) {
          await sock.sendMessage(
            chat,
            {
              text: '❌ Non riesco a recuperare i partecipanti del gruppo.'
            },
            {
              quoted: message
            }
          );

          return;
        }

        await sock.sendMessage(
          chat,
          {
            text,
            mentions
          },
          {
            quoted: message
          }
        );

        console.log(
          `[HIDETAG] Messaggio inviato con ${mentions.length} menzioni.`
        );

      } catch (error) {
        console.error(
          '❌ Errore .hidetag:',
          error
        );

        try {
          await sock.sendMessage(
            chat,
            {
              text:
                '❌ Si è verificato un errore durante il hidetag.'
            },
            {
              quoted: message
            }
          );
        } catch (sendError) {
          console.error(
            '❌ Errore invio errore .hidetag:',
            sendError
          );
        }
      }
    },
    {
      permission: 'ADMIN',
      description:
        'Invia un messaggio menzionando tutti i membri del gruppo'
    }
  );
}
