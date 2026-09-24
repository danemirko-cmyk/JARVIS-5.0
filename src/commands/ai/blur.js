import sharp from 'sharp';
import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

function getImageMessage(message) {
  if (!message?.message) return null;

  if (message.message.imageMessage) {
    return message.message.imageMessage;
  }

  const quoted =
    message.message
      .extendedTextMessage
      ?.contextInfo
      ?.quotedMessage;

  if (quoted?.imageMessage) {
    return quoted.imageMessage;
  }

  return null;
}

async function downloadImage(imageMessage) {
  const stream =
    await downloadContentFromMessage(
      imageMessage,
      'image'
    );

  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export function registerBlurCommand(registerCommand) {
  registerCommand(
    'blur',
    async ({
      sock,
      chat,
      message
    }) => {

      const imageMessage =
        getImageMessage(message);

      if (!imageMessage) {
        await sock.sendMessage(
          chat,
          {
            text:
              '🌫️ *BLUR*\n\n' +
              'Devi inviare una foto oppure rispondere a una foto con `.blur`.'
          }
        );

        return;
      }

      try {
        await sock.sendMessage(
          chat,
          {
            text:
              '🌫️ Applico la sfocatura...'
          }
        );

        const originalBuffer =
          await downloadImage(
            imageMessage
          );

        if (!originalBuffer.length) {
          throw new Error(
            'Immagine vuota.'
          );
        }

        const blurredImage =
          await sharp(originalBuffer)
            .blur(18)
            .jpeg({
              quality: 90
            })
            .toBuffer();

        await sock.sendMessage(
          chat,
          {
            image: blurredImage,
            caption:
              '🌫️ *Immagine sfocata*'
          }
        );

      } catch (error) {

        console.error(
          '[BLUR] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non sono riuscito a sfocare l\'immagine.'
          }
        );
      }
    }
  );
}
