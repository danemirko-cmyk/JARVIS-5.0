const RESULTS = [
  'ha vinto usando una padella come arma. 🍳',
  'ha vinto tirando un calcio volante. 🦵',
  'ha vinto per pura fortuna. 🍀',
  'ha vinto senza nemmeno sapere cosa stesse facendo. 😂',
  'ha vinto distraendo l’avversario con una battuta. 🤡',
  'ha vinto dopo aver chiesto aiuto a JARVIS. 🤖',
  'ha vinto inciampando accidentalmente sull’avversario. 💀',
  'ha vinto con una tecnica proibita da tutti i manuali. ☠️',
  'ha vinto perché l’avversario si è dimenticato di combattere. 😭',
  'ha vinto grazie al potere dell’amicizia. 🌈'
];

const MOVES = [
  '⚡ COLPO DEL FULMINE',
  '🥊 PUGNO DEVASTANTE',
  '🦵 CALCIO ROTANTE',
  '🍳 PADDELLATA LEGGENDARIA',
  '🪑 ATTACCO CON LA SEDIA',
  '🐔 TECNICA DEL POLLO',
  '🗿 SGUARDO DEL MOAI',
  '🧹 SPAZZATA DELLA SCOPA',
  '💨 FUGA TATTICA',
  '🤡 ATTACCO DEL PAGLIACCIO'
];

function normalizeJid(jid) {
  return String(jid || '')
    .replace(/:\d+(?=@)/, '');
}

function mention(jid) {
  return `@${normalizeJid(jid).split('@')[0]}`;
}

export function registerDuelloCommand(registerCommand) {
  registerCommand(
    'duello',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {
      const context =
        message?.message
          ?.extendedTextMessage
          ?.contextInfo;

      const mentioned =
        context?.mentionedJid || [];

      if (!mentioned.length) {
        await sock.sendMessage(
          chat,
          {
            text:
`⚔️ *DUELLO*

Scegli qualcuno da sfidare!

👉 Esempio:
.duello @utente`
          },
          { quoted: message }
        );

        return;
      }

      const opponent =
        normalizeJid(mentioned[0]);

      const player =
        normalizeJid(sender);

      if (opponent === player) {
        await sock.sendMessage(
          chat,
          {
            text:
              '😂 Non puoi duellare contro te stesso!'
          },
          { quoted: message }
        );

        return;
      }

      const winner =
        Math.random() < 0.5
          ? player
          : opponent;

      const loser =
        winner === player
          ? opponent
          : player;

      const move =
        MOVES[
          Math.floor(
            Math.random() *
            MOVES.length
          )
        ];

      const result =
        RESULTS[
          Math.floor(
            Math.random() *
            RESULTS.length
          )
        ];

      await sock.sendMessage(
        chat,
        {
          text:
`⚔️ *DUELLO — J.A.R.V.I.S 5.0*

${mention(player)}
        VS
${mention(opponent)}

══════ •⊰✧⊱• ══════

💥 *${move}*

⚡⚡⚡⚡⚡

👑 *VINCITORE:*
${mention(winner)}

${mention(winner)} ${result}

💀 *Sconfitto:*
${mention(loser)}`,
          mentions: [
            player,
            opponent
          ]
        }
      );
    }
  );
}
