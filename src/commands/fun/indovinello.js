import {
  registerGame,
  checkGameAnswer,
  removeGame
} from '../../services/games.js';

const RIDDLES = [
  {
    question: 'Più ne togli, più diventa grande. Cos’è?',
    answers: ['buco', 'un buco']
  },
  {
    question: 'Ha le lancette ma non sa leggere l’ora. Cos’è?',
    answers: ['orologio', 'un orologio']
  },
  {
    question: 'Ha i denti ma non può mordere. Cos’è?',
    answers: ['pettine', 'un pettine']
  },
  {
    question: 'Più è asciutto, più si bagna. Cos’è?',
    answers: ['asciugamano', 'un asciugamano']
  },
  {
    question: 'Ha un collo ma non ha una testa. Cos’è?',
    answers: ['bottiglia', 'una bottiglia']
  },
  {
    question: 'Vola senza ali e piange senza occhi. Cos’è?',
    answers: ['nuvola', 'una nuvola']
  },
  {
    question:
      'Ha città ma non case, montagne ma non alberi e acqua ma non pesci. Cos’è?',
    answers: [
      'mappa',
      'una mappa',
      'cartina'
    ]
  },
  {
    question: 'Più ne hai, meno riesci a vedere. Cos’è?',
    answers: [
      'buio',
      'il buio'
    ]
  },
  {
    question:
      'Cammina senza gambe e corre senza piedi. Cos’è?',
    answers: [
      'acqua',
      "l'acqua",
      'l acqua'
    ]
  },
  {
    question:
      'Ha una faccia e due mani ma non ha braccia. Cos’è?',
    answers: [
      'orologio',
      'un orologio'
    ]
  },
  {
    question: 'Cosa sale ma non scende mai?',
    answers: [
      'età',
      'eta',
      "l'età",
      'l eta'
    ]
  },
  {
    question:
      'Ha molte chiavi ma non apre nessuna porta. Cos’è?',
    answers: [
      'pianoforte',
      'un pianoforte',
      'tastiera',
      'una tastiera'
    ]
  },
  {
    question:
      'Cosa puoi rompere senza toccarla?',
    answers: [
      'promessa',
      'una promessa'
    ]
  },
  {
    question:
      'È tuo, ma gli altri lo usano più di te. Cos’è?',
    answers: [
      'nome',
      'il nome'
    ]
  },
  {
    question:
      'Ha un occhio ma non può vedere. Cos’è?',
    answers: [
      'ago',
      'un ago'
    ]
  },
  {
    question:
      'Cosa entra nell’acqua ma non si bagna?',
    answers: [
      'ombra',
      "un'ombra",
      'un ombra'
    ]
  },
  {
    question:
      'Cosa ha un letto ma non dorme mai?',
    answers: [
      'fiume',
      'un fiume'
    ]
  },
  {
    question:
      'Cosa ha una testa e una coda ma non ha un corpo?',
    answers: [
      'moneta',
      'una moneta'
    ]
  },
  {
    question:
      'Cosa ha foglie ma non è un albero?',
    answers: [
      'libro',
      'un libro'
    ]
  },
  {
    question:
      'Cosa ha un cuore che non batte?',
    answers: [
      'carciofo',
      'un carciofo'
    ]
  },
  {
    question:
      'Cosa puoi prendere ma non puoi lanciare?',
    answers: [
      'raffreddore',
      'un raffreddore',
      'influenza'
    ]
  },
  {
    question:
      'Cosa ha una lingua ma non parla?',
    answers: [
      'scarpa',
      'una scarpa'
    ]
  },
  {
    question:
      'Cosa ha tanti buchi ma riesce comunque a trattenere l’acqua?',
    answers: [
      'spugna',
      'una spugna'
    ]
  },
  {
    question:
      'Cosa più viene usato, più diventa corto?',
    answers: [
      'matita',
      'una matita',
      'candela',
      'una candela'
    ]
  },
  {
    question:
      'Cosa ha occhi ma non può vedere?',
    answers: [
      'patata',
      'una patata'
    ]
  },
  {
    question:
      'Cosa può riempire una stanza senza occupare spazio?',
    answers: [
      'luce',
      'la luce'
    ]
  },
  {
    question:
      'Cosa ha le gambe ma non cammina?',
    answers: [
      'tavolo',
      'un tavolo',
      'sedia',
      'una sedia'
    ]
  }
];

function chooseRiddle() {
  return RIDDLES[
    Math.floor(
      Math.random() *
      RIDDLES.length
    )
  ];
}

export function registerIndovinelloCommand(
  registerCommand
) {

  registerCommand(
    'indovinello',
    async ({
      sock,
      chat,
      sender
    }) => {

      const riddle =
        chooseRiddle();

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      const sentMessage =
        await sock.sendMessage(
          chat,
          {
            text:
`🧩 *INDOVINELLO*

══════ •⊰✧⊱• ══════

👤 ${mention}

❓ *${riddle.question}*

💡 Rispondi direttamente a questo messaggio con la tua risposta!

🤖 JARVIS sta aspettando...

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
          {
            type: 'indovinello',
            chat,
            question:
              riddle.question,
            answers:
              riddle.answers,
            sender
          }
        );
      }
    }
  );
}

export async function handleIndovinelloAnswer({
  sock,
  chat,
  message,
  sender,
  text,
  game
}) {

  if (
    game?.type !==
    'indovinello'
  ) {
    return false;
  }

  const correct =
    checkGameAnswer(
      game,
      text
    );

  removeGame(
    game.messageId
  );

  const mention =
    `@${String(sender)
      .split('@')[0]
      .split(':')[0]}`;

  if (correct) {

    await sock.sendMessage(
      chat,
      {
        text:
`🎉 *RISPOSTA CORRETTA!*

══════ •⊰✧⊱• ══════

👤 ${mention}

🧩 Hai indovinato l'indovinello!

🏆 *Complimenti!*

🤖 JARVIS è impressionato. 😎

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

👤 ${mention}

🤔 La risposta:

*${game.answers[0]}*

😂 Ritenta la prossima volta!

— *J.A.R.V.I.S 5.0* —`,
        mentions: [
          sender
        ]
      }
    );
  }

  return true;
}
