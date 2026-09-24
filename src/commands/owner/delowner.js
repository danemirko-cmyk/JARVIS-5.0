import {
  removeOwner,
  formatPhone
} from '../../services/owners.js';

function getInput(context) {
  if (Array.isArray(context?.args)) {
    return context.args.join(' ').trim();
  }

  const text =
    String(context?.text || '').trim();

  return text
    .replace(/^\.delowner\b/i, '')
    .trim();
}

export function registerDelOwnerCommand(
  registerCommand
) {
  registerCommand(
    'delowner',

    async context => {

      const input =
        getInput(context);

      if (!input) {
        await context.sock.sendMessage(
          context.chat,
          {
            text:
              '👑 *DEL OWNER*\n\n' +
              'Inserisci il numero del proprietario da rimuovere.\n\n' +
              'Esempio:\n' +
              '`.delowner 393201234567`'
          }
        );

        return;
      }

      const result =
        removeOwner(input);

      if (!result.success) {

        let text =
          '❌ *Impossibile rimuovere il proprietario.*';

        if (result.reason === 'invalid') {
          text =
            '❌ Numero non valido.';
        }

        if (result.reason === 'primary') {
          text =
            '🛡️ Il proprietario principale non può essere rimosso.';
        }

        if (result.reason === 'not_found') {
          text =
            '❌ Quel numero non è presente tra i proprietari.';
        }

        await context.sock.sendMessage(
          context.chat,
          {
            text
          }
        );

        return;
      }

      await context.sock.sendMessage(
        context.chat,
        {
          text:
            '👑 *PROPRIETARIO RIMOSSO*\n\n' +
            `✅ ${formatPhone(result.phone)} non è più un proprietario di J.A.R.V.I.S 5.0.`
        }
      );
    },

    {
      permission: 'OWNER'
    }
  );
}
