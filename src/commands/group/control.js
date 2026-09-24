import {
  getGroupSettings,
  toggleGroupFunction
} from '../../services/groupFunctions.js';

export function registerControlCommand(
  registerCommand
) {
  registerCommand(
    'control',
    async ({
      sock,
      chat
    }) => {

      if (!chat?.endsWith('@g.us')) {
        await sock.sendMessage(
          chat,
          {
            text:
              '⚠️ Questa funzione è disponibile solo nei gruppi.'
          }
        );

        return;
      }

      const enabled =
        toggleGroupFunction(
          chat,
          'control'
        );

      if (enabled === null) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Errore durante la modifica di CONTROL.'
          }
        );

        return;
      }

      await sock.sendMessage(
        chat,
        {
          text:
            `⚙️ *CONTROL*\n\n` +
            `Stato: ${enabled ? '🟢 ON' : '🔴 OFF'}\n\n` +
            (
              enabled
                ? `🛡️ JARVIS controllerà automaticamente spam di comandi e bestemmie.\n` +
                  `⏱️ Blocco automatico: 2 ore.`
                : `🔕 Il controllo automatico è stato disattivato.`
            )
        }
      );
    },
    {
      permission: 'ADMIN'
    }
  );
}
