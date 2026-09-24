const GAY_RESULTS = [
  '🌈 JARVIS ha effettuato il test...',
  '🌈 Analisi in corso...',
  '🌈 Rilevamento arcobaleno...',
  '🌈 Risultato: assolutamente 🌈'
];

const LESBICA_RESULTS = [
  '🏳️‍🌈 Analisi completata...',
  '🏳️‍🌈 Profilo analizzato...',
  '🏳️‍🌈 Compatibilità con il test rilevata...'
];

const TRANS_RESULTS = [
  '🏳️‍⚧️ Analisi completata...',
  '🏳️‍⚧️ Profilo analizzato...',
  '🏳️‍⚧️ Dati elaborati...'
];

const SCEMO_RESULTS = [
  '🤪 Cervello momentaneamente non disponibile 😂',
  '🤪 Il processore sembra avere qualche problema 😂',
  '🤪 Livello di scemenza rilevato 😂'
];

const PAGLIACCIO_RESULTS = [
  '🤡 Pagliaccio professionista rilevato 😂',
  '🤡 Livello di clownaggine elevato 😂',
  '🤡 Il circo ti sta cercando 😂'
];

const NPC_RESULTS = [
  '🤖 NPC rilevato.',
  '🤖 Comportamento automatico rilevato.',
  '🤖 Il libero arbitrio sembra essere offline 😂'
];

const FORTUNATO_RESULTS = [
  '🍀 Il destino sembra essere dalla tua parte!',
  '🍀 Le stelle sono favorevoli!',
  '🍀 Oggi la fortuna sorride!'
];

const SFIGA_RESULTS = [
  '💀 Il destino sta ridendo...',
  '💀 La fortuna ha deciso di abbandonarti 😂',
  '💀 Oggi non sembra proprio la tua giornata 😂'
];

const SIMPATICO_RESULTS = [
  '😎 Decisamente simpatico!',
  '😎 Gli esperti hanno approvato!',
  '😎 Livello simpatia elevato!'
];

