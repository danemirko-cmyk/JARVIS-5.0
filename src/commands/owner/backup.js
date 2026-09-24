import fs from 'node:fs';
import path from 'node:path';

import { config } from '../../utils/config.js';

export function registerBackupCommand(registerCommand) {
  registerCommand(
    'backup',
    async ({ sock, chat }) => {

      try {

        const databasePath =
          path.resolve(
            config.database.path
          );

        if (
          !fs.existsSync(databasePath)
        ) {

          await sock.sendMessage(chat, {
            text:
              '❌ *BACKUP*\n\n' +
              'Database non trovato.'
          });

          return;
        }


        const backupDirectory =
          path.resolve(
            'backups'
          );

        if (
          !fs.existsSync(
            backupDirectory
          )
        ) {
          fs.mkdirSync(
            backupDirectory,
            {
              recursive: true
            }
          );
        }


        const now =
          new Date();

        const timestamp =
          now
            .toISOString()
            .replace(
              /[:.]/g,
              '-'
            );


        const backupPath =
          path.join(
            backupDirectory,
            `jarvis-${timestamp}.db`
          );


        fs.copyFileSync(
          databasePath,
          backupPath
        );


        const stats =
          fs.statSync(
            backupPath
          );


        await sock.sendMessage(chat, {
          document:
            fs.readFileSync(
              backupPath
            ),
          mimetype:
            'application/x-sqlite3',
          fileName:
            path.basename(
              backupPath
            ),
          caption:
            '💾 *BACKUP COMPLETATO*\n\n' +
            '✅ Database J.A.R.V.I.S 5.0 salvato correttamente.\n\n' +
            `📦 Dimensione: ${Math.round(stats.size / 1024)} KB`
        });

      } catch (error) {

        console.error(
          '[BACKUP] Errore:',
          error
        );

        await sock.sendMessage(chat, {
          text:
            '❌ *BACKUP FALLITO*\n\n' +
            `Errore: ${error.message}`
        });
      }
    },
    {
      permission: 'OWNER'
    }
  );
}
