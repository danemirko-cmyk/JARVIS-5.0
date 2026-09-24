import { spawn } from 'node:child_process';

export function registerRestartCommand(registerCommand) {

  registerCommand(
    'restart',

    async ({ sock, chat }) => {

      try {

        await sock.sendMessage(chat, {
          text:
            '🔄 *J.A.R.V.I.S 5.0*\n\n' +
            'Riavvio in corso...'
        });


        /*
         * Avviamo una nuova istanza SOLO DOPO
         * che questa è stata chiusa.
         *
         * Il ritardo evita il conflitto WhatsApp
         * che provoca il codice 440.
         */

        const restartCommand =
          'sleep 4; exec node index.js';


        const child =
          spawn(
            'sh',
            [
              '-c',
              restartCommand
            ],
            {
              detached: true,
              stdio: 'ignore',
              cwd: process.cwd(),
              env: process.env
            }
          );


        child.unref();


        /*
         * Chiudiamo questa istanza.
         *
         * Il processo figlio partirà dopo 4 secondi.
         */

        setTimeout(() => {

          process.exit(0);

        }, 1200);


      } catch (error) {

        console.error(
          '[RESTART] Errore:',
          error.message
        );

        try {

          await sock.sendMessage(chat, {
            text:
              '❌ Impossibile riavviare J.A.R.V.I.S 5.0.'
          });

        } catch {}

      }
    },

    {
      permission: 'OWNER'
    }
  );
}
