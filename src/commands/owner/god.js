import { config } from '../../utils/config.js';


/* =========================================================
   NORMALIZZA NUMERO
========================================================= */

function normalizeNumber(value) {
  return String(
    value || ''
  ).replace(
    /[^0-9]/g,
    ''
  );
}


/* =========================================================
   ESTRAI NUMERO DA JID
========================================================= */

function getJidNumber(jid) {
  if (!jid) {
    return '';
  }

  const value =
    String(jid);

  const match =
    value.match(
      /^(\d+)/
    );

  return match
    ? match[1]
    : '';
}


/* =========================================================
   NUMERO OWNER
========================================================= */

function getOwnerNumber() {
  return normalizeNumber(
    config.owner?.number ||
    config.bot?.ownerNumber ||
    ''
  );
}


/* =========================================================
   IDENTIFICATORI DEL MITTENTE
========================================================= */

function getSenderIdentifiers(message) {
  const identifiers = [
    message?.key?.participant,
    message?.key?.participantPn,
    message?.key?.participantAlt,
    message?.participant,
    message?.sender
  ];

  return identifiers
    .filter(Boolean)
    .map(value =>
      String(value)
    );
}


/* =========================================================
   CONTROLLO OWNER
========================================================= */

function isOwnerMessage(
  message
) {
  const ownerNumber =
    getOwnerNumber();

  if (!ownerNumber) {
    return false;
  }

  const identifiers =
    getSenderIdentifiers(
      message
    );

  return identifiers.some(
    identifier => {

      const number =
        normalizeNumber(
          getJidNumber(
            identifier
          )
        );

      return (
        number &&
        number === ownerNumber
      );
    }
  );
}


/* =========================================================
   TROVA OWNER NEL GRUPPO
========================================================= */

function findOwnerParticipant(
  participants
) {
  const ownerNumber =
    getOwnerNumber();

  if (!ownerNumber) {
    return null;
  }

  for (
    const participant of
    participants
  ) {

    const identifiers = [
      participant?.id,
      participant?.jid,
      participant?.phoneNumber,
      participant?.lid,
      participant?.pn
    ];

    const match =
      identifiers.some(
        identifier => {

          const number =
            normalizeNumber(
              getJidNumber(
                identifier
              )
            );

          return (
            number &&
            number === ownerNumber
          );
        }
      );

    if (match) {
      return participant;
    }
  }

  return null;
}


/* =========================================================
   COMANDO GOD
========================================================= */

export function registerGodCommand(
  registerCommand
) {

  registerCommand(
    'god',

    async ({
      sock,
      message,
      chat,
      isGroup
    }) => {

      /* -----------------------------------------------------
         SOLO GRUPPI
      ----------------------------------------------------- */

      if (!isGroup) {

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ `.god` può essere usato solo nei gruppi.'
          },
          {
            quoted: message
          }
        );

        return;
      }


      /* -----------------------------------------------------
         CONTROLLO OWNER
      ----------------------------------------------------- */

      if (
        !isOwnerMessage(
          message
        )
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Solo il proprietario di JARVIS può usare questo comando.'
          },
          {
            quoted: message
          }
        );

        return;
      }


      /* -----------------------------------------------------
         METADATI GRUPPO
      ----------------------------------------------------- */

      try {

        const metadata =
          await sock.groupMetadata(
            chat
          );

        const participants =
          metadata?.participants || [];


        /* ---------------------------------------------------
           TROVA OWNER
        --------------------------------------------------- */

        const ownerParticipant =
          findOwnerParticipant(
            participants
          );

        if (!ownerParticipant) {

          await sock.sendMessage(
            chat,
            {
              text:
                '❌ Non riesco a trovare il proprietario tra i partecipanti del gruppo.'
            },
            {
              quoted: message
            }
          );

          return;
        }


        /* ---------------------------------------------------
           GIÀ ADMIN
        --------------------------------------------------- */

        const alreadyAdmin =
          ownerParticipant.admin === 'admin' ||
          ownerParticipant.admin === 'superadmin';

        if (alreadyAdmin) {

          await sock.sendMessage(
            chat,
            {
              text:
                '👑 Sei già amministratore del gruppo.'
            },
            {
              quoted: message
            }
          );

          return;
        }


        /* ---------------------------------------------------
           JID TARGET
        --------------------------------------------------- */

        const targetJid =
          ownerParticipant.id ||
          ownerParticipant.jid ||
          ownerParticipant.phoneNumber ||
          ownerParticipant.lid;

        if (!targetJid) {

          await sock.sendMessage(
            chat,
            {
              text:
                '❌ Non riesco a identificare il proprietario nel gruppo.'
            },
            {
              quoted: message
            }
          );

          return;
        }


        /* ---------------------------------------------------
           PROMOZIONE
        --------------------------------------------------- */

        await sock.groupParticipantsUpdate(
          chat,
          [
            targetJid
          ],
          'promote'
        );


        /* ---------------------------------------------------
           RISPOSTA
        --------------------------------------------------- */

        await sock.sendMessage(
          chat,
          {
            text:
              '👑 Fatto. Il proprietario di JARVIS è ora amministratore del gruppo.'
          },
          {
            quoted: message
          }
        );

      } catch (error) {

        console.error(
          '❌ Errore .god:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non sono riuscito a promuovere il proprietario ad amministratore.'
          },
          {
            quoted: message
          }
        );
      }
    },

    {
      permission: 'OWNER',
      description:
        'Promuove il proprietario di JARVIS ad amministratore'
    }
  );
}
