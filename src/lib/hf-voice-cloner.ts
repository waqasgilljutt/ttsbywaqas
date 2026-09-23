import { Client } from '@gradio/client';

/**
 * Real Zero-Shot Neural Voice Cloning Service
 * Powered by Hugging Face ZeroGPU (F5-TTS Non-Autoregressive Flow Matching Model)
 * 
 * 100% Free - Clones speaker pitch, vocal tract resonance, cadence, and timbre
 * from 3 to 15 seconds of reference audio.
 */

// Singleton cached Gradio client
let cachedClient: any = null;
let clientPromise: Promise<any> | null = null;

async function getF5Client(): Promise<any> {
  if (cachedClient) {
    return cachedClient;
  }
  if (clientPromise) {
    return clientPromise;
  }

  clientPromise = (async () => {
    try {
      const client = await Client.connect('mrfakename/E2-F5-TTS');
      cachedClient = client;
      clientPromise = null;
      return client;
    } catch (err) {
      clientPromise = null;
      throw new Error(`Failed to connect to Hugging Face F5-TTS space: ${(err as Error)?.message || err}`);
    }
  })();

  return clientPromise;
}

export interface HFVoiceCloneOptions {
  refText?: string;
  removeSilence?: boolean;
  timeoutMs?: number;
}

export interface HFVoiceCloneResult {
  buffer: Buffer;
  contentType: string;
}

/**
 * Synthesize speech in cloned voice using Hugging Face's F5-TTS ZeroGPU model.
 * 
 * @param audioBlob Reference audio file or blob from the user
 * @param targetText The text to synthesize in the cloned voice
 * @param options Additional options (refText transcription, silence removal, timeout)
 */
export async function synthesizeF5VoiceClone(
  audioBlob: Blob | Buffer,
  targetText: string,
  options: HFVoiceCloneOptions = {}
): Promise<HFVoiceCloneResult> {
  const { refText = '', removeSilence = true, timeoutMs = 65000 } = options;

  let inputBlob: Blob;
  if (Buffer.isBuffer(audioBlob)) {
    inputBlob = new Blob([audioBlob as unknown as BlobPart], { type: 'audio/wav' });
  } else {
    inputBlob = audioBlob;
  }

  const client = await getF5Client();

  // Execute prediction with timeout safeguard
  const predictionPromise = client.predict('/predict', [
    inputBlob,
    refText,
    targetText,
    removeSilence,
  ]);

  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Voice cloning request timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);
  });

  try {
    const result: any = await Promise.race([predictionPromise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);

    const outputData = result?.data?.[0];
    const audioUrl = typeof outputData === 'string' ? outputData : outputData?.url;

    if (!audioUrl) {
      throw new Error('F5-TTS model finished without returning an audio stream URL.');
    }

    // Download generated audio from Hugging Face
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to download cloned audio from Hugging Face: HTTP ${audioResponse.status}`);
    }

    const arrayBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = audioResponse.headers.get('content-type') || 'audio/wav';

    return {
      buffer,
      contentType,
    };
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    // If the cached client experienced a connection error, invalidate it so future calls reconnect
    cachedClient = null;
    throw err;
  }
}
