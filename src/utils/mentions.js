/* =========================================================
   JARVIS 5.0
   MENTIONS UTILS
========================================================= */

export function normalizeJid(value) {
    if (!value) return '';

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/:.*?(?=@)/, '');
}

export function getMentionNumber(jid) {
    return normalizeJid(jid)
        .split('@')[0]
        .split(':')[0];
}

export function formatMention(jid) {
    const number =
        getMentionNumber(jid);

    return number
        ? `@${number}`
        : '@utente';
}

export function getContextInfo(message) {
    return (
        message?.message?.extendedTextMessage?.contextInfo ||
        message?.message?.imageMessage?.contextInfo ||
        message?.message?.videoMessage?.contextInfo ||
        message?.message?.documentMessage?.contextInfo ||
        message?.message?.audioMessage?.contextInfo ||
        null
    );
}

export function getMentionedJids(message) {
    const contextInfo =
        getContextInfo(message);

    const mentions =
        contextInfo?.mentionedJid ||
        [];

    return Array.isArray(mentions)
        ? mentions.filter(Boolean)
        : [];
}

export function getQuotedParticipant(message) {
    const contextInfo =
        getContextInfo(message);

    return (
        contextInfo?.participant ||
        contextInfo?.participantAlt ||
        contextInfo?.participantPn ||
        contextInfo?.senderPn ||
        null
    );
}

export function resolveMention(message) {
    const mentions =
        getMentionedJids(message);

    if (mentions.length) {
        return mentions[0];
    }

    return getQuotedParticipant(message);
}

export function resolveMentions(message) {
    const mentions =
        getMentionedJids(message);

    if (mentions.length) {
        return [
            ...new Set(
                mentions
                    .filter(Boolean)
                    .map(normalizeJid)
            )
        ];
    }

    const quoted =
        getQuotedParticipant(message);

    if (quoted) {
        return [
            normalizeJid(quoted)
        ];
    }

    return [];
}

export async function getGroupParticipants(
    sock,
    groupJid
) {
    if (
        !sock ||
        !groupJid ||
        !String(groupJid).endsWith('@g.us')
    ) {
        return [];
    }

    try {
        const metadata =
            await sock.groupMetadata(
                groupJid
            );

        return Array.isArray(
            metadata?.participants
        )
            ? metadata.participants
            : [];

    } catch {
        return [];
    }
}

export function participantToJid(
    participant
) {
    if (!participant) {
        return '';
    }

    if (typeof participant === 'string') {
        return normalizeJid(participant);
    }

    const candidates = [
        participant.phoneNumber,
        participant.participantPn,
        participant.participantAlt,
        participant.senderPn,
        participant.remoteJidAlt,
        participant.userJid,
        participant.jid,
        participant.participant,
        participant.id,
        participant.lid
    ];

    for (const candidate of candidates) {
        if (
            typeof candidate === 'string' &&
            candidate
                .toLowerCase()
                .endsWith('@s.whatsapp.net')
        ) {
            return normalizeJid(candidate);
        }
    }

    for (const candidate of candidates) {
        if (
            typeof candidate === 'string' &&
            (
                candidate
                    .toLowerCase()
                    .endsWith('@lid') ||
                candidate
                    .toLowerCase()
                    .endsWith('@s.whatsapp.net')
            )
        ) {
            return normalizeJid(candidate);
        }
    }

    return '';
}

export function getAllParticipantJids(
    participants
) {
    if (!Array.isArray(participants)) {
        return [];
    }

    return [
        ...new Set(
            participants
                .map(participantToJid)
                .filter(Boolean)
        )
    ];
}

export async function getGroupMentions(
    sock,
    groupJid
) {
    const participants =
        await getGroupParticipants(
            sock,
            groupJid
        );

    return getAllParticipantJids(
        participants
    );
}

export function buildMentionText(
    jids,
    separator = ' '
) {
    if (!Array.isArray(jids)) {
        return '';
    }

    return jids
        .filter(Boolean)
        .map(formatMention)
        .join(separator);
}

export async function mentionAll(
    sock,
    groupJid,
    text,
    options = {}
) {
    const mentions =
        await getGroupMentions(
            sock,
            groupJid
        );

    const messageText =
        String(text || '').trim();

    if (!messageText) {
        return null;
    }

    return sock.sendMessage(
        groupJid,
        {
            text: messageText,
            mentions
        },
        options
    );
}

export const hideTag =
    mentionAll;

export async function mentionAdmins(
    sock,
    groupJid,
    text,
    options = {}
) {
    const participants =
        await getGroupParticipants(
            sock,
            groupJid
        );

    const mentions =
        participants
            .filter(participant =>
                participant?.admin === 'admin' ||
                participant?.admin === 'superadmin' ||
                participant?.isAdmin === true ||
                participant?.isSuperAdmin === true
            )
            .map(participantToJid)
            .filter(Boolean);

    const messageText =
        String(text || '').trim();

    if (!messageText) {
        return null;
    }

    return sock.sendMessage(
        groupJid,
        {
            text: messageText,
            mentions: [
                ...new Set(mentions)
            ]
        },
        options
    );
}

export async function getAdminsMentions(
    sock,
    groupJid
) {
    const participants =
        await getGroupParticipants(
            sock,
            groupJid
        );

    return participants
        .filter(participant =>
            participant?.admin === 'admin' ||
            participant?.admin === 'superadmin' ||
            participant?.isAdmin === true ||
            participant?.isSuperAdmin === true
        )
        .map(participantToJid)
        .filter(Boolean);
}

export async function createHideTagPayload(
    sock,
    groupJid,
    text
) {
    const mentions =
        await getGroupMentions(
            sock,
            groupJid
        );

    return {
        text: String(text || ''),
        mentions
    };
}

export function getMentionTarget(
    message
) {
    const mentions =
        resolveMentions(message);

    return mentions[0] || null;
}

export function hasMentions(
    message
) {
    return (
        resolveMentions(message)
            .length > 0
    );
}

export function messageMentionsJid(
    message,
    jid
) {
    const target =
        normalizeJid(jid);

    if (!target) {
        return false;
    }

    return resolveMentions(message)
        .some(
            mentioned =>
                normalizeJid(
                    mentioned
                ) === target
        );
}

export default {
    normalizeJid,
    getMentionNumber,
    formatMention,

    getContextInfo,
    getMentionedJids,
    getQuotedParticipant,

    resolveMention,
    resolveMentions,

    getGroupParticipants,
    participantToJid,
    getAllParticipantJids,
    getGroupMentions,

    buildMentionText,
    mentionAll,
    hideTag,
    mentionAdmins,
    getAdminsMentions,

    createHideTagPayload,
    getMentionTarget,
    hasMentions,
    messageMentionsJid
};
