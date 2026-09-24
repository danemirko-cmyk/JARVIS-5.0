import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import {
  downloadContentFromMessage
} from '@whiskeysockets/baileys';

const execFileAsync =
  promisify(execFile);

function getMessageContent(message) {
  let content =
    message?.message || null;

  for (
    let i = 0;
    i < 8 && content;
    i++
  ) {
    if (
      content.ephemeralMessage?.message
    ) {
      content =
        content.ephemeralMessage.message;
      continue;
    }

    if (
      content.viewOnceMessage?.message
    ) {
      content =
        content.viewOnceMessage.message;
      continue;
    }

    if (
      content.viewOnceMessageV2?.message
    ) {
      content =
        content.viewOnceMessageV2.message;
      continue;
    }

    if (
      content.viewOnceMessageV2Extension?.message
    ) {
      content =
        content.viewOnceMessageV2Extension.message;
      continue;
    }

    break;
  }

  return content;
}

function getQuotedContent(message) {
  const context =
    message?.message
      ?.extendedTextMessage
      ?.contextInfo;

  return context?.quotedMessage || null;
}

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

function getMedia(message) {
  const direct =
    getMessageContent(
      message
    );

  if (direct?.imageMessage) {
    return {
      type: 'image',
      data: direct.imageMessage
    };
  }

  if (direct?.videoMessage) {
    return {
      type: 'video',
      data: direct.videoMessage
    };
  }

  const quoted =
    unwrapContent(
      getQuotedContent(
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

async function createImageSticker(
  buffer,
  basePath
) {
  const inputPath =
    path.join(
      basePath,
      `jarvis-sticker-${Date.now()}.jpg`
    );

  const outputPath =
    inputPath.replace(
      /\.jpg$/,
      '.webp'
    );

  fs.writeFileSync(
    inputPath,
    buffer
  );

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        inputPath,

        '-vf',
        'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0',

        '-vcodec',
        'libwebp',

        '-lossless',
        '0',

        '-q:v',
        '70',

        '-compression_level',
        '6',

        outputPath
      ],
      {
        maxBuffer:
          5 * 1024 * 1024
      }
    );

    return {
      inputPath,
      outputPath,
      buffer:
        fs.readFileSync(
          outputPath
        )
    };

  } catch (error) {
    throw error;
  }
}

async function createVideoSticker(
  buffer,
  basePath
) {
  const inputPath =
    path.join(
      basePath,
      `jarvis-sticker-${Date.now()}.mp4`
    );

  const outputPath =
    inputPath.replace(
      /\.mp4$/,
      '.webp'
    );

  fs.writeFileSync(
    inputPath,
    buffer
  );

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-i',
        inputPath,

        '-t',
        '6',

        '-vf',
        'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0,fps=15',

        '-an',

        '-vcodec',
        'libwebp',

        '-loop',
        '0',

        '-preset',
        'default',

        '-lossless',
        '0',

        '-q:v',
        '60',

        '-compression_level',
        '6',

        outputPath
      ],
      {
        maxBuffer:
          5 * 1024 * 1024
      }
    );

    return {
      inputPath,
      outputPath,
      buffer:
        fs.readFileSync(
          outputPath
        )
    };

  } catch (error) {
    throw error;
  }
}

function cleanupFile(filePath) {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(
        filePath
      );
    }
  } catch {}
}

export function registerSCommand(
  registerCommand
) {
  registerCommand(
    's',
    async ({
      sock,
      chat,
      message
    }) => {

      const media =
        getMedia(
          message
        );

      if (!media) {
        await sock.sendMessage(
          chat,
          {
            text:
`🏷️ *STICKER J.A.R.V.I.S 5.0*

Invia una foto o un video con:

*.s*

oppure rispondi a una foto/video con:

*.s*`
          }
        );

        return;
      }

      const basePath =
        '/data/data/com.termux/files/usr/tmp';

      let result = null;

      try {
        await sock.sendMessage(
          chat,
          {
            text:
              '⏳ *J.A.R.V.I.S 5.0*\n\n' +
              '🛠️ Sto creando lo sticker...'
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
            'Media vuoto.'
          );
        }

        if (
          media.type === 'image'
        ) {
          result =
            await createImageSticker(
              buffer,
              basePath
            );
        } else {
          result =
            await createVideoSticker(
              buffer,
              basePath
            );
        }

        await sock.sendMessage(
          chat,
          {
            sticker:
              result.buffer
          },
          {
            quoted:
              message
          }
        );

      } catch (error) {

        console.error(
          '[STICKER] Errore:',
          error.message
        );

        const errorText =
          String(
            error?.message || ''
          ).toLowerCase();

        if (
          error?.code === 'ENOENT' ||
          errorText.includes(
            'ffmpeg'
          )
        ) {
          await sock.sendMessage(
            chat,
            {
              text:
`❌ *FFMPEG NON DISPONIBILE*

Per usare *.s* installalo con:

pkg update
pkg install ffmpeg`
            }
          );

        } else if (
          media.type === 'video'
        ) {
          await sock.sendMessage(
            chat,
            {
              text:
`❌ *STICKER VIDEO*

Non riesco a trasformare questo video in uno sticker.

Prova con un video breve, massimo circa 6 secondi.`
            }
          );

        } else {
          await sock.sendMessage(
            chat,
            {
              text:
`❌ *STICKER*

Non riesco a creare lo sticker da questo file.

Prova con un'altra foto.`
            }
          );
        }

      } finally {

        cleanupFile(
          result?.inputPath
        );

        cleanupFile(
          result?.outputPath
        );
      }
    }
  );
}
