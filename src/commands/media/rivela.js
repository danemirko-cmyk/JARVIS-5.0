import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';


function unwrapContent(content) {
  let current =
    content || null;

  for (
    let i = 0;
    i < 8 && current;
    i++
  ) {
    if (
      current.ephemeralMessage?.message
    ) {
      current =
        current.ephemeralMessage.message;
      continue;
    }

    if (
      current.viewOnceMessage?.message
    ) {
      current =
        current.viewOnceMessage.message;
      continue;
    }

    if (
      current.viewOnceMessageV2?.message
    ) {
      current =
        current.viewOnceMessageV2.message;
      continue;
    }

    if (
      current.viewOnceMessageV2Extension?.message
    ) {
      current =
        current.viewOnceMessageV2Extension.message;
      continue;
    }

    break;
  }

  return current;
}


function getQuotedMessage(message) {
  const context =
    message?.message
      ?.extendedTextMessage
      ?.contextInfo;

  return context?.quotedMessage || null;
}


function getQuotedMedia(message) {
  const quoted =
    unwrapContent(
      getQuotedMessage(
        message
      )
    );

  if (quoted?.imageMessage) {
    return {
      type: 'image',
      data: quoted.imageMessage
    };
  }

  if (quoted?.videoMessage) {
    return {
      type: 'video',
      data: quoted.videoMessage
    };
  }

  return null;
}


async function downloadMedia(
  media,
  type
) {
  const stream =
    await downloadContentFromMessage(
      media,
      type
    );

  const chunks = [];

  for await (
    const chunk of stream
  ) {
    chunks.push(chunk);
  }

  return Buffer.concat(
    chunks
  );
}


export function registerRivelaCommand(
  registerCommand
) {
  registerCommand(
    'rivela',
    async ({
      sock,
      chat,
      message
    }) => {

      const media =
        getQuotedMedia(
          message
        );

      if (!media) {
        await sock.sendMessage(
          chat,
          {
            text:
`🔐 *RIVELA*

Devi rispondere a una foto o a un video con:

*.rivela*

JARVIS scaricherà il file e lo invierà nuovamente.`
          },
          {
            quoted: message
          }
        );

        return;
      }

      try {

        await sock.sendMessage(
          chat,
          {
            text:
`🔐 *J.A.R.V.I.S 5.0*

⏳ Sto scaricando il file...
📤 Te lo rimando subito.`
          },
          {
            quoted: message
          }
        );

        const buffer =
          await downloadMedia(
            media.data,
            media.type
          );

        if (
          !buffer ||
          !buffer.length
        ) {
          throw new Error(
            'File multimediale vuoto.'
          );
        }

        if (
          media.type === 'image'
        ) {

          await sock.sendMessage(
            chat,
            {
              image: buffer
            },
            {
              quoted: message
            }
          );

        } else {

          await sock.sendMessage(
            chat,
            {
              video: buffer
            },
            {
              quoted: message
            }
          );
        }

      } catch (error) {

        console.error(
          '[RIVELA] Errore:',
          error.message
        );

        await sock.sendMessage(
          chat,
          {
            text:
`❌ *RIVELA*

Non sono riuscito a scaricare o reinviare questo file.

Riprova con un'altra foto o un altro video.`
          },
          {
            quoted: message
          }
        );
      }
    }
  );
}
