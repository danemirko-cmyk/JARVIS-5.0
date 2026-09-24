import {
  registerGame,
  removeGame
} from '../../services/games.js';

const QUESTIONS = [
  {
    category: '🌍 Geografia',
    difficulty: 'Facile',
    question: 'Qual è la capitale d’Italia?',
    options: [
      'Milano',
      'Roma',
      'Napoli',
      'Torino'
    ],
    answer: 1
  },
  {
    category: '🌍 Geografia',
    difficulty: 'Facile',
    question: 'Qual è il continente più grande?',
    options: [
      'Europa',
      'Africa',
      'Asia',
      'Oceania'
    ],
    answer: 2
  },
  {
    category: '🌍 Geografia',
    difficulty: 'Media',
    question:
      'Qual è il fiume più lungo d’Italia?',
    options: [
      'Arno',
      'Po',
      'Tevere',
      'Adige'
    ],
    answer: 1
  },
  {
    category: '🌍 Geografia',
    difficulty: 'Facile',
    question:
      'Qual è la capitale della Francia?',
    options: [
      'Madrid',
      'Parigi',
      'Berlino',
      'Londra'
    ],
    answer: 1
  },
  {
    category: '🌍 Geografia',
    difficulty: 'Media',
    question:
      'In quale paese si trova Tokyo?',
    options: [
      'Cina',
      'Corea del Sud',
      'Giappone',
      'Thailandia'
    ],
    answer: 2
  },

  {
    category: '🔬 Scienza',
    difficulty: 'Facile',
    question:
      'Quale pianeta è conosciuto come Pianeta Rosso?',
    options: [
      'Venere',
      'Marte',
      'Giove',
      'Mercurio'
    ],
    answer: 1
  },
  {
    category: '🔬 Scienza',
    difficulty: 'Facile',
    question:
      'Quante zampe ha normalmente un ragno?',
    options: [
      '6',
      '8',
      '10',
      '12'
    ],
    answer: 1
  },
  {
    category: '🔬 Scienza',
    difficulty: 'Facile',
    question:
      'Qual è il simbolo chimico dell’oro?',
    options: [
      'Ag',
      'Fe',
      'Au',
      'O'
    ],
    answer: 2
  },
  {
    category: '🔬 Scienza',
    difficulty: 'Media',
    question:
      'Qual è il pianeta più grande del Sistema Solare?',
    options: [
      'Saturno',
      'Giove',
      'Nettuno',
      'Terra'
    ],
    answer: 1
  },
  {
    category: '🔬 Scienza',
    difficulty: 'Media',
    question:
      'Qual è la velocità approssimativa della luce nel vuoto?',
    options: [
      '300 km/s',
      '3.000 km/s',
      '30.000 km/s',
      '300.000 km/s'
    ],
    answer: 3
  },

  {
    category: '📚 Cultura',
    difficulty: 'Facile',
    question:
      'Quante lettere ha l’alfabeto italiano tradizionale?',
    options: [
      '21',
      '26',
      '24',
      '20'
    ],
    answer: 0
  },
  {
    category: '📚 Cultura',
    difficulty: 'Facile',
    question:
      'Chi ha scritto la Divina Commedia?',
    options: [
      'Dante Alighieri',
      'Alessandro Manzoni',
      'Giovanni Boccaccio',
      'Francesco Petrarca'
    ],
    answer: 0
  },
  {
    category: '📚 Cultura',
    difficulty: 'Media',
    question:
      'Chi ha dipinto la Gioconda?',
    options: [
      'Michelangelo',
      'Leonardo da Vinci',
      'Raffaello',
      'Caravaggio'
    ],
    answer: 1
  },

  {
    category: '🎮 Videogiochi',
    difficulty: 'Facile',
    question:
      'Quale azienda produce PlayStation?',
    options: [
      'Microsoft',
      'Nintendo',
      'Sony',
      'Sega'
    ],
    answer: 2
  },
  {
    category: '🎮 Videogiochi',
    difficulty: 'Facile',
    question:
      'Qual è il protagonista principale di Minecraft?',
    options: [
      'Steve',
      'Mario',
      'Link',
      'Sonic'
    ],
    answer: 0
  },
  {
    category: '🎮 Videogiochi',
    difficulty: 'Media',
    question:
      'Quale console è prodotta da Microsoft?',
    options: [
      'PlayStation 5',
      'Xbox Series X',
      'Nintendo Switch',
      'Steam Deck'
    ],
    answer: 1
  },

  {
    category: '🎬 Cinema',
    difficulty: 'Facile',
    question:
      'Quale supereroe è noto come Uomo Ragno?',
    options: [
      'Batman',
      'Spider-Man',
      'Iron Man',
      'Superman'
    ],
    answer: 1
  },
  {
    category: '🎬 Cinema',
    difficulty: 'Facile',
    question:
      'Come si chiama il mago protagonista di Harry Potter?',
    options: [
      'Harry Potter',
      'Ron Weasley',
      'Draco Malfoy',
      'Albus Silente'
    ],
    answer: 0
  },
  {
    category: '🎬 Cinema',
    difficulty: 'Media',
    question:
      'Quale personaggio è Tony Stark?',
    options: [
      'Iron Man',
      'Batman',
      'Thor',
      'Captain America'
    ],
    answer: 0
  },

  {
    category: '⚽ Sport',
    difficulty: 'Facile',
    question:
      'Quanti giocatori ha normalmente una squadra di calcio in campo?',
    options: [
      '9',
      '10',
      '11',
      '12'
    ],
    answer: 2
  },
  {
    category: '⚽ Sport',
    difficulty: 'Facile',
    question:
      'Quale sport utilizza una racchetta e una pallina?',
    options: [
      'Calcio',
      'Tennis',
      'Nuoto',
      'Atletica'
    ],
    answer: 1
  },
  {
    category: '⚽ Sport',
    difficulty: 'Media',
    question:
      'Quanti minuti dura normalmente una partita di calcio, escluso recupero?',
    options: [
      '60',
      '80',
      '90',
      '120'
    ],
    answer: 2
  },

  {
    category: '🍕 Italia',
    difficulty: 'Facile',
    question:
      'Quale città è famosa per la pizza napoletana?',
    options: [
      'Napoli',
      'Milano',
      'Torino',
      'Bologna'
    ],
    answer: 0
  },
  {
    category: '🍕 Italia',
    difficulty: 'Facile',
    question:
      'Qual è la capitale d’Italia?',
    options: [
      'Firenze',
      'Roma',
      'Venezia',
      'Pisa'
    ],
    answer: 1
  },
  {
    category: '🍕 Italia',
    difficulty: 'Media',
    question:
      'Quale città è famosa per la Torre pendente?',
    options: [
      'Pisa',
      'Genova',
      'Perugia',
      'Verona'
    ],
    answer: 0
  }
];

