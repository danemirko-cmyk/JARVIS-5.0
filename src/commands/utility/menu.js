import {
  proto,
  generateWAMessageFromContent,
  isJidGroup
} from '@whiskeysockets/baileys';

const CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbDVGD53QxRvJ0PMnX0G';

function getNumber(jid) {
  return String(jid || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/[^0-9]/g, '');
}

function getPrivacyModeTs() {
  const OFFSET = 77980457;

  return String(
    Math.floor(Date.now() / 1000) - OFFSET
  );
}

function buildBizNode() {
  return {
    tag: 'biz',
    attrs: {
      actual_actors: '2',
      host_storage: '2',
      privacy_mode_ts: getPrivacyModeTs()
    },
    content: [
      {
        tag: 'interactive',
        attrs: {
          type: 'native_flow',
          v: '1'
        },
        content: [
          {
            tag: 'native_flow',
            attrs: {
              v: '9',
              name: 'mixed'
            }
          }
        ]
      },
      {
        tag: 'quality_control',
        attrs: {
          source_type: 'third_party'
        }
      }
    ]
  };
}

async function measurePing(sock, chat) {
  try {
    const start = Date.now();

    await sock.presenceSubscribe(chat);

    const elapsed = Date.now() - start;

    return Math.max(1, elapsed);
  } catch (error) {
    console.error('[MENU] Errore ping:', error);
    return null;
  }
}

export function registerMenuCommand(registerCommand) {
  registerCommand('menu', async ({ sock, chat, sender }) => {

    const number = getNumber(sender) || 'utente';

    // ==========================================
    // PING REALE
    // ==========================================

    const ping = await measurePing(sock, chat);

    const pingText =
      ping !== null
        ? `${ping}ms`
        : 'non disponibile';

    // ==========================================
    // TESTO MENU
    // ==========================================

    const menuText =
`🤖 *J.A.R.V.I.S 5.0*

👋 Benvenuto @${number}
⚡ Ping: ${pingText}

══════ •⊰✧⊱• ══════

📂 *MENU*

👥 .gruppo
🛡️ .admin
👤 .proprietario
⚙️ .funzioni
👑 .owner
ℹ️ .infobot
⬆️ .up

══════ •⊰✧⊱• ══════

— *J.A.R.V.I.S 5.0* —`;

    // ==========================================
    // PULSANTE CANALE
    // ==========================================

    const button = {
      name: 'cta_url',

      buttonParamsJson: JSON.stringify({
        display_text: '📢 Visualizza canale',
        url: CHANNEL_URL,
        merchant_url: CHANNEL_URL
      })
    };

    // ==========================================
    // VERO TAG
    // ==========================================

    const contextInfo = {
      mentionedJid: sender ? [sender] : []
    };

    // ==========================================
    // INTERACTIVE MESSAGE
    // ==========================================

    const interactiveMessage =
      proto.Message.InteractiveMessage.create({

        body:
          proto.Message.InteractiveMessage.Body.create({
            text: menuText
          }),

        footer:
          proto.Message.InteractiveMessage.Footer.create({
            text: 'J.A.R.V.I.S 5.0'
          }),

        contextInfo,

        nativeFlowMessage:
          proto.Message.InteractiveMessage.NativeFlowMessage.create({

            buttons: [
              proto.Message.InteractiveMessage
                .NativeFlowMessage
                .NativeFlowButton
                .create(button)
            ],

            messageParamsJson: '{}',

            messageVersion: 1
          })
      });

    // ==========================================
    // CREA MESSAGGIO
    // ==========================================

    const waMessage = generateWAMessageFromContent(
      chat,
      {
        interactiveMessage
      },
      {
        userJid: sock.user?.id
      }
    );

    // ==========================================
    // NODI WHATSAPP
    // ==========================================

    const bizNode = buildBizNode();

    const botNode = {
      tag: 'bot',
      attrs: {
        biz_bot: '1'
      }
    };

    const additionalNodes = isJidGroup(chat)
      ? [bizNode]
      : [botNode, bizNode];

    // ==========================================
    // INVIO
    // ==========================================

    await sock.relayMessage(
      chat,
      waMessage.message,
      {
        messageId: waMessage.key.id,
        additionalNodes
      }
    );

    console.log(
      `[MENU] Ping: ${ping !== null ? ping + 'ms' : 'N/D'}`
    );
  });
}
