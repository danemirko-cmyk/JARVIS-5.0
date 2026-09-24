/* =========================================================
   JARVIS 5.0
   ADMIN UTILS
========================================================= */

import { prepare } from '../database/database.js';

/* =========================================================
   NORMALIZZAZIONE JID
========================================================= */

export function normalizeJid(value) {
    if (!value) {
        return '';
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/:.*?(?=@)/, '');
}

export function getNumber(jid) {
    return normalizeJid(jid)
        .split('@')[0]
        .split(':')[0];
}

/* =========================================================
   PARTICIPANT JID
========================================================= */

export function participantJid(
    participant
) {
    if (!participant) {
        return '';
    }

    if (
        typeof participant === 'string'
    ) {
        return normalizeJid(
            participant
        );
    }

    return normalizeJid(
        participant.id ||
        participant.jid ||
        participant.phoneNumber ||
        participant.lid ||
        participant.participant ||
        ''
    );
}

/* =========================================================
   CONFRONTO PARTECIPANTI
========================================================= */

export function isSameParticipant(
    first,
    second
) {
    const a =
        normalizeJid(first);

    const b =
        normalizeJid(second);

    if (!a || !b) {
        return false;
    }

    if (a === b) {
        return true;
    }

    const aNumber =
        getNumber(a)
            .replace(/\D/g, '');

    const bNumber =
        getNumber(b)
            .replace(/\D/g, '');

    return (
        Boolean(aNumber) &&
        Boolean(bNumber) &&
        aNumber === bNumber
    );
}

/* =========================================================
   GROUP METADATA
========================================================= */

export async function getGroupMetadata(
    sock,
    groupJid
) {
    if (
        !sock ||
        !groupJid ||
        !String(groupJid)
            .endsWith('@g.us')
    ) {
        return null;
    }

    try {
        return await sock.groupMetadata(
            groupJid
        );

    } catch (error) {

        console.error(
            '[ADMIN] Errore recupero metadata gruppo:',
            error?.message || error
        );

        return null;
    }
}

/* =========================================================
   TROVA PARTECIPANTE
========================================================= */

export async function getTargetParticipant(
    sock,
    groupJid,
    message
) {
    if (
        !sock ||
        !groupJid ||
        !String(groupJid)
            .endsWith('@g.us')
    ) {
        return null;
    }

    /*
     * Recuperiamo il contextInfo da
     * diversi tipi di messaggio.
     */

    const contextInfo =
        message?.message
            ?.extendedTextMessage
            ?.contextInfo ||

        message?.message
            ?.imageMessage
            ?.contextInfo ||

        message?.message
            ?.videoMessage
            ?.contextInfo ||

        message?.message
            ?.documentMessage
            ?.contextInfo ||

        message?.message
            ?.audioMessage
            ?.contextInfo ||

        null;

    /*
     * Prima priorità:
     * utente menzionato.
     */

    const mentionedJids =
        contextInfo?.mentionedJid || [];

    let targetJid = '';

    if (
        Array.isArray(
            mentionedJids
        ) &&
        mentionedJids.length > 0
    ) {
        targetJid =
            normalizeJid(
                mentionedJids[0]
            );
    }

    /*
     * Seconda priorità:
     * messaggio citato.
     */

    if (!targetJid) {
        targetJid =
            normalizeJid(
                contextInfo?.participant ||
                contextInfo?.participantPn ||
                contextInfo?.participantAlt ||
                ''
            );
    }

    /*
     * Recuperiamo i partecipanti.
     */

    const metadata =
        await getGroupMetadata(
            sock,
            groupJid
        );

    if (!metadata) {
        return null;
    }

    const participants =
        Array.isArray(
            metadata.participants
        )
            ? metadata.participants
            : [];

    /*
     * Se abbiamo trovato un JID,
     * cerchiamo il partecipante reale.
     */

    if (targetJid) {

        const found =
            participants.find(
                participant => {

                    const ids = [
                        participant?.id,
                        participant?.jid,
                        participant?.phoneNumber,
                        participant?.lid
                    ]
                        .filter(Boolean)
                        .map(
                            normalizeJid
                        );

                    return ids.includes(
                        targetJid
                    );
                }
            );

        if (found) {
            return found;
        }
    }

    return null;
}

