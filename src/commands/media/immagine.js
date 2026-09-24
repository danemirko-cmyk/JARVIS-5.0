import {
  generateImage
} from '../../services/imageGeneration.js';

export function registerImmagineCommand(
  registerCommand
) {
  registerCommand(
    'immagine',
    async ({
      sock,
      chat,
      argumentText,
      message
    }) => {

      const prompt =
        String(
          argumentText || ''
        ).trim();

      if (!prompt) {
        await sock.sendMessage(
          chat,
          {
            text:
`🖼️ *GENERATORE IMMAGINI*

Scrivi cosa vuoi che JARVIS generi.

Esempio:

*.immagine un cavallo palomino che salta un ostacolo in un campo al tramonto*

💡 Più dettagli inserisci,
più preciso sarà il risultato.`
          },
          {
            quoted: message
          }
        );

        return;
      }

      await sock.sendMessage(
        chat,
        {
          text:
`🎨 *J.A.R.V.I.S 5.0*

Sto creando la tua immagine...

⏳ Attendi qualche secondo.`
        },
        {
          quoted: message
        }
      );

      try {
        const image =
          await generateImage(
            prompt
          );

        await sock.sendMessage(
          chat,
          {
            image,
            caption:
`🖼️ *J.A.R.V.I.S 5.0*

✨ Immagine generata!

📝 Prompt:
${prompt}

— *J.A.R.V.I.S 5.0* —`
          },
          {
            quoted: message
          }
        );

      } catch (error) {

        console.error(
          '[IMMAGINE] Errore:',
          error.message
        );

        let text =
`❌ *GENERAZIONE FALLITA*

JARVIS non è riuscito a generare l'immagine.

`;

        if (
          !configErrorConfigured()
        ) {
          text +=
`🔑 Controlla che OPENAI_API_KEY sia configurata nel file .env.`;
        } else {
          text +=
`⚠️ Controlla la connessione e riprova.`;
        }

        await sock.sendMessage(
          chat,
          {
            text
          }
        );
      }
    }
  );
}

function configErrorConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY
  );
}