function randomItem(array) {
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

function randomPercentage() {
  return Math.floor(Math.random() * 101);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeJid(jid) {
  return String(jid || '')
    .replace(/:\d+(?=@)/, '');
}

function getJidsFromMessage(message) {
  const context =
    message?.message
      ?.extendedTextMessage
      ?.contextInfo;

  const mentioned = context?.mentionedJid;

  if (
    Array.isArray(mentioned) &&
    mentioned.length
  ) {
    return mentioned.map(normalizeJid);
  }

  if (context?.participant) {
    return [
      normalizeJid(context.participant)
    ];
  }

  return [];
}

function getMention(jid) {
  return `@${String(jid)
    .split('@')[0]
    .split(':')[0]}`;
}

function getUniqueJids(jids) {
  return [
    ...new Set(
      (jids || [])
        .filter(Boolean)
        .map(normalizeJid)
    )
  ];
}

async function sendReaction(
  sock,
  chat,
  key,
  emoji
) {
  if (!key) {
    return;
  }

  try {
    await sock.sendMessage(
      chat,
      {
        react: {
          text: emoji,
          key
        }
      }
    );
  } catch (error) {
    console.log(
      '[DIVERTIMENTO] Reazione non inviata:',
      error.message
    );
  }
}

/*
 * Invia un normale messaggio.
 */
async function sendResult(
  sock,
  chat,
  text,
  targetJids = []
) {
  const mentions =
    getUniqueJids(targetJids);

  await sock.sendMessage(
    chat,
    {
      text,
      mentions
    }
  );
}

/*
 * ANIMAZIONE
 *
 * Viene inviato UN SOLO messaggio.
 * Ogni frame sostituisce completamente
 * quello precedente.
 */
async function progressiveMessage(
  sock,
  chat,
  steps,
  mentions = [],
  delay = 550
) {
  if (!steps.length) {
    return null;
  }

  const normalizedMentions =
    getUniqueJids(mentions);

  const sent =
    await sock.sendMessage(
      chat,
      {
        text: steps[0],
        mentions: normalizedMentions
      }
    );

  if (!sent?.key) {
    return null;
  }

  for (
    let i = 1;
    i < steps.length;
    i++
  ) {
    await sleep(delay);

    try {
      await sock.sendMessage(
        chat,
        {
          text: steps[i],
          edit: sent.key,
          mentions: normalizedMentions
        }
      );
    } catch (error) {
      console.log(
        '[DIVERTIMENTO] Edit non riuscito:',
        error.message
      );
    }
  }

  return sent.key;
}

function getExplicitTargets(message) {
  return getUniqueJids(
    getJidsFromMessage(message)
  ).slice(0, 2);
}

async function getRandomGroupMembers(
  sock,
  chat,
  sender
) {
  if (!chat?.endsWith('@g.us')) {
    return [];
  }

  try {
    const metadata =
      await sock.groupMetadata(chat);

    const participants =
      metadata?.participants || [];

    const botJid =
      normalizeJid(sock?.user?.id);

    const senderJid =
      normalizeJid(sender);

    const candidates =
      participants
        .map(
          participant =>
            normalizeJid(participant.id)
        )
        .filter(Boolean)
        .filter(
          jid =>
            jid !== botJid &&
            jid !== senderJid
        );

    const unique =
      getUniqueJids(candidates);

    if (unique.length < 2) {
      return [];
    }

    for (
      let i = unique.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        unique[i],
        unique[j]
      ] = [
        unique[j],
        unique[i]
      ];
    }

    return unique.slice(0, 2);

  } catch {
    return [];
  }
}


/* =========================
   COMANDI
========================= */

export function registerDivertimentoCommands(
  registerCommand
) {

  /* =========================
     .GAY
  ========================= */

  registerCommand(
    'gay',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const steps = [
        `🌈 *JARVIS GAY TEST 5.0*

👤 ${mention}

🧠 Analisi della persona...`,

        `🔎 Analisi comportamentale...`,

        `🌈 Rilevamento arcobaleno...`,

        `📊 Calcolo della percentuale...`,

        `🌈 *ANALISI COMPLETATA*

👤 ${mention}

📊 Percentuale gay:
*${percentage}%* 🌈`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🌈'
      );
    }
  );


  /* =========================
     .LESBICA
  ========================= */

  registerCommand(
    'lesbica',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(LESBICA_RESULTS);

      const steps = [
        `🏳️‍🌈 *TEST LESBICA*

👤 ${mention}

🧠 JARVIS sta analizzando...`,

        `🏳️‍🌈 Controllo orientamento in corso...`,

        `🏳️‍🌈 Analisi dei dati...`,

        `🏳️‍🌈 Calcolo della percentuale...`,

        `🏳️‍🌈 *RISULTATO*

👤 ${mention}

📊 Percentuale lesbica:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🏳️‍🌈'
      );
    }
  );


  /* =========================
     .TRANS
  ========================= */

  registerCommand(
    'trans',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(TRANS_RESULTS);

      const steps = [
        `🏳️‍⚧️ *TEST TRANS*

👤 ${mention}

🧠 JARVIS sta eseguendo il test...`,

        `🏳️‍⚧️ Analisi dei dati...`,

        `🏳️‍⚧️ Elaborazione in corso...`,

        `🏳️‍⚧️ Calcolo della percentuale...`,

        `🏳️‍⚧️ *RISULTATO*

👤 ${mention}

📊 Percentuale trans:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🏳️‍⚧️'
      );
    }
  );


  /* =========================
     .FORTUNATO
  ========================= */

  registerCommand(
    'fortunato',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(FORTUNATO_RESULTS);

      const steps = [
        `🍀 *TEST FORTUNA*

👤 ${mention}

🔮 JARVIS sta consultando la fortuna...`,

        `🍀 Le probabilità si stanno allineando...`,

        `🍀 Il destino sta parlando...`,

        `📊 Calcolo della percentuale...`,

        `🍀 *RISULTATO*

👤 ${mention}

📊 Percentuale fortuna:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🍀'
      );
    }
  );


  /* =========================
     .SCEMO
  ========================= */

  registerCommand(
    'scemo',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(SCEMO_RESULTS);

      const steps = [
        `🤪 *TEST INTELLIGENZA*

👤 ${mention}

🧠 Calcolo del livello di stupidità...`,

        `🤪 Elaborazione neurale...`,

        `🤪 Controllo del cervello...`,

        `📊 Calcolo della percentuale...`,

        `🤪 *RISULTATO*

👤 ${mention}

📊 Percentuale scemenza:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🤪'
      );
    }
  );


  /* =========================
     .PAGLIACCIO
  ========================= */

  registerCommand(
    'pagliaccio',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(PAGLIACCIO_RESULTS);

      const steps = [
        `🤡 *TEST PAGLIACCIO*

👤 ${mention}

🤡 Analisi della clownaggine...`,

        `🤡 Rilevamento pagliaccio...`,

        `🤡 Il sistema sta ridendo...`,

        `📊 Calcolo della percentuale...`,

        `🤡 *RISULTATO*

👤 ${mention}

📊 Percentuale pagliaccio:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🤡'
      );
    }
  );


  /* =========================
     .NPC
  ========================= */

  registerCommand(
    'npc',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(NPC_RESULTS);

      const steps = [
        `🤖 *NPC TEST*

👤 ${mention}

🤖 Analisi comportamento...`,

        `🤖 Controllo delle risposte automatiche...`,

        `🤖 Ricerca del libero arbitrio...`,

        `📊 Calcolo della percentuale...`,

        `🤖 *RISULTATO*

👤 ${mention}

📊 Percentuale NPC:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🤖'
      );
    }
  );


  /* =========================
     .SFIGA
  ========================= */

  registerCommand(
    'sfiga',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(SFIGA_RESULTS);

      const steps = [
        `💀 *TEST SFIGA*

👤 ${mention}

💀 Analisi della sfiga...`,

        `💀 Consultazione del destino...`,

        `💀 Il destino sta ridendo...`,

        `📊 Calcolo della percentuale...`,

        `💀 *RISULTATO*

👤 ${mention}

📊 Percentuale sfiga:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '💀'
      );
    }
  );


  /* =========================
     .SIMPATICO
  ========================= */

  registerCommand(
    'simpatico',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const percentage =
        randomPercentage();

      const result =
        randomItem(SIMPATICO_RESULTS);

      const steps = [
        `😎 *TEST SIMPATIA*

👤 ${mention}

😎 Analisi della simpatia...`,

        `😎 JARVIS sta interrogando gli esperti...`,

        `😎 Analisi del comportamento sociale...`,

        `📊 Calcolo della percentuale...`,

        `😎 *RISULTATO*

👤 ${mention}

📊 Percentuale simpatia:
*${percentage}%*

${result}`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [target],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '😎'
      );
    }
  );


  /* =========================
     .SEGA
  ========================= */

  registerCommand(
    'sega',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0] ||
        normalizeJid(sender);

      const mention =
        getMention(target);

      const frames = [
        `😈 *JARVIS STA INIZIANDO...*

👤 ${mention}

⏳ Preparazione...`,

        `😈 *JARVIS STA INIZIANDO...*

8==👊==D`,

        `😈 *JARVIS STA INIZIANDO...*

8===👊=D`,

        `😈 *JARVIS STA INIZIANDO...*

8=👊===D`,

        `😈 *JARVIS STA INIZIANDO...*

8==👊==D`,

        `😈 *JARVIS STA INIZIANDO...*

8===👊=D`,

        `😈 *JARVIS STA INIZIANDO...*

8=👊===D`,

        `😂 *OPERAZIONE COMPLETATA!*

👤 ${mention}

💦 JARVIS ha terminato! 🤣`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          frames,
          [target],
          350
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '💦'
      );
    }
  );


  /* =========================
     .SCOPA
  ========================= */

  registerCommand(
    'scopa',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      const targets =
        getExplicitTargets(message);

      const target =
        targets[0];

      if (
        !target ||
        normalizeJid(target) ===
        normalizeJid(sender)
      ) {

        await sock.sendMessage(
          chat,
          {
            text:
`🧹 *SCOPA JARVIS*

Usa:

*.scopa @utente*

oppure rispondi al messaggio di una persona con *.scopa*.`
          }
        );

        return;
      }

      const actor =
        normalizeJid(sender);

      const actorMention =
        getMention(actor);

      const targetMention =
        getMention(target);

      await sock.sendMessage(
        chat,
        {
          text:
`🧹 *SCOPA JARVIS*

👤 ${actorMention}

❤️‍🔥 ${actorMention} e ${targetMention} sono stati ufficialmente abbinati da JARVIS. 😂`,
          mentions: [
            actor,
            target
          ]
        }
      );
    }
  );


  /* =========================
     .SHIP
  ========================= */

  registerCommand(
    'ship',
    async ({
      sock,
      chat,
      sender,
      message
    }) => {

      let targets =
        getExplicitTargets(message);

      if (targets.length >= 2) {

        targets =
          targets.slice(0, 2);

      } else if (targets.length === 1) {

        targets = [
          normalizeJid(sender),
          targets[0]
        ];

      } else {

        await sock.sendMessage(
          chat,
          {
            text:
`💘 *SHIP*

Usa:

*.ship @utente*

oppure:

*.ship @utente1 @utente2*`
          }
        );

        return;
      }

      const first =
        targets[0];

      const second =
        targets[1];

      const firstMention =
        getMention(first);

      const secondMention =
        getMention(second);

      const compatibility =
        randomPercentage();

      const steps = [
        `💘 *SHIP J.A.R.V.I.S 5.0*

${firstMention} ❤️ ${secondMention}

🔎 Analisi della coppia...`,

        `🧠 Controllo della compatibilità...`,

        `💞 Calcolo della chimica...`,

        `✨ Il destino sta decidendo...`,

        `💘 *RISULTATO*

${firstMention} ❤️ ${secondMention}

📊 Compatibilità:
*${compatibility}%* ❤️`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [
            first,
            second
          ],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '❤️'
      );
    }
  );


  /* =========================
     .CRUSH
  ========================= */

  registerCommand(
    'crush',
    async ({
      sock,
      chat,
      sender
    }) => {

      const targets =
        await getRandomGroupMembers(
          sock,
          chat,
          sender
        );

      if (targets.length < 2) {

        await sock.sendMessage(
          chat,
          {
            text:
`❤️ *CRUSH*

Mi servono almeno due membri disponibili nel gruppo per trovare una coppia casuale. 😂`
          }
        );

        return;
      }

      const first =
        targets[0];

      const second =
        targets[1];

      const firstMention =
        getMention(first);

      const secondMention =
        getMention(second);

      const compatibility =
        randomPercentage();

      const steps = [
        `❤️ *CRUSH J.A.R.V.I.S 5.0*

🎲 JARVIS sta scegliendo due persone a caso...`,

        `🔎 Scansione dei membri del gruppo...`,

        `🎲 Estrazione casuale in corso...`,

        `💘 Il destino ha scelto...`,

        `❤️ *RISULTATO*

💘 ${firstMention} ❤️ ${secondMention}

📊 Compatibilità:
*${compatibility}%* ❤️`
      ];

      const sent =
        await progressiveMessage(
          sock,
          chat,
          steps,
          [
            first,
            second
          ],
          550
        );

      await sendReaction(
        sock,
        chat,
        sent,
        '🫰'
      );
    }
  );


  /* =========================
     .DIVENTAADMIN
  ========================= */

  registerCommand(
    'diventaadmin',
    async ({
      sock,
      chat,
      sender
    }) => {

      const mention =
        getMention(sender);

      const steps = [
        `👑 *J.A.R.V.I.S 5.0*

👤 ${mention}

Richiesta dei poteri da admin...`,

        `🔐 Verifica dei permessi...`,

        `⚙️ Accesso al pannello amministratore...`,

        `🛡️ Controllo autorizzazione...`,

        `❌ *ACCESSO NEGATO*

👤 ${mention}

Devi prima convincere un vero admin 😂`
      ];

      await progressiveMessage(
        sock,
        chat,
        steps,
        [sender],
        550
      );
    }
  );

}
