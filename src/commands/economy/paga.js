import {
  getUserByJid,
  getBalance,
  addCoins,
  removeCoins
} from '../../services/economy.js';

function getMentionedJid(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  const mentioned =
    context?.mentionedJid;

  if (
    !Array.isArray(mentioned) ||
    !mentioned.length
  ) {
    return null;
  }

  return mentioned[0];
}

function getQuotedJid(message) {
  const context =
    message?.message?.extendedTextMessage?.contextInfo;

  if (!context?.participant) {
    return null;
  }

  return context.participant;
}

function getTargetJid(
  message,
  args
) {
  const mentioned =
    getMentionedJid(message);

  if (mentioned) {
    return mentioned;
  }

  const quoted =
    getQuotedJid(message);

  if (quoted) {
    return quoted;
  }

  const argument =
    args?.[0];

  if (!argument) {
    return null;
  }

  const number =
    String(argument)
      .replace(/[^0-9]/g, '');

  if (!number) {
    return null;
  }

  return `${number}@s.whatsapp.net`;
}

function getMention(jid) {
  return `@${String(jid)
    .split('@')[0]
    .split(':')[0]}`;
}

function getAmount(
  args,
  targetWasMentioned
) {
  const index =
    targetWasMentioned ? 1 : 1;

  const value =
    Number(args?.[index]);

  if (
    !Number.isFinite(value) ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

export function registerPagaCommand(
  registerCommand
) {

  registerCommand(
    'paga',
    async ({
      sock,
      chat,
      sender,
      message,
      args
    }) => {

      const payer =
        getUserByJid(sender);

      if (!payer) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *J.A.R.V.I.S 5.0*

Il tuo profilo non è ancora presente nel database.

Invia prima un messaggio e riprova.`
          }
        );

        return;
      }

      const mentioned =
        getMentionedJid(message);

      const quoted =
        getQuotedJid(message);

      const targetJid =
        getTargetJid(
          message,
          args
        );

      if (!targetJid) {

        await sock.sendMessage(
          chat,
          {
            text:
`💸 *PAGAMENTO*

Devi indicare un destinatario e un importo.

Esempi:

*.paga @utente 500*

oppure rispondi a un messaggio:

*.paga 500*`
          }
        );

        return;
      }

      const amount =
        getAmount(
          args,
          Boolean(
            mentioned || quoted
          )
        );

      if (!amount) {

        await sock.sendMessage(
          chat,
          {
            text:
`❌ *IMPORTO NON VALIDO*

Inserisci un numero intero maggiore di 0.

Esempio:

*.paga @utente 500*`
          }
        );

        return;
      }

      const payerPhone =
        String(sender)
          .split('@')[0]
          .split(':')[0];

      const targetPhone =
        String(targetJid)
          .split('@')[0]
          .split(':')[0];

      if (
        payerPhone ===
        targetPhone
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
`💸 *PAGAMENTO*

Non puoi trasferire JCoins a te stesso. 😂`
          }
        );

        return;
      }

      const recipient =
        getUserByJid(targetJid);

      if (!recipient) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *PAGAMENTO*

Non trovo questo utente nel database.

L'utente deve aver inviato almeno un messaggio a JARVIS.`
          }
        );

        return;
      }

      const payerBalance =
        getBalance(payer.id);

      if (
        payerBalance <
        amount
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
`❌ *PAGAMENTO RIFIUTATO*

💰 Importo richiesto:
*${amount} JCoins*

💳 Il tuo saldo:
*${payerBalance} JCoins*

Ti mancano:
*${amount - payerBalance} JCoins*`
          }
        );

        return;
      }

      const removed =
        removeCoins(
          payer.id,
          amount
        );

      if (!removed) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *PAGAMENTO FALLITO*

Non è stato possibile completare il trasferimento.

Il tuo saldo non è stato modificato.`
          }
        );

        return;
      }

      addCoins(
        recipient.id,
        amount
      );

      const newBalance =
        getBalance(payer.id);

      await sock.sendMessage(
        chat,
        {
          text:
`💸 *PAGAMENTO COMPLETATO*

══════ •⊰✧⊱• ══════

👤 Da:
@${payerPhone}

➡️ A:
${getMention(targetJid)}

💰 Importo:
*${amount} JCoins*

💳 Nuovo saldo:
*${newBalance} JCoins*

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender,
            targetJid
          ]
        }
      );
    }
  );
}
