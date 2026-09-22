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
 */
export function splitScriptIntoNaturalChunks(
  text: string,
  maxChunkLength: number = 2400
): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChunkLength) {
    return [trimmed];
  }

  const chunks: string[] = [];
  // Split on double or single newlines (paragraphs)
  const paragraphs = trimmed.split(/\n+/);
  let currentChunk = '';

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    const candidate = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;

    if (candidate.length <= maxChunkLength) {
      currentChunk = candidate;
    } else {
      // If currentChunk already has content, flush it
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // If paragraph itself is small enough, start new chunk with it
      if (trimmedPara.length <= maxChunkLength) {
        currentChunk = trimmedPara;
      } else {
        // Break large paragraph along sentence boundaries: . ! ? । ۔ ;
        const sentences = trimmedPara.match(/[^.!?।۔;\n]+[.!?।۔;\n]+(?:\s+|$)|[^.!?।۔;\n]+$/g) || [trimmedPara];

        for (const sentence of sentences) {
          const s = sentence.trim();
          if (!s) continue;

          const sentenceCandidate = currentChunk ? `${currentChunk} ${s}` : s;

          if (sentenceCandidate.length <= maxChunkLength) {
            currentChunk = sentenceCandidate;
          } else {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }

            if (s.length <= maxChunkLength) {
              currentChunk = s;
            } else {
              // Fallback for extremely long sentences without punctuation: split by words
              const words = s.split(/\s+/);
              for (const word of words) {
                const wordCandidate = currentChunk ? `${currentChunk} ${word}` : word;
                if (wordCandidate.length <= maxChunkLength) {
                  currentChunk = wordCandidate;
                } else {
                  if (currentChunk) chunks.push(currentChunk.trim());
                  currentChunk = word;
                }
              }
            }
          }
        }
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((c) => c.length > 0);
}

/**
 * Orchestrates batch audio synthesis across multiple chunks and merges them
 * into a single unified continuous MP3 Blob.
 */
export async function synthesizeLargeScript(
  text: string,
  fetchChunkFn: (chunkText: string, chunkIndex: number, totalChunks: number) => Promise<Blob>,
  onProgress?: (info: BatchProgressInfo) => void,
  maxChunkSize: number = 2400
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

    const singleBlob = await fetchChunkFn(chunks[0] || text.trim(), 0, 1);

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

  // Multi-chapter batch synthesis
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

    const chunkBlob = await fetchChunkFn(currentChunkText, i, totalChunks);
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
    statusText: `Finalizing & stitching continuous master MP3 (${totalChars.toLocaleString()} chars)...`,
  });

  // Merge all MP3 audio bitstreams seamlessly into one single master Blob
  return new Blob(audioBlobs, { type: 'audio/mpeg' });
}
