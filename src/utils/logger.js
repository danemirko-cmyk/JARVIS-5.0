/* =========================================================
   JARVIS 5.0
   LOGGER
========================================================= */

function timestamp() {
    return new Date().toLocaleTimeString(
        'it-IT',
        {
            hour12: false
        }
    );
}

function formatError(error) {
    if (!error) {
        return '';
    }

    if (error instanceof Error) {
        return (
            error.stack ||
            error.message
        );
    }

    if (
        typeof error === 'object'
    ) {
        try {
            return JSON.stringify(
                error
            );
        } catch {
            return String(error);
        }
    }

    return String(error);
}

function write(
    level,
    message,
    error = null
) {
    const line =
        `[${timestamp()}] [${level}] ${String(message ?? '')}`;

    if (level === 'ERROR') {
        console.error(line);

        const details =
            formatError(error);

        if (details) {
            console.error(details);
        }

        return;
    }

    if (level === 'WARN') {
        console.warn(line);

        const details =
            formatError(error);

        if (details) {
            console.warn(details);
        }

        return;
    }

    console.log(line);

    const details =
        formatError(error);

    if (details) {
        console.log(details);
    }
}

/* =========================================================
   GENERALE
========================================================= */

export function logInfo(message) {
    write(
        'INFO',
        message
    );
}

export function logWarn(
    message,
    error = null
) {
    write(
        'WARN',
        message,
        error
    );
}

export function logError(
    message,
    error = null
) {
    write(
        'ERROR',
        message,
        error
    );
}

export function logDebug(message) {
    write(
        'DEBUG',
        message
    );
}

/* =========================================================
   BOT
========================================================= */

export function logBot(message) {
    write(
        'BOT',
        message
    );
}

export function logCommand(message) {
    write(
        'COMMAND',
        message
    );
}

/* =========================================================
   WHATSAPP
========================================================= */

export function logWhatsApp(
    message,
    error = null
) {
    write(
        'WHATSAPP',
        message,
        error
    );
}

/* =========================================================
   DATABASE
========================================================= */

export function logDatabase(
    message,
    error = null
) {
    write(
        'DATABASE',
        message,
        error
    );
}

/* =========================================================
   AI
========================================================= */

export function logAI(
    message,
    error = null
) {
    write(
        'AI',
        message,
        error
    );
}

/* =========================================================
   CONNECTION
========================================================= */

export function logConnection(
    message,
    error = null
) {
    write(
        'CONNECTION',
        message,
        error
    );
}

/* =========================================================
   SUCCESS
========================================================= */

export function logSuccess(message) {
    write(
        'SUCCESS',
        message
    );
}

/* =========================================================
   DEFAULT
========================================================= */

export default {
    logInfo,
    logWarn,
    logError,
    logDebug,

    logBot,
    logCommand,
    logWhatsApp,

    logDatabase,
    logAI,
    logConnection,

    logSuccess
};
