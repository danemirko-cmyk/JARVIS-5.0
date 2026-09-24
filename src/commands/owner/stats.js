import { prepare } from '../../database/database.js';

export function registerStatsCommand(registerCommand) {

  registerCommand(
    'stats',
    async ({
      sock,
      chat
    }) => {

      try {

        /* =================================================
           UTENTI
        ================================================= */

        const users =
          prepare(`
            SELECT
              COUNT(*) AS total
            FROM users
          `).get();


        /* =================================================
           MESSAGGI
        ================================================= */

        const messages =
          prepare(`
            SELECT
              COALESCE(
                SUM(messages),
                0
              ) AS total
            FROM users
          `).get();


        /* =================================================
           BESTEMMIE
        ================================================= */

        const blasphemies =
          prepare(`
            SELECT
              COALESCE(
                SUM(blasphemy_count),
                0
              ) AS total
            FROM users
          `).get();


        /* =================================================
           GRUPPI
        ================================================= */

        const groups =
          prepare(`
            SELECT
              COUNT(*) AS total
            FROM groups
          `).get();


        /* =================================================
           XP
        ================================================= */

        const xp =
          prepare(`
            SELECT
              COALESCE(
                SUM(total_xp),
                0
              ) AS total
            FROM xp
          `).get();


        /* =================================================
           MONETE
        ================================================= */

        const coins =
          prepare(`
            SELECT
              COALESCE(
                SUM(coins),
                0
              ) AS total
            FROM users
          `).get();


        /* =================================================
           WARN
        ================================================= */

        const warns =
          prepare(`
            SELECT
              COALESCE(
                SUM(warns),
                0
              ) AS total
            FROM users
          `).get();


        /* =================================================
           TESTO
        ================================================= */

        const text =
`📊 *J.A.R.V.I.S 5.0*

*STATISTICHE BOT*

══════ •⊰✧⊱• ══════

👥 *Utenti registrati*
${Number(users?.total || 0)}

💬 *Messaggi elaborati*
${Number(messages?.total || 0)}

🤬 *Bestemmie rilevate*
${Number(blasphemies?.total || 0)}

⚠️ *Warn totali*
${Number(warns?.total || 0)}

👥 *Gruppi conosciuti*
${Number(groups?.total || 0)}

⭐ *XP totale*
${Number(xp?.total || 0)}

🪙 *Monete totali*
${Number(coins?.total || 0)}

══════ •⊰✧⊱• ══════

🤖 *J.A.R.V.I.S 5.0*`;


        await sock.sendMessage(
          chat,
          {
            text
          }
        );

      } catch (error) {

        console.error(
          '[STATS] Errore recupero statistiche:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '⚠️ Impossibile recuperare le statistiche di J.A.R.V.I.S 5.0.'
          }
        );
      }
    },
    {
      permission: 'OWNER'
    }
  );
}
