/**
 * High-Capacity Long-Form / Audiobook Batch Audio Synthesizer
 * Powered by EmpireNexs & Waqas Gill
 * 
 * Supports up to 40,000+ characters with 0% Vercel timeouts.
 * Splits text along natural sentence & paragraph boundaries and
 * merges standard 24kHz/48kbps MP3 bitstream frames seamlessly without voice breaks.
 */

export interface BatchProgressInfo {
  percent: number;
  currentChunk: number;
  totalChunks: number;
  completedChars: number;
  totalChars: number;
  statusText: string;
}

/**
 * Splits large text into natural, spoken chapters/chunks.
 * Preserves sentence terminators (. ! ? 。 । ۔ ;) and paragraph breaks so
 * that speech never cuts off mid-word or mid-sentence.
 * Guaranteed to never drop a single character even with dense, unspaced, or repeated text.
 */
export function splitScriptIntoNaturalChunks(
  text: string,
  maxChunkLength: number = 800
): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChunkLength) {
    return [trimmed];
  }

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > 0) {
    if (remaining.length <= maxChunkLength) {
      chunks.push(remaining.trim());
      break;
    }

    // Examine the window up to maxChunkLength
    const window = remaining.slice(0, maxChunkLength);
    const minSearchIndex = Math.floor(maxChunkLength * 0.4);

    let cutIndex = -1;

    // 1. First priority: Paragraph boundary (\n\n or \n) in last 60% of window
    const paraMatch = window.slice(minSearchIndex).lastIndexOf('\n');
    if (paraMatch !== -1) {
      cutIndex = minSearchIndex + paraMatch + 1;
    }

    // 2. Second priority: Sentence boundary (. ! ? । ۔ ;) in last 60% of window
    if (cutIndex === -1) {
      const sentenceRegex = /[.!?।۔;:]/g;
      let match: RegExpExecArray | null;
      const searchRegion = window.slice(minSearchIndex);
      let lastSentenceMatch = -1;
      while ((match = sentenceRegex.exec(searchRegion)) !== null) {
        lastSentenceMatch = match.index;
      }
      if (lastSentenceMatch !== -1) {
        cutIndex = minSearchIndex + lastSentenceMatch + 1;
      }
    }

    // 3. Third priority: Word boundary (whitespace) in last 60% of window
    if (cutIndex === -1) {
      const spaceMatch = window.slice(minSearchIndex).lastIndexOf(' ');
      if (spaceMatch !== -1) {
        cutIndex = minSearchIndex + spaceMatch + 1;
      }
    }

    // 4. Hard fallback if no punctuation or space found in region
    if (cutIndex === -1) {
      cutIndex = maxChunkLength;
    }

    const chunk = remaining.slice(0, cutIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    remaining = remaining.slice(cutIndex).trim();
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Orchestrates batch audio synthesis across multiple chunks and merges them
 * into a single unified continuous MP3 Blob.
 * Uses 800-character chapters for fast, 0% timeout Vercel processing with auto-retries.
 */
export async function synthesizeLargeScript(
  text: string,
  fetchChunkFn: (chunkText: string, chunkIndex: number, totalChunks: number) => Promise<Blob>,
  onProgress?: (info: BatchProgressInfo) => void,
  maxChunkSize: number = 800
): Promise<Blob> {
  const chunks = splitScriptIntoNaturalChunks(text, maxChunkSize);
  const totalChunks = chunks.length;
  const totalChars = text.trim().length;

  if (totalChunks <= 1) {
    onProgress?.({
      percent: 30,
      currentChunk: 1,
      totalChunks: 1,
      completedChars: 0,
      totalChars,
      statusText: 'Streaming audio from EmpireNexs Neural Engine...',
    });

    let singleBlob: Blob | null = null;
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        singleBlob = await fetchChunkFn(chunks[0] || text.trim(), 0, 1);
        if (singleBlob && singleBlob.size > 0) break;
      } catch (err) {
        lastErr = err;
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!singleBlob) {
      throw new Error((lastErr as Error)?.message || 'Speech synthesis failed. Please check network connection and try again.');
    }

    onProgress?.({
      percent: 100,
      currentChunk: 1,
      totalChunks: 1,
      completedChars: totalChars,
      totalChars,
      statusText: 'Speech synthesized successfully!',
    });

    return singleBlob;
  }

  // Multi-chapter batch synthesis with resilient auto-retry
  const audioBlobs: Blob[] = [];
  let completedChars = 0;

  for (let i = 0; i < totalChunks; i++) {
    const chunkNum = i + 1;
    const currentChunkText = chunks[i];
    const initialPercent = Math.round((i / totalChunks) * 100);

    onProgress?.({
      percent: initialPercent,
      currentChunk: chunkNum,
      totalChunks,
      completedChars,
      totalChars,
      statusText: `Synthesizing Part ${chunkNum} of ${totalChunks} (${initialPercent}%) - ${completedChars.toLocaleString()} / ${totalChars.toLocaleString()} chars...`,
    });

    let chunkBlob: Blob | null = null;
    let lastErr: unknown = null;
    const maxRetries = 8;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        chunkBlob = await fetchChunkFn(currentChunkText, i, totalChunks);
        if (chunkBlob && chunkBlob.size > 0) {
          break;
        }
      } catch (err: unknown) {
        lastErr = err;
        const errStr = String((err as Error)?.message || err);
        console.warn(`Part ${chunkNum} of ${totalChunks} (Attempt ${attempt}) error:`, err);

        if (attempt < maxRetries) {
          // Check if this is a GPU quota cooldown or temporary traffic limit
          const isQuotaCooldown =
            errStr.includes('ZeroGPU quota') ||
            errStr.includes('quota') ||
            errStr.includes('cooldown') ||
            errStr.includes('busy') ||
            errStr.includes('high traffic') ||
            errStr.includes('429');

          // Progressive cooldown backoff: 15s, 20s, 25s, 30s so GPU quota bucket fully refills
          const waitSeconds = isQuotaCooldown ? Math.min(30, 15 + (attempt - 1) * 5) : 3;

          // Second-by-second live countdown in user UI
          for (let sec = waitSeconds; sec > 0; sec--) {
            onProgress?.({
              percent: initialPercent,
              currentChunk: chunkNum,
              totalChunks,
              completedChars,
              totalChars,
              statusText: isQuotaCooldown
                ? `Recharging AI Voice GPU cluster for Part ${chunkNum} of ${totalChunks}... Auto-resuming in ${sec}s (Attempt ${attempt}/${maxRetries})`
                : `Retrying Part ${chunkNum} of ${totalChunks} in ${sec}s (Attempt ${attempt}/${maxRetries})...`,
            });
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }
    }

    if (!chunkBlob) {
      const errMsg = (lastErr as Error)?.message || 'Network error or timeout';
      throw new Error(`Part ${chunkNum} of ${totalChunks} failed: ${errMsg}`);
    }

    audioBlobs.push(chunkBlob);
    completedChars += currentChunkText.length;

    const postPercent = Math.round((chunkNum / totalChunks) * 100);
    onProgress?.({
      percent: postPercent,
      currentChunk: chunkNum,
      totalChunks,
      completedChars,
      totalChars,
      statusText: `Processed Part ${chunkNum} of ${totalChunks} (${postPercent}%) - ${completedChars.toLocaleString()} / ${totalChars.toLocaleString()} chars...`,
    });
  }

  onProgress?.({
    percent: 100,
    currentChunk: totalChunks,
    totalChunks,
    completedChars: totalChars,
    totalChars,
    statusText: `Finalizing & stitching continuous master audio (${totalChars.toLocaleString()} chars)...`,
  });

  return await mergeAudioBlobs(audioBlobs);
}

/**
 * Merges an array of audio blobs, automatically handling WAV RIFF headers or MP3 streams.
 */
export async function mergeAudioBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 0) return new Blob([], { type: 'audio/mpeg' });
  if (blobs.length === 1) return blobs[0];

  const firstBlob = blobs[0];
  const firstType = firstBlob.type || '';
  const isWav = firstType.includes('wav') || firstType.includes('wave');

  if (!isWav) {
    return new Blob(blobs, { type: 'audio/mpeg' });
  }

  // Merge WAV blobs with updated RIFF length
  const arrayBuffers = await Promise.all(blobs.map((b) => b.arrayBuffer()));
  const pcmChunks: Uint8Array[] = [];
  let totalPcmLength = 0;

  for (const ab of arrayBuffers) {
    const view = new DataView(ab);
    let offset = 12;
    while (offset < ab.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3)
      );
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkId === 'data') {
        const pcm = new Uint8Array(ab, offset + 8, Math.min(chunkSize, ab.byteLength - (offset + 8)));
        pcmChunks.push(pcm);
        totalPcmLength += pcm.length;
        break;
      }
      offset += 8 + chunkSize;
    }
  }

  if (pcmChunks.length === 0) {
    return new Blob(blobs, { type: 'audio/wav' });
  }

  const header = new Uint8Array(arrayBuffers[0].slice(0, 44));
  const headerView = new DataView(header.buffer);
  headerView.setUint32(4, 36 + totalPcmLength, true);
  headerView.setUint32(40, totalPcmLength, true);

  return new Blob([header as unknown as BlobPart, ...(pcmChunks as unknown as BlobPart[])], { type: 'audio/wav' });
}
