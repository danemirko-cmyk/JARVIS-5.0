import {
  proto,
  generateWAMessageFromContent,
  isJidGroup
} from '@whiskeysockets/baileys';

export const CHANNEL_URL =
  'https://whatsapp.com/channel/0029VbDVGD53QxRvJ0PMnX0G';

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

export async function sendChannelButtonMessage({
  sock,
  chat,
  text,
  mentions = [],
  quoted = null
}) {

  const button = {
    name: 'cta_url',

    buttonParamsJson: JSON.stringify({
      display_text: '📢 Visualizza canale',
      url: CHANNEL_URL,
      merchant_url: CHANNEL_URL
    })
  };

  const contextInfo = {
    mentionedJid: mentions
  };

  const interactiveMessage =
    proto.Message.InteractiveMessage.create({

      body:
        proto.Message.InteractiveMessage.Body.create({
          text
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

  const waMessage = generateWAMessageFromContent(
    chat,
    {
      interactiveMessage
    },
    {
      userJid: sock.user?.id,
      quoted
    }
  );

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

  await sock.relayMessage(
    chat,
    waMessage.message,
    {
      messageId: waMessage.key.id,
      additionalNodes
    }
  );

  return waMessage;
}
