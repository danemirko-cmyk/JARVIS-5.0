const OPENAI_API_URL =
  'https://api.openai.com/v1/audio/speech';

const TTS_MODEL =
  'gpt-4o-mini-tts';

const TTS_VOICE =
  'alloy';

function getQuotedText(message) {
  const quoted =
    message?.message
      ?.extendedTextMessage
      ?.contextInfo
      ?.quotedMessage;

  if (!quoted) return '';

  if (typeof quoted.conversation === 'string') {
    return quoted.conversation.trim();
  }

  if (
    typeof quoted.extendedTextMessage?.text === 'string'
  ) {
    return quoted.extendedTextMessage.text.trim();
  }

  if (
    typeof quoted.imageMessage?.caption === 'string'
  ) {
    return quoted.imageMessage.caption.trim();
  }

  if (
    typeof quoted.videoMessage?.caption === 'string'
  ) {
    return quoted.videoMessage.caption.trim();
  }

  return '';
}

export function registerTTSCommand(registerCommand) {
  registerCommand(
    'tts',
    async ({
      sock,
      chat,
      argumentText,
      message,
      args
    }) => {

      const apiKey =
        process.env.OPENAI_API_KEY;

      if (!apiKey) {
        await sock.sendMessage(
          chat,
          {
            text:
              '⚠️ OPENAI_API_KEY non configurata nel file .env.'
          }
        );

        return;
      }

      let text =
        String(argumentText || '').trim();

      /*
       * Se non è stato scritto testo dopo .tts,
       * prova a leggere il messaggio a cui si sta
       * rispondendo.
       */
      if (!text) {
        text = getQuotedText(message);
      }

      /*
       * Compatibilità nel caso il context utilizzi
       * solamente args.
       */
      if (!text && Array.isArray(args)) {
        text =
          args
            .map(value => String(value))
            .join(' ')
            .trim();
      }

      if (!text) {
        await sock.sendMessage(
          chat,
          {
            text:
              '🔊 *TTS*\n\n' +
              'Scrivi il testo dopo il comando oppure rispondi a un messaggio.\n\n' +
              'Esempio:\n' +
              '`.tts ciao ragazzi`\n\n' +
              'Oppure rispondi a un messaggio con:\n' +
              '`.tts`'
          }
        );

        return;
      }

      /*
       * Limite di sicurezza per evitare richieste
       * vocali enormi.
       */
      if (text.length > 4000) {
        await sock.sendMessage(
          chat,
          {
            text:
              '⚠️ Il testo è troppo lungo.\n' +
              'Massimo consentito: 4000 caratteri.'
          }
        );

        return;
      }

      await sock.sendMessage(
        chat,
        {
          text: '🔊 Generazione audio...'
        }
      );

      try {

        const response =
          await fetch(
            OPENAI_API_URL,
            {
              method: 'POST',

              headers: {
                'Authorization':
                  `Bearer ${apiKey}`,

                'Content-Type':
                  'application/json'
              },

              body: JSON.stringify({
                model: TTS_MODEL,
                voice: TTS_VOICE,
                input: text,
                response_format: 'mp3'
              })
            }
          );

        if (!response.ok) {

          let errorMessage =
            `HTTP ${response.status}`;

          try {
            const errorData =
              await response.json();

            errorMessage =
              errorData?.error?.message ||
              errorMessage;

          } catch {}

          throw new Error(
            errorMessage
          );
        }

        const audioBuffer =
          Buffer.from(
            await response.arrayBuffer()
          );

        if (!audioBuffer.length) {
          throw new Error(
            'Audio vuoto ricevuto da OpenAI.'
          );
        }

        await sock.sendMessage(
          chat,
          {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true
          }
        );

      } catch (error) {

        console.error(
          '[TTS] Errore:',
          error
        );

        await sock.sendMessage(
          chat,
          {
            text:
              '❌ Non sono riuscito a generare la voce.\n\n' +
              `Errore: ${error.message}`
          }
        );
      }
    }
  );
}
