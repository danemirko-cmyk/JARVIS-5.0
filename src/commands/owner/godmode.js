import { isOwnerPhone } from '../../services/owners.js';

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

function getSenderPhones(context) {
  const phones = new Set();

  const add = value => {
    const phone = cleanPhone(value);
    if (phone) phones.add(phone);
  };

  add(context?.sender);
  add(context?.message?.key?.participant);
  add(context?.message?.key?.participantPn);

  return [...phones];
}

async function findOwnerParticipant(sock, chat, context) {
  const metadata = await sock.groupMetadata(chat);

  const participants =
    metadata?.participants || [];

  const senderJid =
    cleanJid(context?.sender);

  const participantPn =
    cleanJid(
      context?.message?.key?.participantPn
    );

  const ownerPhones =
    getSenderPhones(context);

  const found =
    participants.find(participant => {

      const id =
        cleanJid(participant?.id);

      const lid =
        cleanJid(participant?.lid);

      const phone =
        cleanJid(participant?.phoneNumber);

      if (
        senderJid &&
        (
          id === senderJid ||
          lid === senderJid
        )
      ) {
        return true;
      }

      if (
        participantPn &&
        phone &&
        cleanPhone(participantPn) ===
        cleanPhone(phone)
      ) {
        return true;
      }

      if (
        participantPn &&
        id.endsWith('@s.whatsapp.net') &&
        cleanPhone(id) ===
        cleanPhone(participantPn)
      ) {
        return true;
      }

      if (
        ownerPhones.length &&
        id.endsWith('@s.whatsapp.net') &&
        ownerPhones.includes(cleanPhone(id))
      ) {
        return true;
      }

      return false;
    });

  return {
    metadata,
    participant: found || null
  };
}

export function registerGodmodeCommand(registerCommand) {

  registerCommand(
    'godmode',

    async context => {

      const {
        sock,
        chat
      } = context;

      if (!chat?.endsWith('@g.us')) {

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ *GODMODE*\n\n' +
              'Questo comando può essere usato solo nei gruppi.'
          }
        );

        return;
      }

      try {

        // ====================================================
        // VERIFICA OWNER
        // ====================================================

        const ownerPhones =
          getSenderPhones(context);

        const isOwner =
          ownerPhones.some(
            phone => isOwnerPhone(phone)
          );

        if (!isOwner) {

          await sock.sendMessage(
            chat,
            {
              text:
                '🚫 *Accesso negato.*\n\n' +
                '👑 Questo comando è riservato al proprietario di J.A.R.V.I.S 5.0.'
            }
          );

          return;
        }


        // ====================================================
        // METADATI GRUPPO
        // ====================================================

        const {
          metadata,
          participant
        } =
          await findOwnerParticipant(
            sock,
            chat,
            context
          );


        if (!participant) {

          await sock.sendMessage(
            chat,
            {
              text:
                '❌ *GODMODE*\n\n' +
                'Non riesco a identificare il proprietario nel gruppo.'
            }
          );

          return;
        }


        // ====================================================
        // BOT ADMIN?
        // ====================================================

        const botJid =
          cleanJid(
            sock?.user?.id
          );

        const botParticipant =
          metadata?.participants?.find(
            item => {

              const id =
                cleanJid(item?.id);

              const lid =
                cleanJid(item?.lid);

              return (
                id === botJid ||
                lid === botJid
              );
            }
          );

        const botIsAdmin =
          Boolean(
            botParticipant &&
            (
              botParticipant.admin === 'admin' ||
              botParticipant.admin === 'superadmin' ||
              botParticipant.isAdmin === true ||
              botParticipant.isSuperAdmin === true
            )
          );


        if (!botIsAdmin) {

          await sock.sendMessage(
            chat,
            {
              text:
                '❌ *GODMODE*\n\n' +
                'Non sono amministratore del gruppo.\n\n' +
                '🛡️ Prima rendimi amministratore.'
            }
          );

          return;
        }


        // ====================================================
        // OWNER GIÀ ADMIN
        // ====================================================

        const ownerIsAdmin =
          participant.admin === 'admin' ||
          participant.admin === 'superadmin' ||
          participant.isAdmin === true ||
          participant.isSuperAdmin === true;


        if (ownerIsAdmin) {

          await sock.sendMessage(
            chat,
            {
              text:
                '👑 *GODMODE*\n\n' +
                'Sei già amministratore del gruppo.'
            }
          );

          return;
        }


        // ====================================================
        // PROMOZIONE
        // ====================================================

        const ownerJid =
          participant.id;

        await sock.groupParticipantsUpdate(
          chat,
          [ownerJid],
          'promote'
        );


        // ====================================================
        // CONFERMA
        // ====================================================

        await sock.sendMessage(
          chat,
          {
            text:
              '👑 *GODMODE ATTIVATO*\n\n' +
              '⚡ Il proprietario di J.A.R.V.I.S 5.0 è ora amministratore del gruppo.'
          }
        );

      } catch (error) {

        console.error(
          '[GODMODE] Errore:',
          error
        );

        try {

          await sock.sendMessage(
            chat,
            {
              text:
                '❌ *GODMODE*\n\n' +
                'Non sono riuscito a promuoverti ad amministratore.\n\n' +
                'Controlla che J.A.R.V.I.S 5.0 sia amministratore del gruppo.'
            }
          );

        } catch {}

      }

    },

    {
      permission: 'OWNER'
    }
  );
}
