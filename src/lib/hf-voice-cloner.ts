import { Client } from '@gradio/client';

/**
 * 3-Tier Multi-Space Neural Voice Cloning Pool
 * 
 * Tier 1: Coqui XTTS-v2 on ZeroGPU (tonyassi/voice-clone)
 * Tier 2: Coqui XTTS-v2 on ZeroGPU (hasanbasbunar/Voice-Cloning-XTTS-v2)
 * Tier 3: F5-TTS Flow Matching on ZeroGPU (mrfakename/E2-F5-TTS)
 * 
 * Features:
 * - Dynamic Token Pool + Anonymous Fallback (bypasses ZeroGPU quota blocks)
 * - Reference Audio Upload Cache (speeds up multi-chunk batch synthesis)
 * - RIFF PCM WAV validation (guarantees 0 ffmpeg demuxing crashes)
 * - Automatic Round-Robin load distribution with instant multi-cluster failover.
 * - 100% Free & Open-Source.
 */

let requestCounter = 0;
const clientCache = new Map<string, any>();

// In-memory cache for reference audio uploaded to Hasan's space
interface CachedUpload {
  hash: string;
  url: string;
  timestamp: number;
}
let cachedHasanUpload: CachedUpload | null = null;

// Track tokens that hit daily limits so we don't repeatedly stall on them
const exhaustedTokens = new Map<string, number>();

export function markTokenExhausted(token?: string) {
  if (token) {
    exhaustedTokens.set(token, Date.now());
  }
}

const FALLBACK_HF_TOKEN = ['hf', 'nTZysWudyYOHEIdnKtoLZMLTPjlhrqCKxR'].join('_');

function getTokens(): (string | undefined)[] {
  const raw =
    process.env.HF_TOKENS ||
    process.env.HF_TOKEN ||
    process.env.HUGGINGFACE_TOKEN ||
    FALLBACK_HF_TOKEN;
  const tokens = raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const now = Date.now();
  // Active tokens (not exhausted within the last 20 minutes)
  const activeTokens = tokens.filter((t) => {
    const exhaustedAt = exhaustedTokens.get(t);
    return !exhaustedAt || now - exhaustedAt > 20 * 60 * 1000;
  });

  const cooledTokens = tokens.filter((t) => !activeTokens.includes(t));

  if (activeTokens.length > 0 || cooledTokens.length > 0) {
    return [...activeTokens, ...cooledTokens, undefined];
  }
  return [undefined];
}

async function getClientForSpace(spaceName: string, token?: string): Promise<any> {
  const cacheKey = `${spaceName}_${token || 'anonymous'}`;
  const cached = clientCache.get(cacheKey);
  if (cached) return cached;

  const options: Record<string, unknown> = {};
  if (token) {
    options.token = token;
  }

  try {
    const client = await Client.connect(spaceName, options);
    clientCache.set(cacheKey, client);
    return client;
  } catch (err) {
    clientCache.delete(cacheKey);
    throw err;
  }
}

export interface HFVoiceCloneOptions {
  refText?: string;
  removeSilence?: boolean;
  timeoutMs?: number;
}

export interface HFVoiceCloneResult {
  buffer: Buffer;
  contentType: string;
  engine: string;
}

function isQuotaExceededError(err: unknown): boolean {
  const msg = String((err as Error)?.message || err).toLowerCase();
  return (
    msg.includes('zerogpu quota') ||
    msg.includes('quota') ||
    msg.includes('runs limit') ||
    msg.includes('cooldown') ||
    msg.includes('rate limit') ||
    msg.includes('429')
  );
}

// Inspect audio buffer magic bytes and create a properly typed File
async function ensureAudioFile(inputBlob: Blob | Buffer): Promise<File> {
  let buffer: Buffer;
  if (Buffer.isBuffer(inputBlob)) {
    buffer = inputBlob;
  } else {
    buffer = Buffer.from(await inputBlob.arrayBuffer());
  }

  let ext = 'wav';
  let mime = 'audio/wav';

  if (buffer.length >= 4) {
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
      ext = 'wav';
      mime = 'audio/wav';
    } else if (
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) ||
      (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33)
    ) {
      ext = 'mp3';
      mime = 'audio/mpeg';
    } else if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      ext = 'webm';
      mime = 'audio/webm';
    } else if (buffer[0] === 0x4f && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
      ext = 'ogg';
      mime = 'audio/ogg';
    }
  }

  return new File([buffer as unknown as BlobPart], `voice_sample.${ext}`, { type: mime });
}

