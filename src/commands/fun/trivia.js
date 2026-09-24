import {
  registerGame,
  removeGame
} from '../../services/games.js';

const QUESTIONS = [
  {
    category: '🧠 Scienza',
    question: 'Qual è l’elemento chimico con simbolo Fe?',
    options: ['Fluoro', 'Ferro', 'Francio', 'Fermio'],
    answer: 1
  },
  {
    category: '🧠 Scienza',
    question: 'Quale organo pompa il sangue nel corpo umano?',
    options: ['Fegato', 'Polmone', 'Cuore', 'Rene'],
    answer: 2
  },
  {
    category: '🌍 Geografia',
    question: 'Qual è la capitale dell’Australia?',
    options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    answer: 2
  },
  {
    category: '🌍 Geografia',
    question: 'Qual è il paese più grande del mondo per superficie?',
    options: ['Canada', 'Cina', 'Russia', 'USA'],
    answer: 2
  },
  {
    category: '📚 Storia',
    question: 'In quale anno iniziò la Seconda guerra mondiale?',
    options: ['1918', '1939', '1945', '1929'],
    answer: 1
  },
  {
    category: '📚 Storia',
    question: 'Chi fu il primo imperatore romano?',
    options: ['Nerone', 'Cesare', 'Augusto', 'Traiano'],
    answer: 2
  },
  {
    category: '🎬 Cinema',
    question: 'Quale film racconta la storia del transatlantico Titanic?',
    options: ['Titanic', 'Avatar', 'Inception', 'Interstellar'],
    answer: 0
  },
  {
    category: '🎮 Videogiochi',
    question: 'Quale personaggio appartiene alla serie The Legend of Zelda?',
    options: ['Link', 'Kratos', 'Master Chief', 'Geralt'],
    answer: 0
  },
  {
    category: '⚽ Sport',
    question: 'Quanti anelli ci sono nel simbolo olimpico?',
    options: ['4', '5', '6', '7'],
    answer: 1
  },
  {
    category: '🎵 Musica',
    question: 'Quante corde ha normalmente una chitarra classica?',
    options: ['4', '5', '6', '7'],
    answer: 2
  },
  {
    category: '💻 Tecnologia',
    question: 'Cosa significa CPU?',
    options: [
      'Central Processing Unit',
      'Computer Personal Unit',
      'Central Program Utility',
      'Core Processing User'
    ],
    answer: 0
  },
  {
    category: '💻 Tecnologia',
    question: 'Quale linguaggio usa principalmente l’estensione .js?',
    options: [
      'Java',
      'JavaScript',
      'JSON',
      'JARVIS'
    ],
    answer: 1
  },
  {
    category: '🇮🇹 Italia',
    question: 'Qual è il capoluogo della Toscana?',
    options: [
      'Pisa',
      'Siena',
      'Firenze',
      'Lucca'
    ],
    answer: 2
  },
  {
    category: '🇮🇹 Italia',
    question: 'In quale città si trova il Colosseo?',
    options: [
      'Milano',
      'Roma',
      'Napoli',
      'Firenze'
    ],
    answer: 1
  },
  {
    category: '🚀 Spazio',
    question: 'Qual è il pianeta più vicino al Sole?',
    options: [
      'Venere',
      'Terra',
      'Mercurio',
      'Marte'
    ],
    answer: 2
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

export function registerTriviaCommand(
  registerCommand
) {
  registerCommand(
    'trivia',
    async ({
      sock,
      chat,
      sender
    }) => {

      const trivia =
        chooseQuestion();

      const letters = [
        'A',
        'B',
        'C',
        'D'
      ];

      const options =
        trivia.options
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
`🧠 *TRIVIA J.A.R.V.I.S*

══════ •⊰✧⊱• ══════

👤 ${mention}

${trivia.category}

❓ *${trivia.question}*

${options}

══════ •⊰✧⊱• ══════

💡 Rispondi al messaggio con *A*, *B*, *C* oppure *D*.

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
            type: 'trivia',
            chat,
            question: trivia.question,
            options: trivia.options,
            answer: trivia.answer,
            correctLetter:
              letters[trivia.answer]
          }
        );
      }
    }
  );
}

export async function handleTriviaAnswer({
  sock,
  chat,
  sender,
  text,
  game
}) {
  if (
    game?.type !== 'trivia'
  ) {
    return false;
  }

  const letters = [
    'A',
    'B',
    'C',
    'D'
  ];

  const answer =
    String(text || '')
      .trim()
      .toUpperCase();

  const index =
    letters.indexOf(answer);

  if (index === -1) {
    await sock.sendMessage(
      chat,
      {
        text:
`🧠 *TRIVIA*

Risposta non valida.

Usa:
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
`🎉 *TRIVIA CORRETTA!*

👤 ${mention}

🧠 Risposta: *${answer}*

🏆 Preparazione mentale approvata.

🤖 JARVIS è soddisfatto. 😎`,
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
`❌ *TRIVIA SBAGLIATA!*

👤 ${mention}

❌ Hai scelto: *${answer}*

✅ Corretta:
*${game.correctLetter}) ${game.options[game.answer]}*

🤖 Ritenta, umano. 😂`,
        mentions: [
          sender
        ]
      }
    );
  }

  return true;
}
