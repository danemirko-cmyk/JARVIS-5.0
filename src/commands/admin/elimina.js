export function registerEliminaCommand(registerCommand) {
  registerCommand(
    'elimina',
    async ({
      sock,
      chat,
      message
    }) => {
      if (!chat.endsWith('@g.us')) {
        await sock.sendMessage(chat, {
          text: '⚠️ Questo comando funziona solo nei gruppi.'
        });
        return;
      }

      const contextInfo =
        message?.message?.extendedTextMessage?.contextInfo ||
        {};

      const stanzaId =
        contextInfo?.stanzaId;

      const participant =
        contextInfo?.participant;

      if (!stanzaId || !participant) {
        await sock.sendMessage(chat, {
          text:
            '⚠️ Devi rispondere al messaggio che vuoi eliminare.'
        });
        return;
      }

      await sock.sendMessage(
        chat,
        {
          delete: {
            remoteJid: chat,
            fromMe: false,
            id: stanzaId,
            participant
          }
        }
      );
    },
    {
      permission: 'ADMIN'
    }
  );
}