/* =========================================================
   ADMIN
========================================================= */

export async function isAdmin(
    sock,
    groupJid,
    userJid
) {
    if (
        !groupJid ||
        !String(groupJid)
            .endsWith('@g.us') ||
        !userJid
    ) {
        return false;
    }

    try {

        const metadata =
            await getGroupMetadata(
                sock,
                groupJid
            );

        if (!metadata) {
            return false;
        }

        const target =
            normalizeJid(
                userJid
            );

        const participant =
            (
                metadata.participants ||
                []
            ).find(
                participant => {

                    const jid =
                        participantJid(
                            participant
                        );

                    return (
                        jid === target
                    );
                }
            );

        if (!participant) {
            return false;
        }

        return (
            participant.admin ===
                'admin' ||

            participant.admin ===
                'superadmin' ||

            participant.isAdmin === true ||

            participant.isSuperAdmin ===
                true
        );

    } catch (error) {

        console.error(
            '[ADMIN] Errore controllo amministratore:',
            error?.message || error
        );

        return false;
    }
}

export const isGroupAdmin =
    isAdmin;

/* =========================================================
   ADMIN JARVIS
========================================================= */

export async function isBotAdmin(
    sock,
    groupJid
) {
    if (
        !groupJid ||
        !String(groupJid)
            .endsWith('@g.us')
    ) {
        return false;
    }

    try {

        const metadata =
            await getGroupMetadata(
                sock,
                groupJid
            );

        if (!metadata) {
            return false;
        }

        const botIds = [
            sock?.user?.id,
            sock?.user?.lid,
            sock?.user?.jid,
            sock?.user?.phoneNumber
        ]
            .filter(Boolean)
            .map(normalizeJid);

        const participant =
            (
                metadata.participants ||
                []
            ).find(
                item => {

                    const jid =
                        participantJid(
                            item
                        );

                    return botIds.includes(
                        jid
                    );
                }
            );

        if (!participant) {
            return false;
        }

        return (
            participant.admin ===
                'admin' ||

            participant.admin ===
                'superadmin' ||

            participant.isAdmin === true ||

            participant.isSuperAdmin ===
                true
        );

    } catch (error) {

        console.error(
            '[ADMIN] Errore controllo admin JARVIS:',
            error?.message || error
        );

        return false;
    }
}

/* =========================================================
   CHECK ADMIN
========================================================= */

export async function checkAdmin(
    sock,
    message
) {
    const groupJid =
        message?.key?.remoteJid;

    const sender =
        message?.key?.participant ||
        message?.participant ||
        '';

    if (
        !groupJid ||
        !String(groupJid)
            .endsWith('@g.us')
    ) {

        if (
            groupJid &&
            sock
        ) {
            await sock.sendMessage(
                groupJid,
                {
                    text:
                        '⚠️ Questo comando può essere utilizzato solo nei gruppi.'
                }
            );
        }

        return false;
    }

    const senderAdmin =
        await isAdmin(
            sock,
            groupJid,
            sender
        );

    if (!senderAdmin) {

        await sock.sendMessage(
            groupJid,
            {
                text:
                    '⚠️ *Accesso negato.*\n\n' +
                    'Questo comando è riservato agli amministratori.'
            }
        );

        return false;
    }

    const botAdmin =
        await isBotAdmin(
            sock,
            groupJid
        );

    if (!botAdmin) {

        await sock.sendMessage(
            groupJid,
            {
                text:
                    '⚠️ *Operazione impossibile.*\n\n' +
                    'JARVIS deve essere amministratore del gruppo.'
            }
        );

        return false;
    }

    return true;
}

