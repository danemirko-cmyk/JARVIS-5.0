const SYMBOLS = [
  '🍒',
  '🍋',
  '🍊',
  '🍉',
  '⭐',
  '💎',
  '🔔',
  '7️⃣'
];

function randomSymbol() {
  return SYMBOLS[
    Math.floor(
      Math.random() * SYMBOLS.length
    )
  ];
}

function spin() {
  return [
    randomSymbol(),
    randomSymbol(),
    randomSymbol()
  ];
}

function getResult(reels) {
  const [a, b, c] = reels;

  if (a === b && b === c) {
    if (a === '7️⃣') {
      return {
        title: '💎 JACKPOT!',
        text: 'Tre 7! JARVIS ha appena perso il controllo. 😂'
      };
    }

    if (a === '💎') {
      return {
        title: '💎 JACKPOT!',
        text: 'Tre diamanti! Incredibile!'
      };
    }

    return {
      title: '🎉 TRIS!',
      text: 'Tre simboli identici!'
    };
  }

  if (
    a === b ||
    a === c ||
    b === c
  ) {
    return {
      title: '✨ COPPIA!',
      text: 'Due simboli uguali!'
    };
  }

  return {
    title: '💀 NIENTE!',
    text: 'La fortuna ha deciso di ignorarti.'
  };
}

export function registerSlotCommand(
  registerCommand
) {
  registerCommand(
    'slot',
    async ({
      sock,
      chat,
      sender
    }) => {

      const reels =
        spin();

      const result =
        getResult(reels);

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`🎰 *J.A.R.V.I.S SLOT*

══════ •⊰✧⊱• ══════

👤 ${mention}

🎰 *${reels.join(' │ ')}*

${result.title}

${result.text}

══════ •⊰✧⊱• ══════

🍒 🍋 🍊 🍉 ⭐ 💎 🔔 7️⃣

🤖 — *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender
          ]
        }
      );
    }
  );
}
