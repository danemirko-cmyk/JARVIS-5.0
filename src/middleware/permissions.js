import { isOwnerPhone } from '../services/owners.js';


/* =========================================================
   HELPERS
========================================================= */

function cleanJid(value) {
  return String(value || '')
    .trim()
    .replace(/:\d+(?=@)/, '');
}

function cleanPhone(value) {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}


/* =========================================================
   RECUPERA TUTTI I POSSIBILI NUMERI DEL MITTENTE
========================================================= */

function getPossiblePhones(context) {

  const phones =
    new Set();

  const addPhone = value => {

    const phone =
      cleanPhone(value);

    if (phone) {
      phones.add(phone);
    }
  };


  /*
   * Mittente principale
   */

  addPhone(
    context?.sender
  );


  /*
   * Participant del messaggio
   */

  addPhone(
    context?.message?.key?.participant
  );


  /*
   * ParticipantPn.
   *
   * Questo è particolarmente importante
   * con i nuovi identificativi WhatsApp/LID.
   */

  addPhone(
    context?.message?.key?.participantPn
  );


  /*
   * Alcuni messaggi possono avere il participant
   * dentro remoteJid / contextInfo.
   */

  addPhone(
    context?.message?.extendedTextMessage
      ?.contextInfo?.participant
  );

  addPhone(
    context?.message?.extendedTextMessage
      ?.contextInfo?.participantPn
  );


  return [
    ...phones
  ];
}


/* =========================================================
   VERIFICA OWNER
========================================================= */

function isOwner(context) {

  const possiblePhones =
    getPossiblePhones(context);


  /*
   * Controlliamo ogni numero contro
   * il database degli owner.
   */

  for (
    const phone of possiblePhones
  ) {

    if (
      isOwnerPhone(phone)
    ) {
      return true;
    }
  }


  /*
   * Controllo speciale del numero
   * del bot stesso.
   *
   * JARVIS non deve essere bloccato
   * dai permessi OWNER.
   */

  const sender =
    cleanJid(
      context?.sender
    );

  const ownId =
    cleanJid(
      context?.sock?.user?.id
    );

  const ownLid =
    cleanJid(
      context?.sock?.user?.lid
    );


  if (
    sender &&
    (
      sender === ownId ||
      sender === ownLid
    )
  ) {
    return true;
  }


  return false;
}


/* =========================================================
   VERIFICA ADMIN GRUPPO
========================================================= */

async function isGroupAdmin(
  sock,
  chat,
  sender,
  message
) {

  if (
    !chat?.endsWith('@g.us')
  ) {
    return false;
  }


  try {

    const metadata =
      await sock.groupMetadata(
        chat
      );

    const participants =
      metadata?.participants || [];


    const senderJid =
      cleanJid(sender);

    const participantPn =
      cleanJid(
        message?.key?.participantPn
      );


    const found =
      participants.find(
        participant => {

          const id =
            cleanJid(
              participant?.id
            );

          const lid =
            cleanJid(
              participant?.lid
            );

          const phone =
            cleanJid(
              participant?.phoneNumber
            );


          /*
           * ID diretto
           */

          if (
            senderJid &&
            (
              id === senderJid ||
              lid === senderJid
            )
          ) {
            return true;
          }


          /*
           * Numero reale
           */

          if (
            participantPn &&
            phone &&
            cleanPhone(
              participantPn
            ) ===
            cleanPhone(phone)
          ) {
            return true;
          }


          /*
           * Confronto numero con ID
           */

          if (
            participantPn &&
            id.endsWith(
              '@s.whatsapp.net'
            ) &&
            cleanPhone(id) ===
            cleanPhone(participantPn)
          ) {
            return true;
          }


          return false;
        }
      );


    if (!found) {
      return false;
    }


    return (
      found.admin === 'admin' ||
      found.admin === 'superadmin' ||
      found.isAdmin === true ||
      found.isSuperAdmin === true
    );


  } catch (error) {

    console.error(
      '[PERMISSIONS] Errore verifica admin:',
      error.message
    );

    return false;
  }
}


/* =========================================================
   CONTROLLO PERMESSI
========================================================= */

export async function checkPermission(
  permission,
  context
) {

  const required =
    String(
      permission || 'USER'
    ).toUpperCase();


  /* =======================================================
     USER
  ======================================================= */

  if (
    required === 'USER'
  ) {

    return {
      allowed: true,
      role: 'USER'
    };
  }


  /* =======================================================
     OWNER
  ======================================================= */

  if (
    required === 'OWNER'
  ) {

    if (
      isOwner(context)
    ) {

      return {
        allowed: true,
        role: 'OWNER'
      };
    }


    return {
      allowed: false,
      role: 'USER'
    };
  }


  /* =======================================================
     ADMIN
  ======================================================= */

  if (
    required === 'ADMIN'
  ) {


    /*
     * Un owner è automaticamente considerato
     * autorizzato anche per i comandi admin.
     */

    if (
      isOwner(context)
    ) {

      return {
        allowed: true,
        role: 'OWNER'
      };
    }


    const admin =
      await isGroupAdmin(
        context.sock,
        context.chat,
        context.sender,
        context.message
      );


    if (admin) {

      return {
        allowed: true,
        role: 'ADMIN'
      };
    }


    return {
      allowed: false,
      role: 'USER'
    };
  }


  /* =======================================================
     PERMESSO SCONOSCIUTO
  ======================================================= */

  return {
    allowed: false,
    role: 'USER'
  };
}


/* =========================================================
   REQUIRE PERMISSION
========================================================= */

export async function requirePermission(
  permission,
  context
) {

  const result =
    await checkPermission(
      permission,
      context
    );


  if (
    result.allowed
  ) {
    return true;
  }


  let text =
    '🚫 *Accesso negato.*\n\n';


  if (
    String(permission).toUpperCase() ===
    'OWNER'
  ) {

    text +=
      '👑 Questo comando è riservato ai proprietari di J.A.R.V.I.S 5.0.';

  } else if (
    String(permission).toUpperCase() ===
    'ADMIN'
  ) {

    text +=
      '🛡️ Questo comando è riservato agli amministratori del gruppo.';

  } else {

    text +=
      '❌ Non hai i permessi necessari.';
  }


  try {

    await context.sock.sendMessage(
      context.chat,
      {
        text
      }
    );

  } catch (error) {

    console.error(
      '[PERMISSIONS] Impossibile inviare il messaggio:',
      error.message
    );
  }


  return false;
}
