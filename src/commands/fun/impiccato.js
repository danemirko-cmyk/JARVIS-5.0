import {
  registerGame,
  removeGame
} from '../../services/games.js';

const WORDS = [
  'pizza',
  'computer',
  'telefono',
  'minecraft',
  'playstation',
  'whatsapp',
  'gelato',
  'motocicletta',
  'cavallo',
  'scuola',
  'professore',
  'amicizia',
  'fantasma',
  'vampiro',
  'dragone',
  'astronauta',
  'robot',
  'cinema',
  'musica',
  'chitarra',
  'hamburger',
  'spaghetti',
  'montagna',
  'temporale',
  'fulmine',
  'internet',
  'instagram',
  'videogioco',
  'telefono',
  'scooter'
];

const MAX_ERRORS = 6;

function chooseWord() {
  return WORDS[
    Math.floor(
      Math.random() * WORDS.length
    )
  ];
}

function createDisplay(
  word,
  guessed
) {
  return word
    .split('')
    .map(
      letter =>
        guessed.includes(letter)
          ? letter.toUpperCase()
          : '＿'
    )
    .join(' ');
}

function isSolved(
  word,
  guessed
) {
  return word
    .split('')
    .every(
      letter =>
        guessed.includes(letter)
    );
}

function normalizeLetter(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function drawHangman(errors) {
  const stages = [
`  +---+
  |   |
      |
      |
      |
=========`,
`  +---+
  |   |
  O   |
      |
      |
=========`,
`  +---+
  |   |
  O   |
  |   |
      |
=========`,
`  +---+
  |   |
  O   |
 /|   |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
      |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 /    |
=========`,
`  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
=========`
  ];

  return stages[
    Math.min(
      errors,
      stages.length - 1
    )
  ];
}

export function registerImpiccatoCommand(
  registerCommand
) {
  registerCommand(
    'impiccato',
    async ({
      sock,
      chat,
      sender
    }) => {

      const word =
        chooseWord();

      const game = {
        type: 'impiccato',
        chat,
        word,
        guessed: [],
        errors: 0
      };

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      const sentMessage =
        await sock.sendMessage(
          chat,
          {
            text:
`🪢 *IMPICCATO*

══════ •⊰✧⊱• ══════

👤 ${mention}

${drawHangman(0)}

🔤 Parola:

${createDisplay(
  word,
  []
)}

❤️ Errori: *0/${MAX_ERRORS}*

💡 Rispondi al messaggio con *una lettera*.

🤖 Buona fortuna...

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
            mentions: [
              sender
            ]
          }
        );

      if (sentMessage?.key) {
        registerGame(
          sentMessage.key,
          game
        );
      }
    }
  );
}

export async function handleImpiccatoAnswer({
  sock,
  chat,
  sender,
  text,
  game
}) {
  if (
    game?.type !== 'impiccato'
  ) {
    return false;
  }

  const letter =
    normalizeLetter(text);

  if (
    letter.length !== 1 ||
    !/^[a-z]$/i.test(letter)
  ) {
    await sock.sendMessage(
      chat,
      {
        text:
`🪢 *IMPICCATO*

Inserisci una sola lettera. 🔤`
      }
    );

    return true;
  }

  if (
    game.guessed.includes(letter)
  ) {
    await sock.sendMessage(
      chat,
      {
        text:
`🪢 Hai già provato la lettera *${letter.toUpperCase()}*. 😂`
      }
    );

    return true;
  }

  game.guessed.push(letter);

  if (
    !game.word.includes(letter)
  ) {
    game.errors++;
  }

  const display =
    createDisplay(
      game.word,
      game.guessed
    );

  if (
    isSolved(
      game.word,
      game.guessed
    )
  ) {
    removeGame(
      game.messageId
    );

    await sock.sendMessage(
      chat,
      {
        text:
`🎉 *HAI VINTO!*

══════ •⊰✧⊱• ══════

👤 @${String(sender)
  .split('@')[0]
  .split(':')[0]}

🪢 Parola:

*${game.word.toUpperCase()}*

${display}

🏆 Hai salvato l'omino!

🤖 JARVIS è impressionato. 😎

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
        mentions: [
          sender
        ]
      }
    );

    return true;
  }

  if (
    game.errors >= MAX_ERRORS
  ) {
    removeGame(
      game.messageId
    );

    await sock.sendMessage(
      chat,
      {
        text:
`💀 *GAME OVER!*

══════ •⊰✧⊱• ══════

${drawHangman(
  game.errors
)}

🪢 La parola era:

*${game.word.toUpperCase()}*

😂 L'omino non ce l'ha fatta.

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`
      }
    );

    return true;
  }

  await sock.sendMessage(
    chat,
    {
      text:
`🪢 *IMPICCATO*

${drawHangman(
  game.errors
)}

🔤 Parola:

${display}

❤️ Errori:
*${game.errors}/${MAX_ERRORS}*

🔠 Lettere provate:
*${
  game.guessed
    .map(
      value =>
        value.toUpperCase()
    )
    .join(' ') || 'nessuna'
}*

💡 Rispondi ancora a questo messaggio con una lettera.`
    }
  );

  return true;
}
