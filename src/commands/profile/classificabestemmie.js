import { prepare } from '../../database/database.js';

import {
  resolveMentions
} from '../../utils/mentions.js';


/* =========================================================
   NORMALIZZA IDENTIFICATIVO
========================================================= */

function cleanIdentifier(value) {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}


/* =========================================================
   RECUPERA TOP 10 BESTEMMIATORI
========================================================= */

function getTopUsers() {
  return prepare(`
    SELECT
      name,
      phone,
      blasphemy_count
    FROM users
    WHERE blasphemy_count > 0
    ORDER BY
      blasphemy_count DESC,
      name ASC
    LIMIT 10
  `).all();
}


/* =========================================================
   COMANDO
========================================================= */

export function registerClassificaBestemmieCommand(
  registerCommand
) {

  registerCommand(
    'classificabestemmie',

    async ({
      sock,
      chat,
      message
    }) => {

      try {

        /* =================================================
           DATI CLASSIFICA
        ================================================= */

        const users =
          getTopUsers();


        /* =================================================
           NESSUN DATO
        ================================================= */

        if (!users.length) {

          await sock.sendMessage(
            chat,
            {
              text:
`🤬 *CLASSIFICA BESTEMMIE*

Nessuna bestemmia è stata registrata finora. 😇`
            },
            {
              quoted: message
            }
          );

          return;
        }


        /* =================================================
           IDENTIFICATIVI DATABASE
        ================================================= */

        /*
         * IMPORTANTE:
         *
         * Gli identificativi nel database possono
         * essere LID oppure numeri telefonici.
         */
        const identifiers =
          users.map(
            user =>
              cleanIdentifier(
                user.phone
              )
          );


        /* =================================================
           RISOLUZIONE UTENTI REALI
        ================================================= */

        const resolved =
          await resolveMentions(
            sock,
            chat,
            identifiers
          );


        /* =================================================
           MAPPA MENTION
        ================================================= */

        /*
         * Come in .classifica:
         *
         * la chiave deve essere
         * item.identifier
         *
         * NON item.phone.
         */
        const mentionMap =
          new Map(
            resolved.map(
              item => [
                cleanIdentifier(
                  item.identifier
                ),
                item
              ]
            )
          );


        /* =================================================
           MENTIONS WHATSAPP
        ================================================= */

        const mentions = [];


        /* =================================================
           INTESTAZIONE
        ================================================= */

        let text =
`🤬 *J.A.R.V.I.S. 5.0*
💀 *TOP 10 BESTEMMIATORI*

══════ •⊰✧⊱• ══════

`;


        /* =================================================
           GENERAZIONE CLASSIFICA
        ================================================= */

        users.forEach(
          (user, index) => {

            const identifier =
              cleanIdentifier(
                user.phone
              );


            /*
             * Recuperiamo l'utente reale
             * tramite l'identificativo originale.
             */
            const resolvedUser =
              mentionMap.get(
                identifier
              );


            /* =============================================
               DISPLAY
            ============================================= */

            let display;


            /*
             * IDENTICA LOGICA DI .CLASSIFICA
             *
             * Se l'utente è stato trovato nel gruppo,
             * usiamo il suo vero numero telefonico.
             */
            if (
              resolvedUser?.phone
            ) {

              display =
                `@${resolvedUser.phone}`;

            } else {

              /*
               * Fallback se non viene trovato.
               */
              display =
                `@${identifier}`;
            }


            /* =============================================
               MENTION REALE
            ============================================= */

            /*
             * Questo è il JID reale che WhatsApp
             * utilizza per trasformare @numero
             * in una vera mention.
             */
            if (
              resolvedUser?.mentionJid
            ) {

              mentions.push(
                resolvedUser.mentionJid
              );
            }


            /* =============================================
               MEDAGLIA
            ============================================= */

            const medal =
              index === 0
                ? '🥇'
                : index === 1
                  ? '🥈'
                  : index === 2
                    ? '🥉'
                    : `🏅 ${index + 1}.`;


            /* =============================================
               RIGA
            ============================================= */

            text +=
`${medal} ${display} 🤬 ${user.blasphemy_count} bestemmie

`;
          }
        );


        /* =================================================
           FOOTER
        ================================================= */

        text +=
`══════ •⊰✧⊱• ══════
⚠️ *Classifica puramente statistica.*

— *J.A.R.V.I.S 5.0* —`;


        /* =================================================
           INVIO
        ================================================= */

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


      } catch (error) {

        console.error(
          '[CLASSIFICA BESTEMMIE] Errore:',
          error
        );


        await sock.sendMessage(
          chat,
          {
            text:
`❌ *CLASSIFICA BESTEMMIE*

Si è verificato un errore durante il caricamento della classifica.`
          },
          {
            quoted: message
          }
        );

      }

    }
  );

}
