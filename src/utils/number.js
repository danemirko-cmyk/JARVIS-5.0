/* =========================================================
   JARVIS 5.0
   NUMBER UTILS
========================================================= */

/**
 * Normalizza un numero telefonico.
 */
export function normalizeNumber(
    value
) {
    if (!value) {
        return '';
    }

    let number =
        String(value)
            .trim();

    number =
        number.replace(
            /@s\.whatsapp\.net$/i,
            ''
        );

    number =
        number.replace(
            /@lid$/i,
            ''
        );

    number =
        number.split(':')[0];

    number =
        number.replace(
            /\D/g,
            ''
        );

    return number;
}

/**
 * Recupera il numero da un JID.
 */
export function getNumber(
    jid
) {
    if (!jid) {
        return '';
    }

    return normalizeNumber(
        jid
    );
}

/**
 * Trasforma un numero in JID WhatsApp.
 */
export function toJid(
    value
) {
    const number =
        normalizeNumber(
            value
        );

    if (!number) {
        return '';
    }

    return `${number}@s.whatsapp.net`;
}

/**
 * Controlla se un valore è un JID WhatsApp.
 */
export function isWhatsAppJid(
    value
) {
    return (
        typeof value === 'string' &&
        value
            .toLowerCase()
            .endsWith(
                '@s.whatsapp.net'
            )
    );
}

/**
 * Controlla se è un JID gruppo.
 */
export function isGroupJid(
    value
) {
    return (
        typeof value === 'string' &&
        value
            .toLowerCase()
            .endsWith('@g.us')
    );
}

/**
 * Confronta due numeri.
 */
export function sameNumber(
    first,
    second
) {
    const a =
        normalizeNumber(first);

    const b =
        normalizeNumber(second);

    return (
        Boolean(a) &&
        Boolean(b) &&
        a === b
    );
}

/**
 * Confronta due JID.
 */
export function sameJid(
    first,
    second
) {
    if (
        !first ||
        !second
    ) {
        return false;
    }

    const a =
        String(first)
            .trim()
            .toLowerCase();

    const b =
        String(second)
            .trim()
            .toLowerCase();

    return (
        a === b ||
        sameNumber(a, b)
    );
}

/**
 * Normalizza una lista di numeri.
 */
export function normalizeNumbers(
    values
) {
    if (!Array.isArray(values)) {
        return [];
    }

    return [
        ...new Set(
            values
                .map(normalizeNumber)
                .filter(Boolean)
        )
    ];
}

/* =========================================================
   DEFAULT
========================================================= */

export default {
    normalizeNumber,
    getNumber,
    toJid,
    isWhatsAppJid,
    isGroupJid,
    sameNumber,
    sameJid,
    normalizeNumbers
};
