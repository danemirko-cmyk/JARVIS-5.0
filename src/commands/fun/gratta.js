const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const COSMETIC_REWARDS = [
  {
    chance: 5,
    title: '👑 LEGGENDARIO',
    text: 'Hai sbloccato il titolo cosmetico:',
    reward: '👑 Fortuna Leggendaria'
  },
  {
    chance: 5,
    title: '🍀 JACKPOT',
    text: 'Hai sbloccato il titolo cosmetico:',
    reward: '🍀 Fortuna Suprema'
  },
  {
    chance: 15,
    title: '💎 RARO',
    text: 'Hai sbloccato il titolo cosmetico:',
    reward: '💎 Spirito Fortunato'
  },
  {
    chance: 25,
    title: '✨ SPECIALE',
    text: 'Hai sbloccato il titolo cosmetico:',
    reward: '✨ Baciato dalla Fortuna'
  },
  {
    chance: 50,
    title: '🎟️ NIENTE PREMIO',
    text: 'Questa volta non hai trovato nessun premio cosmetico.',
    reward: null
  }
];

function randomReward() {
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const reward of COSMETIC_REWARDS) {
    cumulative += reward.chance;

    if (random < cumulative) {
      return reward;
    }
  }

  return COSMETIC_REWARDS[COSMETIC_REWARDS.length - 1];
}

function getNumber(jid) {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

function buildMessage(number, content) {
  return `🎟️ *GRATTA E VINCI — J.A.R.V.I.S 5.0*

👤 @${number}

${content}`;
}

export function registerGrattaCommand(registerCommand) {
  registerCommand(
    'gratta',
    async ({ sock, chat, sender }) => {
      const number = getNumber(sender);

      if (!number) {
        await sock.sendMessage(chat, {
          text: '⚠️ Non riesco a recuperare il tuo numero.'
        });
        return;
      }

      // ==========================================
      // MESSAGGIO INIZIALE
      // ==========================================

      const sent = await sock.sendMessage(chat, {
        text: buildMessage(
          number,
`╔════════════════════════════╗
║      🪙 *GRATTA QUI* 🪙      ║
╚════════════════════════════╝

🔄 *Sto controllando il tuo biglietto...*`
        ),
        mentions: [sender]
      });

      // ==========================================
      // FASE 2
      // ==========================================

      await sleep(1200);

      await sock.sendMessage(chat, {
        text: buildMessage(
          number,
`╔════════════════════════════╗
║       🎟️ *BIGLIETTO*       ║
╚════════════════════════════╝

🪙 ▓▓▓▓▓▓▓▓▓▓
🪙 ▓▓▓▓▓▓▓▓▓▓
🪙 ▓▓▓▓▓▓▓▓▓▓

🔍 *Elaborazione del risultato...*`
        ),
        mentions: [sender],
        edit: sent.key
      });

      // ==========================================
      // FASE 3
      // ==========================================

      await sleep(1000);

      await sock.sendMessage(chat, {
        text: buildMessage(
          number,
`╔════════════════════════════╗
║       🎟️ *BIGLIETTO*       ║
╚════════════════════════════╝

🪙 ▓▓▓▓▓▓▓▓▓▓
🪙 ▓▓▓▓▓▓▓▓▓▓
🪙 ▓▓▓▓▓▓▓▓▓▓

⚙️ *J.A.R.V.I.S sta verificando il biglietto...*`
        ),
        mentions: [sender],
        edit: sent.key
      });

      // ==========================================
      // RISULTATO
      // ==========================================

      await sleep(1000);

      const result = randomReward();

      if (!result.reward) {
        await sock.sendMessage(chat, {
          text: buildMessage(
            number,
`╔════════════════════════════╗
║      🎟️ *BIGLIETTO*       ║
║       *NON VINCENTE*       ║
╚════════════════════════════╝

😅 ${result.text}

💡 Ritenta con *.gratta*

— *J.A.R.V.I.S 5.0* —`
          ),
          mentions: [sender],
          edit: sent.key
        });

        return;
      }

      await sock.sendMessage(chat, {
        text: buildMessage(
          number,
`╔════════════════════════════╗
║       🎉 *${result.title}*       ║
╚════════════════════════════╝

✨ ${result.text}

🏆 *${result.reward}*

🎨 Premio esclusivamente cosmetico.
💰 JCoins: nessuna modifica

— *J.A.R.V.I.S 5.0* —`
        ),
        mentions: [sender],
        edit: sent.key
      });
    }
  );
}
