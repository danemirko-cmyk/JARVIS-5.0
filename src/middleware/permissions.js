import { isOwnerPhone } from '../services/owners.js';

/* =========================================================
   HELPERS
========================================================= */

function cleanJid(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/:\d+(?=@)/, '');
}

function cleanPhone(value) {
  return String(value || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

/* =========================================================
   RECUPERA TUTTI I POSSIBILI IDENTIFICATIVI DEL MITTENTE
========================================================= */

function getSenderCandidates(context) {
  const values = [
    context?.sender,

    context?.message?.key?.participant,
    context?.message?.key?.participantAlt,
    context?.message?.key?.participantPn,
    context?.message?.key?.senderPn,

    context?.message?.message?.extendedTextMessage
      ?.contextInfo?.participant,

    context?.message?.message?.extendedTextMessage
      ?.contextInfo?.participantAlt,

    context?.message?.message?.extendedTextMessage
      ?.contextInfo?.participantPn
  ];

  return [
    ...new Set(
      values
        .filter(Boolean)
        .map(cleanJid)
    )
  ];
}

/* =========================================================
   RECUPERA TUTTI I POSSIBILI NUMERI DEL MITTENTE
========================================================= */

function getPossiblePhones(context) {
  const phones = new Set();

  for (const value of getSenderCandidates(context)) {
    const phone = cleanPhone(value);

    if (phone) {
      phones.add(phone);
    }
  }

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

  for (const phone of possiblePhones) {
    if (isOwnerPhone(phone)) {
      return true;
    }
  }

  /*
   * Controllo speciale del bot stesso.
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

  const ownPhone =
    cleanJid(
      context?.sock?.user?.phoneNumber
    );

  if (
    sender &&
    (
      sender === ownId ||
      sender === ownLid ||
      sender === ownPhone
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

    /*
     * Tutti gli identificativi possibili
     * del mittente.
     */

    const senderCandidates = [
      sender,

      message?.key?.participant,
      message?.key?.participantAlt,
      message?.key?.participantPn,
      message?.key?.senderPn,

      message?.message?.extendedTextMessage
        ?.contextInfo?.participant,

      message?.message?.extendedTextMessage
        ?.contextInfo?.participantAlt,

      message?.message?.extendedTextMessage
        ?.contextInfo?.participantPn
    ]
      .filter(Boolean)
      .map(cleanJid);

    const uniqueSenderCandidates =
      [
        ...new Set(
          senderCandidates
        )
      ];

    /*
     * Numeri telefonici del mittente.
     */

    const senderPhones =
      [
        ...new Set(
          uniqueSenderCandidates
            .map(cleanPhone)
            .filter(Boolean)
        )
      ];

    /*
     * Cerchiamo il partecipante corrispondente.
     */

    const found =
      participants.find(
        participant => {

          const participantCandidates = [
            participant?.id,
            participant?.jid,
            participant?.lid,
            participant?.phoneNumber,
            participant?.participant,
            participant?.participantAlt
          ]
            .filter(Boolean)
            .map(cleanJid);

          /*
           * 1. Confronto diretto degli identificativi.
           */

          const directMatch =
            participantCandidates.some(
              candidate =>
                uniqueSenderCandidates.includes(
                  candidate
                )
            );

          if (directMatch) {
            return true;
          }

          /*
           * 2. Confronto tramite numero telefonico.
           */

          const participantPhones =
            participantCandidates
              .map(cleanPhone)
              .filter(Boolean);

          const phoneMatch =
            senderPhones.some(
              phone =>
                participantPhones.includes(
                  phone
                )
            );

          return phoneMatch;
        }
      );

    if (!found) {
      return false;
    }

    /*
     * Verifica effettivo stato admin.
     */

    return (
      found.admin === 'admin' ||
      found.admin === 'superadmin' ||
      found.isAdmin === true ||
      found.isSuperAdmin === true
    );

  } catch (error) {

    console.error(
      '[PERMISSIONS] Errore verifica admin:',
      error?.message || error
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
     * Il proprietario è automaticamente
     * autorizzato ai comandi admin.
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
      error?.message || error
    );
  }

  return false;
}