/* =========================================================
   UTENTE DATABASE
========================================================= */

export function getUserFromJid(
    userJid
) {
    const phone =
        getNumber(
            userJid
        ).replace(
            /\D/g,
            ''
        );

    if (!phone) {
        return null;
    }

    try {

        return (
            prepare(`
                SELECT *
                FROM users
                WHERE phone = ?
                LIMIT 1
            `).get(
                phone
            ) || null
        );

    } catch (error) {

        console.error(
            '[ADMIN] Errore recupero utente:',
            error?.message || error
        );

        return null;
    }
}

/* =========================================================
   MUTED USERS
========================================================= */

const mutedUsers =
    new Map();

function muteKey(
    groupJid,
    userJid
) {
    return (
        `${normalizeJid(groupJid)}:` +
        `${normalizeJid(userJid)}`
    );
}

export function setUserMuted(
    groupJid,
    userJid,
    muted = true
) {
    if (
        !groupJid ||
        !userJid
    ) {
        return false;
    }

    const key =
        muteKey(
            groupJid,
            userJid
        );

    if (muted) {

        mutedUsers.set(
            key,
            true
        );

    } else {

        mutedUsers.delete(
            key
        );
    }

    return true;
}

export function isUserMuted(
    groupJid,
    userJid
) {
    if (
        !groupJid ||
        !userJid
    ) {
        return false;
    }

    return mutedUsers.has(
        muteKey(
            groupJid,
            userJid
        )
    );
}

export const isMuted =
    isUserMuted;

export function muteUser(
    groupJid,
    userJid
) {
    return setUserMuted(
        groupJid,
        userJid,
        true
    );
}

export function unmuteUser(
    groupJid,
    userJid
) {
    return setUserMuted(
        groupJid,
        userJid,
        false
    );
}

/* =========================================================
   PARTECIPANTI
========================================================= */

export async function getGroupParticipants(
    sock,
    groupJid
) {
    const metadata =
        await getGroupMetadata(
            sock,
            groupJid
        );

    return (
        metadata?.participants ||
        []
    );
}

export async function getGroupAdmins(
    sock,
    groupJid
) {
    const participants =
        await getGroupParticipants(
            sock,
            groupJid
        );

    return participants.filter(
        participant =>
            participant?.admin ===
                'admin' ||

            participant?.admin ===
                'superadmin' ||

            participant?.isAdmin ===
                true ||

            participant?.isSuperAdmin ===
                true
    );
}

export async function getAdminJids(
    sock,
    groupJid
) {
    const admins =
        await getGroupAdmins(
            sock,
            groupJid
        );

    return admins
        .map(
            participantJid
        )
        .filter(Boolean);
}

/* =========================================================
   OWNER
========================================================= */

export function isOwner(
    userJid
) {
    const ownerNumber =
        String(
            process.env.OWNER_NUMBER ||
            ''
        ).replace(
            /\D/g,
            ''
        );

    if (!ownerNumber) {
        return false;
    }

    const userNumber =
        getNumber(
            userJid
        ).replace(
            /\D/g,
            ''
        );

    return (
        userNumber ===
        ownerNumber
    );
}

export async function isAdminOrOwner(
    sock,
    groupJid,
    userJid
) {
    if (
        isOwner(userJid)
    ) {
        return true;
    }

    return await isAdmin(
        sock,
        groupJid,
        userJid
    );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
    normalizeJid,
    getNumber,
    participantJid,

    getTargetParticipant,
    getUserFromJid,
    isSameParticipant,

    getGroupMetadata,

    isAdmin,
    isGroupAdmin,
    isBotAdmin,
    checkAdmin,

    setUserMuted,
    isUserMuted,
    isMuted,
    muteUser,
    unmuteUser,

    getGroupParticipants,
    getGroupAdmins,
    getAdminJids,

    isOwner,
    isAdminOrOwner
};
