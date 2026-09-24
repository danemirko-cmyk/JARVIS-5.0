import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import ytSearch from 'yt-search';

const execFileAsync = promisify(execFile);

const YTDLP_PATH = 'yt-dlp';
const FFMPEG_PATH = 'ffmpeg';

function safeFileName(name) {
  return String(name || 'audio')
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);
}

function createTempBase() {
  return path.join(
    os.tmpdir(),
    `jarvis-play-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
  );
}

export async function searchYouTube(query) {
  const text = String(query || '').trim();

  if (!text) {
    throw new Error('Inserisci il nome della canzone.');
  }

  const result = await ytSearch(text);

  if (!result?.videos?.length) {
    throw new Error('Non ho trovato risultati su YouTube.');
  }

  const video = result.videos[0];

  return {
    title: video.title || text,
    url: video.url,
    videoId: video.videoId || null,
    author: video.author?.name || 'Autore sconosciuto',
    duration: video.timestamp || 'N/D',
    thumbnail: video.thumbnail || null,
    views: video.views || 0
  };
}

export async function downloadAudio(videoUrl, title = 'audio') {
  const basePath = createTempBase();
  const outputTemplate = `${basePath}.%(ext)s`;
  const mp3Path = `${basePath}.mp3`;

  const ytDlpArgs = [
    '--no-playlist',
    '-x',
    '--audio-format',
    'mp3',
    '--audio-quality',
    '0',
    '--retries',
    '3',
    '--fragment-retries',
    '3',
    '--extractor-args',
    'youtube:player_client=android',
    '--output',
    outputTemplate,
    videoUrl
  ];

  try {
    await execFileAsync(YTDLP_PATH, ytDlpArgs, {
      maxBuffer: 20 * 1024 * 1024
    });

    if (!fs.existsSync(mp3Path)) {
      throw new Error('yt-dlp non ha creato il file MP3.');
    }

    const audio = fs.readFileSync(mp3Path);

    return {
      audio,
      fileName: `${safeFileName(title)}.mp3`,
      path: mp3Path
    };
  } catch (error) {
    throw new Error(
      `Download audio fallito: ${error?.message || 'errore sconosciuto'}`
    );
  }
}

export function cleanupAudio(filePath) {
  if (!filePath) return;

  const basePath = filePath.endsWith('.mp3')
    ? filePath.slice(0, -4)
    : filePath;

  const extensions = [
    '.mp3',
    '.m4a',
    '.webm',
    '.opus',
    '.mp4',
    '.part',
    '.ytdl'
  ];

  for (const extension of extensions) {
    const file = `${basePath}${extension}`;

    try {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    } catch {}
  }
}

export async function getSong(query) {
  const video = await searchYouTube(query);
  const downloaded = await downloadAudio(video.url, video.title);

  return {
    ...video,
    ...downloaded
  };
}
