import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export interface VoiceTag {
  ContentCategories?: string[];
  VoicePersonalities?: string[];
}

export interface Voice {
  Name: string;
  ShortName: string;
  Gender: 'Male' | 'Female' | string;
  Locale: string;
  LocaleName: string;
  SuggestedCodec?: string;
  FriendlyName: string;
  Status?: string;
  VoiceTag?: VoiceTag;
}

export interface SynthesisOptions {
  voice?: string;
  rate?: string;   // e.g. "+0%", "+20%", "-15%"
  pitch?: string;  // e.g. "+0Hz", "+10Hz", "-10Hz"
  volume?: string; // e.g. "+0%", "+10%", "-20%"
  format?: string;
}

let cachedVoices: Voice[] | null = null;
let lastVoiceFetchTime = 0;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

export async function fetchVoices(): Promise<Voice[]> {
  const now = Date.now();
  if (cachedVoices && now - lastVoiceFetchTime < CACHE_TTL_MS) {
    return cachedVoices;
  }

  const trustedToken = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
  const url = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${trustedToken}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
      },
      // Edge runtime / node fetch cache settings
      next: { revalidate: 21600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch voices from Bing: HTTP ${res.status}`);
    }

    const data: Voice[] = await res.json();
    cachedVoices = data;
    lastVoiceFetchTime = now;
    return data;
  } catch (error) {
    console.warn('Direct Bing voice fetch failed, using fallback or cached:', error);
    if (cachedVoices) return cachedVoices;
    // Fallback to essential starter voices
    return FALLBACK_VOICES;
  }
}

// Splits large text into safe chunks for Edge TTS
function splitTextIntoChunks(text: string, maxChunkLength = 2500): string[] {
  if (text.length <= maxChunkLength) return [text];

  const chunks: string[] = [];
  const paragraphs = text.split(/\n+/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + '\n' + paragraph).length <= maxChunkLength) {
      currentChunk = currentChunk ? currentChunk + '\n' + paragraph : paragraph;
    } else {
      if (paragraph.length > maxChunkLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        const sentences = paragraph.match(/[^.!?。।۔\n]+[.!?。।۔\n]+|[^.!?。।۔\n]+$/g) || [paragraph];
        for (const sentence of sentences) {
          if ((currentChunk + ' ' + sentence).length <= maxChunkLength) {
            currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }
            if (sentence.length > maxChunkLength) {
              const words = sentence.split(/\s+/);
              for (const word of words) {
                if ((currentChunk + ' ' + word).length <= maxChunkLength) {
                  currentChunk = currentChunk ? currentChunk + ' ' + word : word;
                } else {
                  if (currentChunk) chunks.push(currentChunk.trim());
                  currentChunk = word;
                }
              }
            } else {
              currentChunk = sentence;
            }
          }
        }
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

async function synthesizeChunk(
  chunk: string,
  voice: string,
  rate: string,
  pitch: string,
  volume: string
): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  const outputFormat = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
  await tts.setMetadata(voice, outputFormat);

  return new Promise<Buffer>((resolve, reject) => {
    try {
      const { audioStream } = tts.toStream(chunk, {
        rate,
        pitch,
        volume,
      });

      const chunks: Buffer[] = [];

      audioStream.on('data', (c: Buffer) => {
        chunks.push(c);
      });

      audioStream.on('close', () => {
        if (chunks.length === 0) {
          return reject(new Error('TTS service returned empty audio stream.'));
        }
        resolve(Buffer.concat(chunks));
      });

      audioStream.on('error', (err: Error) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Resilient TTS synthesizer supporting scripts up to 50,000+ words via smart chunking.
 */
export async function synthesizeSpeech(
  text: string,
  options: SynthesisOptions = {}
): Promise<{ buffer: Buffer; contentType: string }> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text to synthesize cannot be empty.');
  }

  const voice = options.voice || 'en-US-JennyNeural';
  const rate = options.rate || '+0%';
  const pitch = options.pitch || '+0Hz';
  const volume = options.volume || '+0%';

  const chunks = splitTextIntoChunks(text.trim(), 3500);

  if (chunks.length === 1) {
    const buffer = await synthesizeChunk(chunks[0], voice, rate, pitch, volume);
    return { buffer, contentType: 'audio/mpeg' };
  }

  // Synthesize chunks in parallel for maximum performance
  const audioBuffers = await Promise.all(
    chunks.map((chunk) => synthesizeChunk(chunk, voice, rate, pitch, volume))
  );

  return {
    buffer: Buffer.concat(audioBuffers),
    contentType: 'audio/mpeg',
  };
}

const FALLBACK_VOICES: Voice[] = [
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (en-US, JennyNeural)',
    ShortName: 'en-US-JennyNeural',
    Gender: 'Female',
    Locale: 'en-US',
    LocaleName: 'English (United States)',
    FriendlyName: 'Microsoft Jenny Online (Natural) - English (United States)',
    VoiceTag: {
      ContentCategories: ['General'],
      VoicePersonalities: ['Friendly', 'Warm', 'Positive'],
    },
  },
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (en-US, GuyNeural)',
    ShortName: 'en-US-GuyNeural',
    Gender: 'Male',
    Locale: 'en-US',
    LocaleName: 'English (United States)',
    FriendlyName: 'Microsoft Guy Online (Natural) - English (United States)',
    VoiceTag: {
      ContentCategories: ['News', 'General'],
      VoicePersonalities: ['Confident', 'Professional'],
    },
  },
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (en-GB, SoniaNeural)',
    ShortName: 'en-GB-SoniaNeural',
    Gender: 'Female',
    Locale: 'en-GB',
    LocaleName: 'English (United Kingdom)',
    FriendlyName: 'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    VoiceTag: {
      ContentCategories: ['General'],
      VoicePersonalities: ['Warm', 'Pleasant'],
    },
  },
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (ur-PK, UzmaNeural)',
    ShortName: 'ur-PK-UzmaNeural',
    Gender: 'Female',
    Locale: 'ur-PK',
    LocaleName: 'Urdu (Pakistan)',
    FriendlyName: 'Microsoft Uzma Online (Natural) - Urdu (Pakistan)',
    VoiceTag: {
      ContentCategories: ['General'],
      VoicePersonalities: ['Friendly'],
    },
  },
  {
    Name: 'Microsoft Server Speech Text to Speech Voice (ur-PK, AsadNeural)',
    ShortName: 'ur-PK-AsadNeural',
    Gender: 'Male',
    Locale: 'ur-PK',
    LocaleName: 'Urdu (Pakistan)',
    FriendlyName: 'Microsoft Asad Online (Natural) - Urdu (Pakistan)',
    VoiceTag: {
      ContentCategories: ['General'],
      VoicePersonalities: ['Confident'],
    },
  },
];