function chooseQuestion() {
  return QUESTIONS[
    Math.floor(
      Math.random() *
      QUESTIONS.length
    )
  ];
}

export function registerQuizCommand(
  registerCommand
) {

  registerCommand(
    'quiz',
    async ({
      sock,
      chat,
      sender
    }) => {

      const quiz =
        chooseQuestion();

      const letters = [
        'A',
        'B',
        'C',
        'D'
      ];

      const options =
        quiz.options
          .map(
            (option, index) =>
              `${letters[index]}) ${option}`
          )
          .join('\n');

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      const sentMessage =
        await sock.sendMessage(
          chat,
          {
            text:
`🎯 *QUIZ J.A.R.V.I.S*

══════ •⊰✧⊱• ══════

👤 ${mention}

${quiz.category}
📊 Difficoltà: *${quiz.difficulty}*

❓ *${quiz.question}*

${options}

══════ •⊰✧⊱• ══════

💡 Rispondi direttamente a questo messaggio con *A*, *B*, *C* oppure *D*.

🤖 JARVIS osserva...

— *J.A.R.V.I.S 5.0* —`,
            mentions: [
              sender
            ]
          }
        );

      if (sentMessage?.key) {

        registerGame(
          sentMessage.key,
          {
            type: 'quiz',
            chat,
            question:
              quiz.question,
            options:
              quiz.options,
            answer:
              quiz.answer,
            correctLetter:
              letters[quiz.answer],
            sender
          }
        );
      }
    }
  );
}

export async function handleQuizAnswer({
  sock,
  chat,
  message,
  sender,
  text,
  game
}) {

  if (
    game?.type !==
    'quiz'
  ) {
    return false;
  }

  const answer =
    String(text || '')
      .trim()
      .toUpperCase();

  const letters = [
    'A',
    'B',
    'C',
    'D'
  ];

  const index =
    letters.indexOf(answer);

  if (index === -1) {

    await sock.sendMessage(
      chat,
      {
        text:
`🎯 *QUIZ*

Risposta non valida.

Rispondi al messaggio del quiz con:

*A* • *B* • *C* • *D*`
      }
    );

    return true;
  }

  removeGame(
    game.messageId
  );

  const mention =
    `@${String(sender)
      .split('@')[0]
      .split(':')[0]}`;

  if (
    index === game.answer
  ) {

    await sock.sendMessage(
      chat,
      {
        text:
`🎉 *RISPOSTA CORRETTA!*

══════ •⊰✧⊱• ══════

👤 ${mention}

🎯 Risposta:
*${answer}*

🏆 *Hai indovinato!*

🤖 JARVIS approva. 😎

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
        mentions: [
          sender
        ]
      }
    );

  } else {

    await sock.sendMessage(
      chat,
      {
        text:
`❌ *RISPOSTA SBAGLIATA!*

══════ •⊰✧⊱• ══════

👤 ${mention}

❌ Hai risposto:
*${answer}*

✅ Risposta corretta:
*${game.correctLetter}) ${game.options[game.answer]}*

😂 JARVIS prende nota...

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
        mentions: [
          sender
        ]
      }
    );
  }

  return true;
}
