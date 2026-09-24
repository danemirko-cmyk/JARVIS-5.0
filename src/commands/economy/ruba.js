import {
  getUserByJid,
  getBalance,
  addCoins,
  removeCoins,
  getRemainingCooldown,
  setCooldown,
  formatCooldown
} from '../../services/economy.js';

const ROB_COOLDOWN = 60 * 60;

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

function randomInteger(
  min,
  max
) {
  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min;
}

export function registerRubaCommand(
  registerCommand
) {

  registerCommand(
    'ruba',
    async ({
      sock,
      chat,
      sender,
      message,
      args
    }) => {

      const robber =
        getUserByJid(sender);

      if (!robber) {

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

      const remaining =
        getRemainingCooldown(
          robber.id,
          'rob',
          ROB_COOLDOWN
        );

      if (remaining > 0) {

        await sock.sendMessage(
          chat,
          {
            text:
`⏳ *RAPINA*

Hai già tentato una rapina recentemente.

🕐 Potrai riprovare tra:

*${formatCooldown(remaining)}*`
          }
        );

        return;
      }

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
`🥷 *RAPINA*

Devi indicare chi vuoi derubare.

Esempio:

*.ruba @utente*

💡 Puoi anche rispondere a un messaggio dell'utente con *.ruba*.`
          }
        );

        return;
      }

      const robberPhone =
        String(sender)
          .split('@')[0]
          .split(':')[0];

      const targetPhone =
        String(targetJid)
          .split('@')[0]
          .split(':')[0];

      if (
        robberPhone ===
        targetPhone
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
`🥷 *RAPINA*

Vuoi derubare te stesso?

Geniale... ma non funziona. 😂`
          }
        );

        return;
      }

      const victim =
        getUserByJid(targetJid);

      if (!victim) {

        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *RAPINA*

Non trovo questo utente nel database.

💡 L'utente deve aver inviato almeno un messaggio a JARVIS.`
          }
        );

        return;
      }

      const robberBalance =
        getBalance(robber.id);

      const victimBalance =
        getBalance(victim.id);

      if (robberBalance <= 0) {

        await sock.sendMessage(
          chat,
          {
            text:
`💸 *RAPINA FALLITA*

Non hai nemmeno un JCoin.

Prima guadagna qualcosa, criminale. 😂`
          }
        );

        return;
      }

      if (victimBalance <= 0) {

        setCooldown(
          robber.id,
          'rob'
        );

        await sock.sendMessage(
          chat,
          {
            text:
`🥷 *RAPINA*

Hai scelto una vittima completamente al verde.

💸 ${getMention(targetJid)} ha *0 JCoins*.

Non c'è niente da rubare. 😂`,
            mentions: [
              targetJid
            ]
          }
        );

        return;
      }

      setCooldown(
        robber.id,
        'rob'
      );

      const success =
        Math.random() < 0.60;

      if (success) {

        const percentage =
          randomInteger(
            10,
            40
          );

        let stolen =
          Math.floor(
            victimBalance *
              (percentage / 100)
          );

        stolen =
          Math.max(
            1,
            stolen
          );

        stolen =
          Math.min(
            stolen,
            victimBalance
          );

        removeCoins(
          victim.id,
          stolen
        );

        addCoins(
          robber.id,
          stolen
        );

        const newBalance =
          getBalance(
            robber.id
          );

        await sock.sendMessage(
          chat,
          {
            text:
`🥷 *RAPINA RIUSCITA!*

══════ •⊰✧⊱• ══════

🕵️ Ladro:
@${robberPhone}

🎯 Vittima:
${getMention(targetJid)}

💰 Bottino:
*+${stolen} JCoins*

📊 Percentuale rubata:
*${percentage}%*

💳 Il tuo saldo:
*${newBalance} JCoins*

😂 La vittima non ha potuto fare nulla.

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
            mentions: [
              sender,
              targetJid
            ]
          }
        );

        return;
      }

      const penalty =
        Math.min(
          robberBalance,
          randomInteger(
            20,
            50
          )
        );

      if (penalty > 0) {
        removeCoins(
          robber.id,
          penalty
        );
      }

      const newBalance =
        getBalance(
          robber.id
        );

      await sock.sendMessage(
        chat,
        {
          text:
`🚨 *RAPINA FALLITA!*

══════ •⊰✧⊱• ══════

🥷 Hai provato a derubare:
${getMention(targetJid)}

👮 Sei stato scoperto!

💸 Multa:
*-${penalty} JCoins*

💳 Il tuo saldo:
*${newBalance} JCoins*

😂 Che criminale incapace.

⏰ Potrai riprovare tra 1 ora.

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            targetJid
          ]
        }
      );
    }
  );
}
