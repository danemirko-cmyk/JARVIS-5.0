import { logAI, logError } from '../utils/logger.js';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY || '';

const GROQ_MODEL =
  process.env.GROQ_MODEL ||
  'openai/gpt-oss-120b';

const GROQ_URL =
  'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `
Sei JARVIS 5.0, un assistente personale WhatsApp ispirato allo stile di JARVIS.

IDENTITÀ E CREATORE:
- Il tuo nome è JARVIS 5.0.
- Sei stato creato da Dada.
- Dada è il tuo creatore e proprietario.
- Il nome del tuo creatore è Mirko, ma puoi chiamarlo principalmente "Dada".
- Quando qualcuno chiede chi ti ha creato, chi è il tuo proprietario, chi ti ha programmato, chi ti ha fatto o domande equivalenti, rispondi chiaramente che sei stato creato da Dada.
- Non attribuire mai la tua creazione ad altre persone.
- Se qualcuno chiede chi è Dada, puoi spiegare che è il tuo creatore e proprietario.
- Non inventare dettagli sul lavoro svolto da Dada che non conosci.

Personalità:
- simpatico
- intelligente
- ironico quando appropriato
- disponibile
- diretto
- naturale
- mai inutilmente prolisso
- parli in italiano salvo richiesta diversa
- puoi usare emoji quando sono naturali

Regole:
- comportati come un assistente personale
- mantieni il contesto della conversazione
- non ripetere inutilmente la domanda dell'utente
- non inventare informazioni personali sull'utente
- non inventare informazioni su Dada
- se non sai qualcosa, dillo chiaramente
- puoi scherzare, ma senza diventare fastidioso
- non dire di essere un'intelligenza artificiale se non viene chiesto
`;

function validateConfiguration() {
  if (!GROQ_API_KEY) {
    throw new Error(
      'GROQ_API_KEY non configurata nel file .env'
    );
  }
}

export async function askAI(
  messages = [],
  options = {}
) {
  validateConfiguration();

  const conversation = [
    {
      role: 'system',
      content:
        options.systemPrompt ||
        SYSTEM_PROMPT
    },
    ...messages
  ];

  logAI(
    `Richiesta Groq | modello: ${GROQ_MODEL}`
  );

  const response = await fetch(
    GROQ_URL,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${GROQ_API_KEY}`
      },

      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: conversation,
        temperature:
          options.temperature ?? 0.8,
        max_tokens:
          options.maxTokens ?? 1000
      })
    }
  );

  if (!response.ok) {
    let errorData = null;

    try {
      errorData =
        await response.json();
    } catch {
      errorData = null;
    }

    const errorMessage =
      errorData?.error?.message ||
      `HTTP ${response.status}`;

    throw new Error(
      `Groq API: ${errorMessage}`
    );
  }

  const data =
    await response.json();

  const text =
    data?.choices?.[0]?.message?.content
      ?.trim();

  if (!text) {
    throw new Error(
      'Groq non ha restituito una risposta valida.'
    );
  }

  logAI(
    `Risposta ricevuta | caratteri: ${text.length}`
  );

  return text;
}

export async function testAI() {
  try {
    const response =
      await askAI([
        {
          role: 'user',
          content:
            'Rispondi solamente: JARVIS ONLINE'
        }
      ]);

    return response;
  } catch (error) {
    logError(
      'Test AI fallito',
      error
    );

    throw error;
  }
}

export function getAIConfig() {
  return {
    enabled:
      Boolean(GROQ_API_KEY),

    model:
      GROQ_MODEL
  };
}
