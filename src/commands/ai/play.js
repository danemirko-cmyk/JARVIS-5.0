import {
  getSong,
  cleanupAudio
} from '../../services/youtube.js';

async function downloadThumbnail(url) {
  if (!url) return null;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(
      '⚠️ Errore download copertina:',
      error?.message || error
    );

    return null;
  }
}

function createSearchingCaption(query) {
  return (
    '🔎 *JARVIS PLAY*\n\n' +
    `🎵 Cerco *${query}* su YouTube...`
  );
}

function createFoundCaption(song) {
  return (
    '🎵 *JARVIS PLAY*\n\n' +
    `🎶 ${song.title}\n` +
    `👤 ${song.author}\n` +
    `⏱️ ${song.duration}\n\n` +
    '⬇️ Audio trovato, invio il brano...'
  );
}

async function executePlay({ sock, message, args }) {
  const jid = message?.key?.remoteJid;

  if (!jid) {
    console.error('❌ .play: JID non disponibile.');
    return;
  }

  const query = Array.isArray(args)
    ? args.join(' ').trim()
    : String(args || '').trim();

  if (!query) {
    await sock.sendMessage(
      jid,
      {
        text:
          '🎵 *JARVIS PLAY*\n\n' +
          'Usa:\n' +
          '`.play nome della canzone`\n\n' +
          'Esempio:\n' +
          '`.play Imagine Dragons Believer`'
      },
      { quoted: message }
    );

    return;
  }

  let filePath = null;
  let statusMessage = null;
  let coverBuffer = null;

  try {
    /*
     * Primo messaggio:
     * cerchiamo il brano e mostriamo una copertina provvisoria.
     *
     * Non conosciamo ancora il brano esatto, quindi prima
     * effettuiamo la ricerca YouTube.
     */
    const song = await getSong(query);

    filePath = song.path;

    /*
     * Scarica la miniatura YouTube.
     */
    coverBuffer = await downloadThumbnail(song.thumbnail);

    /*
     * Primo messaggio.
     *
     * Se abbiamo la copertina:
     *   immagine + "Cerco..."
     *
     * Altrimenti:
     *   semplice testo.
     */
    if (coverBuffer) {
      statusMessage = await sock.sendMessage(
        jid,
        {
          image: coverBuffer,
          caption: createSearchingCaption(query)
        },
        { quoted: message }
      );
    } else {
      statusMessage = await sock.sendMessage(
        jid,
        {
          text: createSearchingCaption(query)
        },
        { quoted: message }
      );
    }

    /*
     * Ora modifichiamo lo stesso messaggio.
     *
     * Se era un'immagine, manteniamo la copertina
     * e cambiamo solamente la didascalia.
     */
    if (statusMessage?.key) {
      try {
        if (coverBuffer) {
          await sock.sendMessage(
            jid,
            {
              image: coverBuffer,
              caption: createFoundCaption(song),
              edit: statusMessage.key
            }
          );
        } else {
          await sock.sendMessage(
            jid,
            {
              text: createFoundCaption(song),
              edit: statusMessage.key
            }
          );
        }
      } catch (editError) {
        /*
         * Se WhatsApp non permette la modifica del tipo
         * di messaggio in quella situazione, non blocchiamo
         * il comando: mandiamo comunque il risultato.
         */
        console.error(
          '⚠️ Impossibile modificare il messaggio .play:',
          editError?.message || editError
        );

        try {
          await sock.sendMessage(
            jid,
            {
              text: createFoundCaption(song)
            },
            { quoted: message }
          );
        } catch (fallbackError) {
          console.error(
            '❌ Errore messaggio risultato .play:',
            fallbackError?.message || fallbackError
          );
        }
      }
    }

    /*
     * Invia l'audio.
     */
    await sock.sendMessage(
      jid,
      {
        audio: song.audio,
        mimetype: 'audio/mpeg',
        fileName: song.fileName,
        ptt: false
      },
      { quoted: message }
    );

    console.log(
      `[PLAY] Audio inviato: ${song.title}`
    );

  } catch (error) {
    console.error(
      '❌ Errore .play:',
      error
    );

    /*
     * Se avevamo già inviato il messaggio iniziale,
     * proviamo a modificarlo mostrando l'errore.
     */
    if (statusMessage?.key) {
      try {
        await sock.sendMessage(
          jid,
          {
            text:
              '❌ *JARVIS PLAY*\n\n' +
              'Non sono riuscito a trovare o scaricare il brano.\n\n' +
              `Motivo: ${error?.message || 'errore sconosciuto'}`,
            edit: statusMessage.key
          }
        );

        return;
      } catch (editError) {
        console.error(
          '⚠️ Impossibile modificare il messaggio di errore:',
          editError?.message || editError
        );
      }
    }

    /*
     * Fallback se il primo messaggio non era stato inviato.
     */
    try {
      await sock.sendMessage(
        jid,
        {
          text:
            '❌ *JARVIS PLAY*\n\n' +
            'Non sono riuscito a trovare o scaricare il brano.\n\n' +
            `Motivo: ${error?.message || 'errore sconosciuto'}`
        },
        { quoted: message }
      );
    } catch (sendError) {
      console.error(
        '❌ Errore invio messaggio .play:',
        sendError?.message || sendError
      );
    }

  } finally {
    /*
     * Elimina sempre i file temporanei creati da yt-dlp.
     */
    if (filePath) {
      cleanupAudio(filePath);
    }
  }
}

export function registerPlayCommand(registerCommand) {
  registerCommand('play', executePlay);
}
