import {
  registerGame,
  removeGame
} from '../../services/games.js';

function randomInteger(min, max) {
  return Math.floor(
    Math.random() *
    (max - min + 1)
  ) + min;
}

function createProblem() {
  const type =
    randomInteger(0, 3);

  let a;
  let b;
  let answer;
  let question;

  if (type === 0) {
    a = randomInteger(10, 99);
    b = randomInteger(10, 99);
    answer = a + b;
    question = `${a} + ${b}`;
  }

  if (type === 1) {
    a = randomInteger(20, 100);
    b = randomInteger(10, a);
    answer = a - b;
    question = `${a} - ${b}`;
  }

  if (type === 2) {
    a = randomInteger(2, 15);
    b = randomInteger(2, 15);
    answer = a * b;
    question = `${a} × ${b}`;
  }

  if (type === 3) {
    b = randomInteger(2, 12);
    answer = randomInteger(2, 15);
    a = b * answer;
    question = `${a} ÷ ${b}`;
  }

  return {
    question,
    answer
  };
}

export function registerMatematicaCommand(
  registerCommand
) {
  registerCommand(
    'matematica',
    async ({
      sock,
      chat,
      sender
    }) => {

      const problem =
        createProblem();

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      const sentMessage =
        await sock.sendMessage(
          chat,
          {
            text:
`🔢 *MATEMATICA J.A.R.V.I.S*

══════ •⊰✧⊱• ══════

👤 ${mention}

🧮 Risolvi:

#️⃣ *${problem.question} = ?*

💡 Rispondi direttamente a questo messaggio con il risultato.

🤖 Vediamo se sai ancora fare i conti...

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
            type: 'matematica',
            chat,
            answer:
              String(problem.answer)
          }
        );
      }
    }
  );
}

export async function handleMatematicaAnswer({
  sock,
  chat,
  sender,
  text,
  game
}) {
  if (
    game?.type !== 'matematica'
  ) {
    return false;
  }

  const answer =
    String(text || '')
      .trim()
      .replace(',', '.');

  const correct =
    Number(answer) ===
    Number(game.answer);

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
`🧠 *CALCOLO CORRETTO!*

👤 ${mention}

✅ Risultato: *${game.answer}*

🏆 Einstein può stare tranquillo. 😂`,
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
`❌ *CALCOLO SBAGLIATO!*

👤 ${mention}

❌ Hai risposto: *${answer}*

✅ Risultato corretto:
*${game.answer}*

🤖 La calcolatrice è delusa. 😂`,
        mentions: [
          sender
        ]
      }
    );
  }

  return true;
}
