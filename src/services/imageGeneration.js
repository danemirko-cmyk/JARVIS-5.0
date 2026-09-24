import OpenAI from 'openai';

import { config } from '../utils/config.js';

let client = null;

function getClient() {
  if (!config.image.enabled) {
    throw new Error(
      'OPENAI_API_KEY non configurata.'
    );
  }

  if (!client) {
    client = new OpenAI({
      apiKey: config.image.apiKey
    });
  }

  return client;
}

export async function generateImage(
  prompt
) {
  const cleanPrompt =
    String(prompt || '').trim();

  if (!cleanPrompt) {
    throw new Error(
      'Prompt immagine vuoto.'
    );
  }

  const openai =
    getClient();

  const result =
    await openai.images.generate({
      model:
        config.image.model,

      prompt:
        cleanPrompt,

      size:
        '1024x1024',

      quality:
        'auto'
    });

  const image =
    result?.data?.[0];

  if (!image?.b64_json) {
    throw new Error(
      'L’API non ha restituito un’immagine.'
    );
  }

  return Buffer.from(
    image.b64_json,
    'base64'
  );
}
