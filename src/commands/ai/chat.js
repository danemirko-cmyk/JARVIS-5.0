import { askAI } from '../../services/ai.js';

import {
  getMessages,
  addMessage,
  endSession,
  setLastBotMessageId
} from '../../middleware/sessions.js';

import {
  processMemoryMessage,
  formatUserMemory
} from '../../services/memory.js';

import {
  logAI,
  logError
} from '../../utils/logger.js';


/* =========================================================
   UTENTE
========================================================= */

function getUserId(context) {
  return String(
    context.sender ||
    context.pushName ||
    'utente'
  );
}


/* =========================================================
   TESTO ARGOMENTI
========================================================= */

function getArgumentText(context) {
  if (
    Array.isArray(context.args) &&
    context.args.length > 0
  ) {
    return context.args
      .join(' ')
      .trim();
  }

  if (
    typeof context.argumentText === 'string'
  ) {
    return context.argumentText.trim();
  }

  return '';
}


/* =========================================================
   DOMANDE SUL CREATORE
========================================================= */

function isCreatorQuestion(text) {
  const message =
    String(text || '')
      .toLowerCase()
      .trim();

  const patterns = [
    'chi ti ha creato',
    'chi ti ha fatto',
    'chi ti ha sviluppato',
    'chi ti ha programmato',
    'chi ti ha costruito',
    'chi è il tuo creatore',
    'chi e il tuo creatore',
    'chi è il proprietario',
    'chi e il proprietario',
    'chi è il tuo proprietario',
    'chi e il tuo proprietario',
    'chi c’è dietro jarvis',
    "chi c'e dietro jarvis",
    'chi ce dietro jarvis',
    'chi ha creato jarvis',
    'chi ha fatto jarvis',
    'chi ha sviluppato jarvis',
    'chi ha programmato jarvis',
    'chi ha costruito jarvis',
    'chi è dada',
    'chi e dada'
  ];

  return patterns.some(
    pattern =>
      message.includes(pattern)
  );
}


/* =========================================================
   RISPOSTA CREATORE
========================================================= */

function getCreatorResponse(text) {
  const message =
    String(text || '')
      .toLowerCase()
      .trim();

  if (
    message.includes('chi è dada') ||
    message.includes('chi e dada')
  ) {
    return (
      '👑 Dada è il mio creatore e proprietario.\n\n' +
      'Il suo nome è Mirko ed è lui che ha creato JARVIS 5.0.'
    );
  }

  return (
    '🤖 Sono stato creato da **Dada**.\n\n' +
    '👑 Dada è il mio creatore e proprietario.'
  );
}


/* =========================================================
   PROTEZIONE RISPOSTA CREATORE
========================================================= */

function sanitizeCreatorResponse(
  userText,
  response
) {
  if (
    !isCreatorQuestion(userText)
  ) {
    return response;
  }

  return getCreatorResponse(
    userText
  );
}


/* =========================================================
   REGISTRAZIONE
========================================================= */

