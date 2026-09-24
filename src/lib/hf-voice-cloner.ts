import { Client } from '@gradio/client';

/**
 * 3-Tier Multi-Space Neural Voice Cloning Pool
 * 
 * Tier 1: Coqui XTTS-v2 on ZeroGPU (tonyassi/voice-clone)
 * Tier 2: Coqui XTTS-v2 on ZeroGPU (hasanbasbunar/Voice-Cloning-XTTS-v2)
 * Tier 3: F5-TTS Flow Matching on ZeroGPU (mrfakename/E2-F5-TTS)
 * 
 * Automatic Round-Robin load distribution with instant multi-cluster failover.
 * 100% Free & Open-Source.
 */

let cachedTonyClient: any = null;
let cachedHasanClient: any = null;
let cachedF5Client: any = null;

let requestCounter = 0;

async function getTonyClient(): Promise<any> {
  if (cachedTonyClient) return cachedTonyClient;
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const options: any = token ? { token } : {};
  cachedTonyClient = await Client.connect('tonyassi/voice-clone', options);
  return cachedTonyClient;
}

async function getHasanClient(): Promise<any> {
  if (cachedHasanClient) return cachedHasanClient;
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const options: any = token ? { token } : {};
  cachedHasanClient = await Client.connect('hasanbasbunar/Voice-Cloning-XTTS-v2', options);
  return cachedHasanClient;
}

async function getF5Client(): Promise<any> {
  if (cachedF5Client) return cachedF5Client;
  const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
  const options: any = token ? { token } : {};
  cachedF5Client = await Client.connect('mrfakename/E2-F5-TTS', options);
  return cachedF5Client;
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

// Helper to inspect audio buffer magic bytes and create a properly typed File
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
  const client = await getTonyClient();

  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('TonyAssi XTTS-v2 request timed out')), timeoutMs);
  });

  try {
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
    cachedTonyClient = null;
    throw err;
  }
}

// 2. Synthesize with HasanBasbunar XTTS-v2
async function tryHasanBasbunar(inputBlob: Blob, targetText: string, timeoutMs: number): Promise<HFVoiceCloneResult> {
  const client = await getHasanClient();

  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Hasan XTTS-v2 request timed out')), timeoutMs);
  });

  try {
    // Upload audio file with exact extension (sample.mp3 / sample.wav) so ffmpeg decodes properly
    const audioFile = await ensureAudioFile(inputBlob);
    const uploadRes = await client.upload_files('https://hasanbasbunar-voice-cloning-xtts-v2.hf.space', [audioFile]);
    const uploadedFile = uploadRes?.files?.[0];
    if (!uploadedFile) throw new Error('Failed to upload reference audio to Hasan XTTS space');

    const fileUrl = 'https://hasanbasbunar-voice-cloning-xtts-v2.hf.space/gradio_api/file=' + uploadedFile;

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
    cachedHasanClient = null;
    throw err;
  }
}

// 3. Synthesize with F5-TTS Flow Matching
async function tryF5TTS(inputBlob: Blob, targetText: string, refText: string, removeSilence: boolean, timeoutMs: number): Promise<HFVoiceCloneResult> {
  const client = await getF5Client();

  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('F5-TTS request timed out')), timeoutMs);
  });

  try {
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
    cachedF5Client = null;
    throw err;
  }
}

/**
 * Main Multi-Space Load Balancer & Failover Dispatcher
 */
export async function synthesizeNeuralVoiceClone(
  audioBlob: Blob | Buffer,
  targetText: string,
  options: HFVoiceCloneOptions = {}
): Promise<HFVoiceCloneResult> {
  const { refText = '', removeSilence = true, timeoutMs = 45000 } = options;

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

  // Rotate starting engine
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

  // If all 3 engines failed
  throw new Error(
    `All 3 AI Voice GPU clusters are currently busy or cooling down. Please wait 10-15s and retry. (${errors.join(' | ')})`
  );
}

// Backward compatibility alias
export const synthesizeF5VoiceClone = synthesizeNeuralVoiceClone;
