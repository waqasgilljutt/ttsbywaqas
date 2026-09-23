import { Client } from '@gradio/client';

/**
 * Real Zero-Shot Neural Voice Cloning Service
 * 
 * Primary Engine: Coqui XTTS-v2 on Hugging Face ZeroGPU (Nvidia A10G)
 * - Needs NO reference text / transcript.
 * - Extracts vocal timbre, pitch, resonance, and cadence directly from raw audio.
 * - Ultra-fast (~8-12 seconds).
 * 
 * Secondary Engine: F5-TTS Non-Autoregressive Flow Matching Model
 * - Serves as high-fidelity automatic backup if primary space is in queue.
 * 
 * 100% Free & Open-Source.
 */

let cachedXTTSClient: any = null;
let xttsPromise: Promise<any> | null = null;

let cachedF5Client: any = null;
let f5Promise: Promise<any> | null = null;

async function getXTTSClient(): Promise<any> {
  if (cachedXTTSClient) return cachedXTTSClient;
  if (xttsPromise) return xttsPromise;

  xttsPromise = (async () => {
    try {
      const client = await Client.connect('tonyassi/voice-clone');
      cachedXTTSClient = client;
      xttsPromise = null;
      return client;
    } catch (err) {
      xttsPromise = null;
      throw new Error(`Failed to connect to Coqui XTTS space: ${(err as Error)?.message || err}`);
    }
  })();

  return xttsPromise;
}

async function getF5Client(): Promise<any> {
  if (cachedF5Client) return cachedF5Client;
  if (f5Promise) return f5Promise;

  f5Promise = (async () => {
    try {
      const client = await Client.connect('mrfakename/E2-F5-TTS');
      cachedF5Client = client;
      f5Promise = null;
      return client;
    } catch (err) {
      f5Promise = null;
      throw new Error(`Failed to connect to F5-TTS space: ${(err as Error)?.message || err}`);
    }
  })();

  return f5Promise;
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

/**
 * Synthesizes speech using the user's authentic cloned voice.
 * Tries Coqui XTTS-v2 first (zero transcript needed), then F5-TTS fallback.
 */
export async function synthesizeNeuralVoiceClone(
  audioBlob: Blob | Buffer,
  targetText: string,
  options: HFVoiceCloneOptions = {}
): Promise<HFVoiceCloneResult> {
  const { refText = '', removeSilence = true, timeoutMs = 60000 } = options;

  let inputBlob: Blob;
  if (Buffer.isBuffer(audioBlob)) {
    inputBlob = new Blob([audioBlob as unknown as BlobPart], { type: 'audio/wav' });
  } else {
    inputBlob = audioBlob;
  }

  let lastError: unknown = null;

  // 1. PRIMARY ENGINE: Coqui XTTS-v2 (Zero-shot, no transcript needed)
  try {
    console.log('[Neural Voice Clone] Attempting Primary Engine: Coqui XTTS-v2...');
    const client = await getXTTSClient();

    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Coqui XTTS-v2 request timed out after 45s.'));
      }, 45000);
    });

    const predictionPromise = client.predict('/clone', [
      targetText,
      inputBlob,
    ]);

    const result: any = await Promise.race([predictionPromise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);

    const outputData = result?.data?.[0];
    const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;

    if (!audioUrl) {
      throw new Error('XTTS-v2 finished without returning an audio stream.');
    }

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio from XTTS-v2: HTTP ${audioResponse.status}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = audioResponse.headers.get('content-type') || 'audio/wav';

    console.log('[Neural Voice Clone] Primary Engine (Coqui XTTS-v2) succeeded!');
    return {
      buffer,
      contentType,
      engine: 'Coqui-XTTS-v2',
    };
  } catch (xttsErr) {
    console.warn('[Neural Voice Clone] Primary Engine (XTTS-v2) failed or timed out:', xttsErr);
    cachedXTTSClient = null;
    lastError = xttsErr;
  }

  // 2. SECONDARY ENGINE: F5-TTS Flow Matching
  try {
    console.log('[Neural Voice Clone] Attempting Secondary Engine: F5-TTS...');
    const f5Client = await getF5Client();

    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('F5-TTS request timed out after 45s.'));
      }, 45000);
    });

    const predictionPromise = f5Client.predict('/predict', [
      inputBlob,
      refText,
      targetText,
      removeSilence,
    ]);

    const result: any = await Promise.race([predictionPromise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);

    const outputData = result?.data?.[0];
    const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;

    if (!audioUrl) {
      throw new Error('F5-TTS finished without returning an audio stream.');
    }

    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download audio from F5-TTS: HTTP ${audioResponse.status}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = audioResponse.headers.get('content-type') || 'audio/wav';

    console.log('[Neural Voice Clone] Secondary Engine (F5-TTS) succeeded!');
    return {
      buffer,
      contentType,
      engine: 'HuggingFace-F5-TTS',
    };
  } catch (f5Err) {
    console.warn('[Neural Voice Clone] Secondary Engine (F5-TTS) failed:', f5Err);
    cachedF5Client = null;
    lastError = f5Err;
  }

  // If both engines failed, throw clear error (DO NOT silently replace with Brian/Ava!)
  throw new Error(
    `AI Voice Cloning GPU cluster is currently busy or experiencing high traffic. Please wait 10-15 seconds and try again. (${(lastError as Error)?.message || lastError})`
  );
}

// Backward compatibility alias
export const synthesizeF5VoiceClone = synthesizeNeuralVoiceClone;