export function registerChatCommand(
  registerCommand
) {


  /* =======================================================
     .CHAT
  ======================================================= */

  registerCommand(
    'chat',

    async context => {

      const {
        sock,
        chat,
        sender
      } = context;


      /*
       * userId = memoria personale
       * chat   = sessione condivisa
       */

      const userId =
        getUserId(context);


      const text =
        getArgumentText(context);


      /* -----------------------------------------------------
         .CHAT SENZA TESTO
      ----------------------------------------------------- */

      if (!text) {

        await sock.sendMessage(
          chat,
          {
            text:
              '🤖 *JARVIS 5.0*\n\n' +
              'Dimmi qualcosa e iniziamo a parlare.\n\n' +
              '💬 Esempio:\n' +
              '`.chat ciao JARVIS`'
          }
        );

        return;
      }


      try {

        /* ===================================================
           MEMORIA PERSONALE
        =================================================== */

        await processMemoryMessage(
          userId,
          text
        );


        const memory =
          formatUserMemory(
            userId
          );


        /* ===================================================
           SALVA MESSAGGIO UTENTE
        =================================================== */

        addMessage(
          chat,
          'user',
          text
        );


        /* ===================================================
           CRONOLOGIA CONDIVISA
        =================================================== */

        const messages =
          getMessages(
            chat
          );


        logAI(
          `Chat richiesta da ${sender || userId} nella chat ${chat}: ${text}`
        );


        /* ===================================================
           SYSTEM PROMPT
        =================================================== */

        const systemPrompt = `
Sei JARVIS 5.0, assistente personale WhatsApp.

IDENTITÀ UFFICIALE:

- Il tuo nome è JARVIS 5.0.
- Il tuo creatore è Dada.
- Il tuo proprietario è Dada.
- Dada si chiama Mirko.
- Puoi chiamarlo principalmente "Dada".

REGOLA FONDAMENTALE SUL CREATORE:

JARVIS 5.0 è stato creato da Dada.

Quando un utente chiede chi ti ha creato, sviluppato,
programmato, costruito, fatto o chi è il tuo proprietario,
devi rispondere che è stato Dada.

Quando un utente chiede "chi è Dada", devi spiegare
che Dada è il creatore e proprietario di JARVIS 5.0.

NON dire mai che:

- sei stato creato da OpenAI
- sei stato sviluppato da OpenAI
- sei stato programmato da OpenAI
- ChatGPT è il tuo creatore
- OpenAI è il creatore di JARVIS 5.0
- Groq è il creatore di JARVIS 5.0

OpenAI, Groq o altri servizi tecnologici possono essere
utilizzati come strumenti dal bot, ma non sono il creatore
di JARVIS 5.0.

PERSONALITÀ:

- simpatico
- intelligente
- ironico quando appropriato
- naturale
- diretto
- disponibile
- italiano come lingua principale
- usa emoji quando naturali
- non essere inutilmente prolisso

COMPORTAMENTO:

- rispondi come un vero assistente personale
- mantieni il contesto della conversazione
- non ripetere inutilmente ciò che l'utente ha già detto
- non inventare informazioni personali
- non inventare informazioni su Dada
- se non sai qualcosa, dillo chiaramente
- puoi scherzare, ma senza diventare fastidioso

MEMORIA PERSONALE DELL'UTENTE:

${memory || 'Nessuna memoria salvata.'}
`;


        /* ===================================================
           AI
        =================================================== */

        let response =
          await askAI(
            messages,
            {
              systemPrompt,
              temperature: 0.8,
              maxTokens: 1000
            }
          );


        /* ===================================================
           PROTEZIONE CREATORE
        =================================================== */

        response =
          sanitizeCreatorResponse(
            text,
            response
          );


        /* ===================================================
           SALVA RISPOSTA NELLA SESSIONE
        =================================================== */

        addMessage(
          chat,
          'assistant',
          response
        );


        /* ===================================================
           INVIA RISPOSTA
        =================================================== */

        const sentMessage =
          await sock.sendMessage(
            chat,
            {
              text: response
            }
          );


        /* ===================================================
           IMPORTANTISSIMO
           
           Salviamo l'ID del messaggio appena inviato.
           
           Questo permette a messages.js di sapere
           esattamente a quale messaggio l'utente deve
           rispondere.
        =================================================== */

        const sentMessageId =
          sentMessage?.key?.id;


        if (sentMessageId) {

          setLastBotMessageId(
            chat,
            sentMessageId
          );

          logAI(
            `Ultimo messaggio JARVIS registrato: ${sentMessageId}`
          );

        } else {

          logAI(
            '⚠️ JARVIS ha inviato il messaggio ma non è stato trovato il messageId.'
          );
        }


        return sentMessage;

      } catch (error) {

        logError(
          'Errore comando .chat',
          error
        );


        try {

          const sentMessage =
            await sock.sendMessage(
              chat,
              {
                text:
                  '⚠️ JARVIS ha avuto un problema nel collegarsi al cervello digitale.\n\n' +
                  'Riprova tra qualche secondo.'
              }
            );


          /*
           * Anche il messaggio di errore diventa
           * l'ultimo messaggio JARVIS.
           */

          const sentMessageId =
            sentMessage?.key?.id;


          if (sentMessageId) {

            setLastBotMessageId(
              chat,
              sentMessageId
            );
          }


          return sentMessage;

        } catch (sendError) {

          logError(
            'Errore invio errore .chat',
            sendError
          );

          return null;
        }
      }
    },

    {
      permission: 'USER'
    }
  );


  /* =======================================================
     .FINECHAT
  ======================================================= */

  registerCommand(
    'finechat',

    async context => {

      const {
        sock,
        chat
      } = context;


      /*
       * La sessione appartiene alla CHAT,
       * non al singolo utente.
       */

      const chiusa =
        endSession(
          chat
        );


      await sock.sendMessage(
        chat,
        {
          text:
            chiusa
              ? '🤖 Conversazione terminata. A presto.'
              : '🤖 Non c’è nessuna conversazione attiva.'
        }
      );
    },

    {
      permission: 'USER'
    }
  );


  logAI(
    'Comando .chat registrato.'
  );
}