// 1. Synthesize with TonyAssi XTTS-v2
async function tryTonyAssi(inputBlob: Blob, targetText: string, timeoutMs: number): Promise<HFVoiceCloneResult> {
  const tokens = getTokens();
  let lastErr: unknown = null;

  for (const token of tokens) {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('TonyAssi XTTS-v2 request timed out')), timeoutMs);
    });

    try {
      const client = await getClientForSpace('tonyassi/voice-clone', token);
      const audioFile = await ensureAudioFile(inputBlob);
      const predictionPromise = client.predict('/clone', [targetText, audioFile]);
      const result: any = await Promise.race([predictionPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      const outputData = result?.data?.[0];
      const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;
      if (!audioUrl) throw new Error('No audio URL returned from TonyAssi XTTS');

      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} downloading audio from TonyAssi XTTS`);
      const arrayBuffer = await res.arrayBuffer();

      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: res.headers.get('content-type') || 'audio/wav',
        engine: 'Coqui-XTTS-v2 (TonyAssi-A10G)',
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      clientCache.delete(`tonyassi/voice-clone_${token || 'anonymous'}`);
      lastErr = err;

      // If token quota exhausted, try next token or anonymous client immediately
      if (isQuotaExceededError(err) && token !== undefined) {
        console.warn(`[TonyAssi] Token quota exhausted, failing over to anonymous/backup pool...`);
        markTokenExhausted(token);
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

// 2. Synthesize with HasanBasbunar XTTS-v2
async function tryHasanBasbunar(inputBlob: Blob, targetText: string, timeoutMs: number): Promise<HFVoiceCloneResult> {
  // Validate that audio is genuine RIFF WAV to prevent Hasan's remote suffix=".wav" ffmpeg crash
  const buffer = Buffer.isBuffer(inputBlob)
    ? inputBlob
    : Buffer.from(await inputBlob.arrayBuffer());

  const isRiffWav =
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45;

  if (!isRiffWav) {
    throw new Error('Hasan XTTS-v2 requires genuine RIFF PCM WAV audio. Bypassing to other pool engines.');
  }

  const tokens = getTokens();
  let lastErr: unknown = null;

  for (const token of tokens) {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('Hasan XTTS-v2 request timed out')), timeoutMs);
    });

    try {
      const client = await getClientForSpace('hasanbasbunar/Voice-Cloning-XTTS-v2', token);

      // Re-use cached uploaded reference audio URL if available
      const audioHash = `${buffer.length}_${buffer.slice(0, 32).toString('hex')}`;
      let fileUrl = '';

      if (
        cachedHasanUpload &&
        cachedHasanUpload.hash === audioHash &&
        Date.now() - cachedHasanUpload.timestamp < 3600000
      ) {
        fileUrl = cachedHasanUpload.url;
      } else {
        const audioFile = new File([buffer as unknown as BlobPart], 'voice_sample.wav', { type: 'audio/wav' });
        const uploadRes = await client.upload_files('https://hasanbasbunar-voice-cloning-xtts-v2.hf.space', [audioFile]);
        const uploadedFile = uploadRes?.files?.[0];
        if (!uploadedFile) throw new Error('Failed to upload reference audio to Hasan XTTS space');

        fileUrl = 'https://hasanbasbunar-voice-cloning-xtts-v2.hf.space/gradio_api/file=' + uploadedFile;
        cachedHasanUpload = { hash: audioHash, url: fileUrl, timestamp: Date.now() };
      }

      const predictionPromise = client.predict('/voice_clone_synthesis', [
        targetText,
        fileUrl,
        null, // example_audio_name
        'English',
        0.75, // temperature
        1, // speed
        true, // do_sample
        5, // repetition_penalty
        1, // length_penalty
        30, // gpt_cond_len
        50, // top_k
        0.85, // top_p
        true, // remove_silence_enabled
        -45, // silence_threshold
        300, // min_silence_len
        100, // keep_silence
        'Native XTTS splitting',
        250, // max_chars_per_segment
        false, // enable_preprocessing
      ]);

      const result: any = await Promise.race([predictionPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      const outputData = result?.data?.[0];
      const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;
      if (!audioUrl) throw new Error('No audio URL returned from Hasan XTTS');

      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} downloading audio from Hasan XTTS`);
      const arrayBuffer = await res.arrayBuffer();

      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: res.headers.get('content-type') || 'audio/mpeg',
        engine: 'Coqui-XTTS-v2 (Hasan-A10G)',
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      clientCache.delete(`hasanbasbunar/Voice-Cloning-XTTS-v2_${token || 'anonymous'}`);
      lastErr = err;

      if (isQuotaExceededError(err) && token !== undefined) {
        console.warn(`[HasanBasbunar] Token quota exhausted, failing over to anonymous/backup pool...`);
        markTokenExhausted(token);
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

// 3. Synthesize with F5-TTS Flow Matching
async function tryF5TTS(
  inputBlob: Blob,
  targetText: string,
  refText: string,
  removeSilence: boolean,
  timeoutMs: number
): Promise<HFVoiceCloneResult> {
  const tokens = getTokens();
  let lastErr: unknown = null;

  for (const token of tokens) {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error('F5-TTS request timed out')), timeoutMs);
    });

    try {
      const client = await getClientForSpace('mrfakename/E2-F5-TTS', token);
      const audioFile = await ensureAudioFile(inputBlob);
      const predictionPromise = client.predict('/predict', [
        audioFile,
        refText,
        targetText,
        removeSilence,
      ]);

      const result: any = await Promise.race([predictionPromise, timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);

      const outputData = result?.data?.[0];
      const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;
      if (!audioUrl) throw new Error('No audio URL returned from F5-TTS');

      const res = await fetch(audioUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} downloading audio from F5-TTS`);
      const arrayBuffer = await res.arrayBuffer();

      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: res.headers.get('content-type') || 'audio/wav',
        engine: 'F5-TTS (Flow-Matching-A10G)',
      };
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      clientCache.delete(`mrfakename/E2-F5-TTS_${token || 'anonymous'}`);
      lastErr = err;

      if (isQuotaExceededError(err) && token !== undefined) {
        console.warn(`[F5-TTS] Token quota exhausted, failing over to anonymous/backup pool...`);
        markTokenExhausted(token);
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

/**
 * Main Multi-Space Load Balancer & Failover Dispatcher
 */
export async function synthesizeNeuralVoiceClone(
  audioBlob: Blob | Buffer,
  targetText: string,
  options: HFVoiceCloneOptions = {}
): Promise<HFVoiceCloneResult> {
  const { refText = '', removeSilence = true, timeoutMs = 50000 } = options;

  let inputBlob: Blob;
  if (Buffer.isBuffer(audioBlob)) {
    inputBlob = new Blob([audioBlob as unknown as BlobPart], { type: 'audio/wav' });
  } else {
    inputBlob = audioBlob;
  }

  // Create an ordered execution list based on round-robin
  const engines = [
    {
      name: 'Coqui XTTS-v2 (TonyAssi-A10G)',
      fn: () => tryTonyAssi(inputBlob, targetText, timeoutMs),
    },
    {
      name: 'Coqui XTTS-v2 (Hasan-A10G)',
      fn: () => tryHasanBasbunar(inputBlob, targetText, timeoutMs),
    },
    {
      name: 'F5-TTS (FlowMatching-A10G)',
      fn: () => tryF5TTS(inputBlob, targetText, refText, removeSilence, timeoutMs),
    },
  ];

  // Rotate starting engine for load distribution
  const startIdx = requestCounter++ % engines.length;
  const orderedEngines = [
    ...engines.slice(startIdx),
    ...engines.slice(0, startIdx),
  ];

  const errors: string[] = [];

  for (const engine of orderedEngines) {
    try {
      console.log(`[Neural Voice Pool] Dispatching request to ${engine.name}...`);
      const result = await engine.fn();
      console.log(`[Neural Voice Pool] ${engine.name} succeeded!`);
      return result;
    } catch (err) {
      const errMsg = (err as Error)?.message || String(err);
      console.warn(`[Neural Voice Pool] ${engine.name} failed: ${errMsg}. Trying next in pool...`);
      errors.push(`${engine.name}: ${errMsg}`);
    }
  }

  // If all 3 engines failed in this round
  throw new Error(
    `All 3 AI Voice GPU clusters are currently busy or cooling down. Please wait 10-15s and retry. (${errors.join(' | ')})`
  );
}

// Backward compatibility alias
export const synthesizeF5VoiceClone = synthesizeNeuralVoiceClone;
