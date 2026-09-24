const flows = new Map();

const FLOW_TIMEOUT = 10 * 60 * 1000;
const LOADING_TIME = 4 * 60 * 1000;

function key(chat, sender) {
  return `${chat}:${sender}`;
}

function setFlow(chat, sender, flow) {
  flows.set(
    key(chat, sender),
    {
      ...flow,
      createdAt: Date.now()
    }
  );
}

function getFlow(chat, sender) {
  const flow =
    flows.get(
      key(chat, sender)
    );

  if (!flow) {
    return null;
  }

  if (
    Date.now() - flow.createdAt >
    FLOW_TIMEOUT
  ) {
    flows.delete(
      key(chat, sender)
    );

    return null;
  }

  return flow;
}

function deleteFlow(chat, sender) {
  flows.delete(
    key(chat, sender)
  );
}

async function editMessage(
  sock,
  chat,
  messageKey,
  text
) {
  try {
    await sock.sendMessage(
      chat,
      {
        text,
        edit: messageKey
      }
    );

    return true;
  } catch {
    try {
      await sock.sendMessage(chat, {
        text
      });

      return true;
    } catch {
      return false;
    }
  }
}

async function fakeLoading(
  sock,
  chat,
  title,
  finalText
) {
  const sent =
    await sock.sendMessage(chat, {
      text:
        `${title}\n\n` +
        `⏳ Connessione in corso...\n` +
        `▰░░░░░░░░░ 10%`
    });

  const messageKey =
    sent?.key;

  if (!messageKey) {
    return;
  }

  const steps = [
    [20, 30000],
    [35, 30000],
    [50, 30000],
    [65, 30000],
    [80, 30000],
    [90, 30000],
    [100, 30000],
    [100, 30000]
  ];

  for (
    const [percent, delay] of steps
  ) {
    await new Promise(resolve =>
      setTimeout(resolve, delay)
    );

    const filled =
      Math.round(percent / 10);

    const bar =
      '▰'.repeat(filled) +
      '░'.repeat(10 - filled);

    await editMessage(
      sock,
      chat,
      messageKey,
      `${title}\n\n` +
      `⏳ Connessione in corso...\n` +
      `${bar} ${percent}%`
    );
  }

  await editMessage(
    sock,
    chat,
    messageKey,
    finalText
  );
}

/* =========================================================
   DOX
========================================================= */

export function registerDoxCommand(registerCommand) {
  registerCommand(
    'dox',
    async ({ sock, chat }) => {
      await fakeLoading(
        sock,
        chat,
        '🔎 *DOX SIMULATO*',
        '❌ *ERRORE*\n\n' +
        'La connessione tra Telegram e WhatsApp è fallita.\n\n' +
        'ℹ️ Operazione terminata.'
      );
    },
    {
      permission: 'OWNER'
    }
  );
}

/* =========================================================
   BAN
========================================================= */

export function registerBanCommand(registerCommand) {
  registerCommand(
    'ban',
    async ({ sock, chat, sender }) => {
      setFlow(
        chat,
        sender,
        {
          type: 'ban',
          step: 'platform'
        }
      );

      await sock.sendMessage(chat, {
        text:
          '🚫 *BAN SIMULATO*\n\n' +
          'Scegli il servizio:\n\n' +
          '1️⃣ Instagram\n' +
          '2️⃣ WhatsApp\n\n' +
          'Rispondi con `1` oppure `2`.'
      });
    },
    {
      permission: 'OWNER'
    }
  );
}

/* =========================================================
   HACK
========================================================= */

export function registerHackCommand(registerCommand) {
  registerCommand(
    'hack',
    async ({ sock, chat, sender }) => {
      setFlow(
        chat,
        sender,
        {
          type: 'hack',
          step: 'platform'
        }
      );

      await sock.sendMessage(chat, {
        text:
          '💻 *HACK SIMULATO*\n\n' +
          'Scegli il servizio:\n\n' +
          '1️⃣ Instagram\n' +
          '2️⃣ WhatsApp\n\n' +
          'Rispondi con `1` oppure `2`.'
      });
    },
    {
      permission: 'OWNER'
    }
  );
}

/* =========================================================
   AMAZON
========================================================= */

export function registerAmzCommand(registerCommand) {
  registerCommand(
    'amz',
    async ({ sock, chat, sender }) => {
      setFlow(
        chat,
        sender,
        {
          type: 'amz',
          step: 'email'
        }
      );

      await sock.sendMessage(chat, {
        text:
          '📦 *AMZ SIMULATO*\n\n' +
          'Inserisci l\'email associata all\'account Amazon.\n\n' +
          'ℹ️ L\'email verrà utilizzata solamente per la simulazione e non verrà salvata.'
      });
    },
    {
      permission: 'OWNER'
    }
  );
}

/* =========================================================
   GESTIONE RISPOSTE
========================================================= */

export async function handleOwnerFlowMessage({
  sock,
  chat,
  sender,
  text
}) {
  const flow =
    getFlow(
      chat,
      sender
    );

  if (!flow) {
    return false;
  }

  const input =
    String(text || '').trim();

  if (!input) {
    return true;
  }

  /* =======================================================
     BAN / HACK → SCELTA SERVIZIO
  ======================================================= */

  if (
    (
      flow.type === 'ban' ||
      flow.type === 'hack'
    ) &&
    flow.step === 'platform'
  ) {

    if (
      input !== '1' &&
      input !== '2'
    ) {
      await sock.sendMessage(chat, {
        text:
          '⚠️ Risposta non valida.\n\n' +
          'Rispondi con `1` per Instagram oppure `2` per WhatsApp.'
      });

      return true;
    }

    const platform =
      input === '1'
        ? 'Instagram'
        : 'WhatsApp';

    setFlow(
      chat,
      sender,
      {
        ...flow,
        step: 'identifier',
        platform
      }
    );

    await sock.sendMessage(chat, {
      text:
        `📱 *${platform}*\n\n` +
        (
          platform === 'WhatsApp'
            ? 'Inserisci il numero di telefono.'
            : 'Inserisci lo username Instagram.'
        )
    });

    return true;
  }

  /* =======================================================
     BAN / HACK → IDENTIFICATIVO
  ======================================================= */

  if (
    (
      flow.type === 'ban' ||
      flow.type === 'hack'
    ) &&
    flow.step === 'identifier'
  ) {

    deleteFlow(
      chat,
      sender
    );

    const title =
      flow.type === 'ban'
        ? '🚫 *BAN SIMULATO*'
        : '💻 *HACK SIMULATO*';

    await fakeLoading(
      sock,
      chat,
      title,
      '❌ *ERRORE*\n\n' +
      'La connessione tra Telegram e WhatsApp è fallita.\n\n' +
      'ℹ️ Nessuna operazione reale è stata eseguita.'
    );

    return true;
  }

  /* =======================================================
     AMAZON → EMAIL
  ======================================================= */

  if (
    flow.type === 'amz' &&
    flow.step === 'email'
  ) {

    deleteFlow(
      chat,
      sender
    );

    await fakeLoading(
      sock,
      chat,
      '📦 *AMZ SIMULATO*',
      '❌ *ERRORE*\n\n' +
      'La connessione tra Telegram e WhatsApp è fallita.\n\n' +
      'ℹ️ Nessuna operazione reale è stata eseguita.'
    );

    return true;
  }

  return false;
}
