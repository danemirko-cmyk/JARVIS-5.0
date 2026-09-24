import { prepare } from '../../database/database.js';

import {
  resolveMentions
} from '../../utils/mentions.js';


function cleanIdentifier(value) {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}


function getTopUsers() {
  return prepare(`
    SELECT
      name,
      phone,
      messages,
      level
    FROM users
    ORDER BY
      messages DESC,
      level DESC,
      name ASC
    LIMIT 10
  `).all();
}


export function registerClassificaCommand(
  registerCommand
) {

  registerCommand(
    'classifica',

    async ({
      sock,
      chat,
      message
    }) => {

      try {

        const users =
          getTopUsers();


        if (!users.length) {

          await sock.sendMessage(
            chat,
            {
              text:
`🏆 *CLASSIFICA J.A.R.V.I.S. 5.0*

Non ci sono ancora dati sufficienti per creare la classifica.`
            },
            {
              quoted: message
            }
          );

          return;
        }


        /*
         * Gli identificativi presenti nel database
         * possono essere LID oppure numeri telefonici.
         */
        const identifiers =
          users.map(
            user =>
              cleanIdentifier(user.phone)
          );


        /*
         * Risolviamo gli utenti reali del gruppo.
         */
        const resolved =
          await resolveMentions(
            sock,
            chat,
            identifiers
          );


        /*
         * IMPORTANTE:
         *
         * La chiave della Map deve essere
         * l'identificativo ORIGINALE del database,
         * NON item.phone.
         *
         * Esempio:
         *
         * database:
         * 273525478821893
         *
         * resolver:
         * identifier = 273525478821893
         * phone      = 393201391411
         *
         * Prima usavamo "phone" e quindi
         * la ricerca falliva.
         */
        const mentionMap =
          new Map(
            resolved.map(
              item => [
                cleanIdentifier(item.identifier),
                item
              ]
            )
          );


        const mentions = [];


        let text =
`🏆 *J.A.R.V.I.S. 5.0*
📊 *TOP 10 MESSAGGI*

══════ •⊰✧⊱• ══════

`;


        users.forEach(
          (user, index) => {

            const identifier =
              cleanIdentifier(
                user.phone
              );


            const resolvedUser =
              mentionMap.get(
                identifier
              );


            /*
             * Se l'utente è stato trovato
             * nel gruppo, utilizziamo il suo
             * vero numero telefonico per
             * costruire la mention.
             */
            let display;

            if (
              resolvedUser?.phone
            ) {

              display =
                `@${resolvedUser.phone}`;

            } else {

              /*
               * Utente non presente nel gruppo:
               * lasciamo l'identificativo originale.
               */
              display =
                `@${identifier}`;
            }


            /*
             * Aggiungiamo il JID reale alla
             * proprietà mentions.
             */
            if (
              resolvedUser?.mentionJid
            ) {

              mentions.push(
                resolvedUser.mentionJid
              );

            }


            const medal =
              index === 0
                ? '🥇'
                : index === 1
                  ? '🥈'
                  : index === 2
                    ? '🥉'
                    : `🏅 ${index + 1}.`;


            text +=
`${medal} ${display} 💬 ${user.messages} messaggi
⭐ Livello ${user.level}

`;

          }
        );


        text +=
`══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;


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
          '[CLASSIFICA] Errore:',
          error
        );


        await sock.sendMessage(
          chat,
          {
            text:
`❌ *CLASSIFICA*

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
