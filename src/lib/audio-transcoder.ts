/**
 * High-Performance Client-Side Audio Normalizer & Transcoder
 * Powered by EmpireNexs & Waqas Gill
 * 
 * Converts ANY audio input (WebM, Opus, MP3, AAC, OGG, WAV) into
 * standard 16-bit 24,000Hz Mono PCM RIFF WAV format.
 * 
 * Why 24,000Hz Mono RIFF WAV?
 * 1. Coqui XTTS-v2 is natively trained on 24kHz audio.
 * 2. HasanBasbunar Gradio space hardcodes suffix=".wav" in temp files.
 *    Any non-RIFF format causes ffmpeg decoding error code 1.
 * 3. 24kHz mono WAV is compact (~48KB per second) and decodes instantly with 0 errors.
 */

/**
 * Checks if a Blob or Buffer already starts with valid RIFF WAVE headers.
 */
export async function isGenuineRiffWav(blobOrBuffer: Blob | Buffer | Uint8Array): Promise<boolean> {
  try {
    let bytes: Uint8Array;
    if (Buffer.isBuffer(blobOrBuffer) || blobOrBuffer instanceof Uint8Array) {
      bytes = blobOrBuffer.slice(0, 12);
    } else {
      const slice = blobOrBuffer.slice(0, 12);
      const ab = await slice.arrayBuffer();
      bytes = new Uint8Array(ab);
    }

    if (bytes.length < 12) return false;

    // Must start with 'RIFF' and have 'WAVE' at offset 8
    const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
    const isWave = bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45;

    return isRiff && isWave;
  } catch {
    return false;
  }
}

/**
 * Encodes Float32 mono audio samples into a standard 16-bit PCM RIFF WAV Blob.
 */
export function encodeMonoPcmWav(samples: Float32Array, sampleRate: number = 24000): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // 1. RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // 2. fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true); // Mono = 1
  view.setUint32(24, sampleRate, true); // Sample rate (24000)
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample (16)

  // 3. data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM samples with clipping protection
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Transcodes ANY audio Blob (WebM, MP3, OGG, AAC, WAV) into standard 24kHz 16-bit Mono PCM WAV.
 * Runs completely client-side in the browser using the Web Audio API.
 */
export async function transcodeAudioToStandardWav(
  inputBlob: Blob,
  targetSampleRate: number = 24000
): Promise<Blob> {
  // If not running in browser (e.g. SSR), return original blob
  if (typeof window === 'undefined') {
    return inputBlob;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn('[AudioTranscoder] Web Audio API not supported in this browser, using original blob');
      return inputBlob;
    }

    const audioCtx = new AudioContextClass();
    const arrayBuffer = await inputBlob.arrayBuffer();

    // Decode audio file into raw PCM audio buffer
    let decodedBuffer: AudioBuffer;
    try {
      decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    } finally {
      if (audioCtx.state !== 'closed') {
        await audioCtx.close();
      }
    }

    if (!decodedBuffer) {
      throw new Error('Failed to decode audio data.');
    }

    // High quality offline resampling to targetSampleRate (24,000Hz mono)
    const targetLength = Math.ceil(decodedBuffer.duration * targetSampleRate);
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const resampledBuffer = await offlineCtx.startRendering();
    const monoChannelData = resampledBuffer.getChannelData(0);

    // Encode to 100% genuine RIFF PCM WAV
    const wavBlob = encodeMonoPcmWav(monoChannelData, targetSampleRate);
    console.log(
      `[AudioTranscoder] Successfully transcoded audio: ${inputBlob.type || 'unknown'} (${inputBlob.size} bytes) -> 24kHz Mono WAV (${wavBlob.size} bytes, duration: ${decodedBuffer.duration.toFixed(1)}s)`
    );

    return wavBlob;
  } catch (err) {
    console.error('[AudioTranscoder] Audio transcoding failed, checking if original is usable:', err);
    // If transcoding fails but original was already RIFF WAV, keep it
    if (await isGenuineRiffWav(inputBlob)) {
      return inputBlob;
    }
    // Return original as best effort
    return inputBlob;
  }
}
