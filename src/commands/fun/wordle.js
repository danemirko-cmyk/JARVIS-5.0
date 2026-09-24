import {
  getMiniGame,
  setMiniGame,
  deleteMiniGame
} from '../../services/miniGames.js';

/*
 * ============================================================
 * WORDLE — J.A.R.V.I.S 5.0
 * ============================================================
 *
 * Tutte le parole devono avere ESATTAMENTE 5 lettere.
 * Il filtro viene applicato automaticamente anche se in futuro
 * viene aggiunta per errore una parola più corta/lunga.
 */

const WORDS = [
  'amore',
  'amico',
  'aroma',
  'barca',
  'beato',
  'birra',
  'bravo',
  'carne',
  'carta',
  'cielo',
  'corsa',
  'cuore',
  'dente',
  'donna',
  'dormi',
  'fiore',
  'fuoco',
  'gatto',
  'gioco',
  'gusto',
  'hotel',
  'latte',
  'libro',
  'miele',
  'morte',
  'mondo',
  'notte',
  'occhi',
  'pesca',
  'pizza',
  'pollo',
  'radio',
  'regno',
  'sedia',
  'sogno',
  'sport',
  'stare',
  'tempo',
  'terra',
  'testa',
  'tigre',
  'treno',
  'verde',
  'vento',
  'vetro',
  'vino',
  'volpe'
];

/*
 * Sicurezza:
 * vengono mantenute SOLO parole di 5 lettere.
 */
const VALID_WORDS = WORDS.filter(
  word => normalize(word).length === 5
);

function normalize(word) {
  return String(word || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function evaluate(guess, answer) {
  const result = Array(5).fill('⬛');

  const answerChars = answer.split('');
  const guessChars = guess.split('');

  /*
   * LETTERE CORRETTE
   */
  for (let i = 0; i < 5; i++) {
    if (
      guessChars[i] === answerChars[i]
    ) {
      result[i] = '🟩';

      answerChars[i] = null;
      guessChars[i] = null;
    }
  }

  /*
   * LETTERE PRESENTI MA POSIZIONE SBAGLIATA
   */
  for (let i = 0; i < 5; i++) {
    if (!guessChars[i]) continue;

    const index =
      answerChars.indexOf(guessChars[i]);

    if (index !== -1) {
      result[i] = '🟨';
      answerChars[index] = null;
    }
  }

  return result.join('');
}

function renderHistory(game) {
  if (!game.history.length) {
    return 'Nessun tentativo ancora.';
  }

  return game.history
    .map(
      item =>
        `${item.pattern}  ${item.word.toUpperCase()}`
    )
    .join('\n');
}

function getRandomWord() {
  /*
   * Doppio controllo:
   * anche se WORDS venisse modificato in futuro,
   * la risposta sarà SEMPRE di 5 lettere.
   */
  const validWords = VALID_WORDS.filter(
    word => normalize(word).length === 5
  );

  if (!validWords.length) {
    throw new Error(
      'WORDLE: nessuna parola valida di 5 lettere disponibile.'
    );
  }

  return validWords[
    Math.floor(Math.random() * validWords.length)
  ];
}

export function registerWordleCommand(registerCommand) {
  registerCommand(
    'wordle',
    async ({
      sock,
      chat,
      sender,
      args,
      message
    }) => {

      let game = getMiniGame(chat);

      /*
       * ========================================================
       * NUOVA PARTITA
       * ========================================================
       */

      if (!game) {
        const answer = getRandomWord();

        game = {
          type: 'wordle',
          answer,
          attempts: 0,
          maxAttempts: 6,
          history: [],
          players: new Set()
        };

        setMiniGame(chat, game);

        await sock.sendMessage(
          chat,
          {
            text:
`🟩 *WORDLE — J.A.R.V.I.S 5.0*

Indovina la parola italiana di *5 lettere*.

══════ •⊰✧⊱• ══════

🟩 Lettera corretta
🟨 Lettera presente
⬛ Lettera assente

🎯 Tentativi disponibili: *6*

👉 Scrivi:
*.wordle parola*

💡 Tutti possono partecipare!`
          },
          { quoted: message }
        );

        return;
      }

      /*
       * ========================================================
       * SICUREZZA — UN ALTRO MINIGIOCO È ATTIVO
       * ========================================================
       */

      if (game.type !== 'wordle') {
        await sock.sendMessage(
          chat,
          {
            text:
`⚠️ *C'È GIÀ UN GIOCO ATTIVO!*

🎮 Gioco attuale: *${game.type}*

Concludi prima quello in corso.`
          },
          { quoted: message }
        );

        return;
      }

      /*
       * ========================================================
       * TENTATIVO
       * ========================================================
       */

      const guess = normalize(args?.[0]);

      if (guess.length !== 5) {
        await sock.sendMessage(
          chat,
          {
            text:
              '❌ La parola deve avere esattamente *5 lettere*.'
          },
          { quoted: message }
        );

        return;
      }

      game.players.add(sender);
      game.attempts++;

      const pattern = evaluate(
        guess,
        game.answer
      );

      game.history.push({
        word: guess,
        pattern
      });

      /*
       * ========================================================
       * VITTORIA
       * ========================================================
       */

      if (guess === game.answer) {
        deleteMiniGame(chat);

        await sock.sendMessage(
          chat,
          {
            text:
`🏆 *WORDLE COMPLETATO!*

🎉 @${sender.split('@')[0]} ha indovinato!

${renderHistory(game)}

══════ •⊰✧⊱• ══════

🟩 *PAROLA:* ${game.answer.toUpperCase()}

🎯 Tentativi: *${game.attempts}*`,
            mentions: [sender]
          }
        );

        return;
      }

      /*
       * ========================================================
       * SCONFITTA
       * ========================================================
       */

      if (game.attempts >= game.maxAttempts) {
        deleteMiniGame(chat);

        await sock.sendMessage(
          chat,
          {
            text:
`💀 *WORDLE — GAME OVER*

${renderHistory(game)}

══════ •⊰✧⊱• ══════

😈 La parola era:

*${game.answer.toUpperCase()}*

😂 Ci avete provato!`
          }
        );

        return;
      }

      /*
       * ========================================================
       * CONTINUA
       * ========================================================
       */

      await sock.sendMessage(
        chat,
        {
          text:
`🟩 *WORDLE*

${renderHistory(game)}

══════ •⊰✧⊱• ══════

🎯 Tentativi rimasti:
*${game.maxAttempts - game.attempts}*

👉 Prova ancora con:
*.wordle parola*`
        }
      );
    }
  );
}
