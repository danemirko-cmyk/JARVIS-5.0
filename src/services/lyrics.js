import { URLSearchParams } from 'node:url';

const LRCLIB_BASE_URL = 'https://lrclib.net/api';

const USER_AGENT =
  'JARVIS-5.0/1.0 (WhatsApp Bot; contact: JARVIS-5.0)';

async function requestLRCLIB(endpoint, params) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const url =
    `${LRCLIB_BASE_URL}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json'
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status === 429) {
    throw new Error(
      'LRCLIB ha temporaneamente limitato le richieste. Riprova tra poco.'
    );
  }

  if (!response.ok) {
    throw new Error(
      `LRCLIB ha restituito HTTP ${response.status}.`
    );
  }

  return response.json();
}

export async function searchLyrics(query) {
  const text = String(query || '').trim();

  if (!text) {
    throw new Error('Inserisci il nome della canzone.');
  }

  const results = await requestLRCLIB('/search', {
    q: text
  });

  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }

  const result = results.find(
    item =>
      item?.plainLyrics ||
      item?.syncedLyrics
  );

  return result || results[0];
}

export async function getLyrics({
  trackName,
  artistName,
  albumName = '',
  duration = ''
}) {
  if (!trackName) {
    throw new Error('Titolo del brano mancante.');
  }

  const result = await requestLRCLIB('/get', {
    track_name: trackName,
    artist_name: artistName,
    album_name: albumName,
    duration
  });

  return result;
}

export async function findLyrics(query) {
  const result = await searchLyrics(query);

  if (!result) {
    throw new Error(
      'Non ho trovato informazioni sul brano su LRCLIB.'
    );
  }

  return {
    id: result.id ?? null,
    trackName: result.trackName || query,
    artistName: result.artistName || 'Artista sconosciuto',
    albumName: result.albumName || '',
    duration: result.duration ?? null,
    instrumental: Boolean(result.instrumental),
    plainLyrics: result.plainLyrics || '',
    syncedLyrics: result.syncedLyrics || '',
    source: 'LRCLIB'
  };
}
