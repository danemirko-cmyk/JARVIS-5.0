import {
  addOwner,
  formatPhone
} from '../../services/owners.js';

function getInput(context) {
  if (Array.isArray(context?.args)) {
    return context.args.join(' ').trim();
  }

  const text =
    String(context?.text || '').trim();

  return text
    .replace(/^\.addowner\b/i, '')
    .trim();
}

export function registerAddOwnerCommand(
  registerCommand
) {
  registerCommand(
    'addowner',

    async context => {

      const input =
        getInput(context);

      if (!input) {
        await context.sock.sendMessage(
          context.chat,
          {
            text:
              '👑 *ADD OWNER*\n\n' +
              'Inserisci il numero del nuovo proprietario.\n\n' +
              'Esempio:\n' +
              '`.addowner 393201234567`'
          }
        );

        return;
      }

      const result =
        addOwner(input);

      if (!result.success) {

        let text =
          '❌ *Impossibile aggiungere il proprietario.*';

        if (result.reason === 'invalid') {
          text =
            '❌ Numero non valido.';
        }

        if (result.reason === 'primary') {
          text =
            '👑 Quel numero è già il proprietario principale.';
        }

        if (result.reason === 'exists') {
          text =
            '👑 Quel numero è già un proprietario.';
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
            '👑 *NUOVO PROPRIETARIO*\n\n' +
            `✅ ${formatPhone(result.phone)} è stato aggiunto ai proprietari di J.A.R.V.I.S 5.0.`
        }
      );
    },

    {
      permission: 'OWNER'
    }
  );
}
