import {
  getUserByJid,
  getBalance,
  addCoins,
  getRemainingCooldown,
  setCooldown,
  formatCooldown
} from '../../services/economy.js';

const WORK_COOLDOWN = 60 * 60;

const JOBS = [
  {
    text: 'Hai riparato un reattore Arc!',
    min: 80,
    max: 200
  },
  {
    text: 'Hai servito cocktail al bar.',
    min: 50,
    max: 150
  },
  {
    text: 'Hai fatto una consegna urgente.',
    min: 70,
    max: 180
  },
  {
    text: 'Hai scritto codice per Stark Industries.',
    min: 100,
    max: 250
  },
  {
    text: 'Hai aiutato JARVIS a sistemare i server.',
    min: 90,
    max: 220
  },
  {
    text: 'Hai venduto un vecchio componente tecnologico.',
    min: 60,
    max: 170
  },
  {
    text: 'Hai lavorato come assistente personale.',
    min: 75,
    max: 190
  }
];

function randomInteger(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}

export function registerLavoroCommand(
  registerCommand
) {

  registerCommand(
    'lavoro',
    async ({
      sock,
      chat,
      sender
    }) => {

      const user =
        getUserByJid(sender);

      if (!user) {

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
          user.id,
          'work',
          WORK_COOLDOWN
        );

      if (remaining > 0) {

        await sock.sendMessage(
          chat,
          {
            text:
`⏳ *LAVORO*

Hai già lavorato recentemente.

🕐 Potrai lavorare nuovamente tra:

*${formatCooldown(remaining)}*

💼 Cooldown: *1 ora*`
          }
        );

        return;
      }

      const job =
        JOBS[
          Math.floor(
            Math.random() * JOBS.length
          )
        ];

      const reward =
        randomInteger(
          job.min,
          job.max
        );

      addCoins(
        user.id,
        reward
      );

      setCooldown(
        user.id,
        'work'
      );

      const balance =
        getBalance(user.id);

      const mention =
        `@${String(sender)
          .split('@')[0]
          .split(':')[0]}`;

      await sock.sendMessage(
        chat,
        {
          text:
`💼 *LAVORO COMPLETATO*

══════ •⊰✧⊱• ══════

👤 ${mention}

🛠️ ${job.text}

💰 Guadagno:
*+${reward} JCoins*

💳 Saldo attuale:
*${balance} JCoins*

⏰ Potrai lavorare nuovamente
tra 1 ora.

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`,
          mentions: [
            sender
          ]
        }
      );
    }
  );
}
