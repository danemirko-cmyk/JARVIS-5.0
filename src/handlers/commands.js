import {
  logCommand,
  logBot,
  logError
} from '../utils/logger.js';

import {
  requirePermission
} from '../middleware/permissions.js';

const commands = new Map();


/* =========================================================
   REGISTRAZIONE COMANDI
========================================================= */

export function registerCommand(
  name,
  handler,
  options = {}
) {
  const commandName =
    String(name)
      .toLowerCase();

  if (!commandName) {
    throw new Error(
      'Nome comando mancante.'
    );
  }

  if (typeof handler !== 'function') {
    throw new Error(
      `Handler non valido per .${commandName}`
    );
  }

  const command = {
    name: commandName,
    handler,
    aliases: options.aliases || [],
    permission:
      options.permission || 'USER'
  };

  commands.set(
    commandName,
    command
  );

  for (
    const alias of command.aliases
  ) {
    commands.set(
      String(alias).toLowerCase(),
      command
    );
  }

  logCommand(
    `Registrato: .${commandName} [${command.permission}]`
  );
}


/* =========================================================
   RICERCA COMANDO
========================================================= */

export function getCommand(name) {
  if (!name) {
    return null;
  }

  return (
    commands.get(
      String(name).toLowerCase()
    ) || null
  );
}


/* =========================================================
   ARGOMENTI
========================================================= */

function normalizeArguments(context) {

  const args =
    Array.isArray(context.args)
      ? context.args.map(value =>
          String(value)
        )
      : [];

  /*
   * Compatibilità universale:
   *
   * messages.js:
   * args: ['ciao', 'jj']
   *
   * diventa:
   *
   * argumentText: 'ciao jj'
   *
   * In questo modo i comandi vecchi e nuovi
   * possono convivere senza problemi.
   */

  const argumentText =
    args.length > 0
      ? args.join(' ').trim()
      : String(
          context.argumentText || ''
        ).trim();

  return {
    args,
    argumentText
  };
}


/* =========================================================
   ESECUZIONE COMANDO
========================================================= */

export async function executeCommand(
  context
) {
  const command =
    getCommand(
      context.command
    );

  if (!command) {
    logCommand(
      `❌ Comando non trovato: .${context.command}`
    );

    return false;
  }

  logCommand(
    `▶️ Esecuzione: .${command.name}`
  );

  try {

    /* -----------------------------------------------------
       NORMALIZZAZIONE ARGOMENTI
    ----------------------------------------------------- */

    const {
      args,
      argumentText
    } =
      normalizeArguments(
        context
      );

    /*
     * Creiamo un nuovo context invece di modificare
     * quello originale.
     */

    const commandContext = {
      ...context,
      args,
      argumentText
    };


    /* -----------------------------------------------------
       PERMESSI
    ----------------------------------------------------- */

    const allowed =
      await requirePermission(
        command.permission,
        commandContext
      );

    if (!allowed) {

      logCommand(
        `🚫 Accesso negato: .${command.name} | richiesto ${command.permission}`
      );

      return true;
    }


    /* -----------------------------------------------------
       ESECUZIONE
    ----------------------------------------------------- */

    await command.handler(
      commandContext
    );


    logBot(
      `✅ Comando eseguito: .${command.name}`
    );

    return true;

  } catch (error) {

    logError(
      `Errore comando .${command.name}`,
      error
    );

    try {

      await context.sock.sendMessage(
        context.chat,
        {
          text:
            '⚠️ Si è verificato un errore durante l’esecuzione del comando.'
        }
      );

    } catch (sendError) {

      logError(
        'Impossibile inviare il messaggio di errore',
        sendError
      );
    }

    return true;
  }
}


/* =========================================================
   COMANDI REGISTRATI
========================================================= */

export function getRegisteredCommands() {
  return [
    ...new Set(
      [...commands.values()]
        .map(
          command =>
            command.name
        )
    )
  ];
}
