import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import { synthesizeF5VoiceClone } from '@/lib/hf-voice-cloner';
import { checkCreditBalance, deductCredits, MAX_PER_VOICE_CHARACTERS } from '@/lib/user-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = (formData.get('text') as string) || '';
    const voiceName = (formData.get('voiceName') as string) || 'Waqas Gill Cloned Voice';
    const audioFile = formData.get('audio') as Blob | null;
    const refText = (formData.get('refText') as string) || '';
    const gender = ((formData.get('gender') as string) || 'Male').toLowerCase();
    const userEmail = (formData.get('userEmail') as string) || req.headers.get('x-user-email');
    const skipDeduct = formData.get('skipDeduct') === 'true';

    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length === 0) {
      return NextResponse.json(
        { error: 'Text to synthesize in cloned voice cannot be empty.' },
        { status: 400 }
      );
    }

    const charCount = trimmedText.length;

    // 1. Enforce Per-Voice Limit of 50,000 Characters
    if (charCount > MAX_PER_VOICE_CHARACTERS) {
      return NextResponse.json(
        {
          error: `Text exceeds the maximum per-voice limit of ${MAX_PER_VOICE_CHARACTERS.toLocaleString()} characters (current: ${charCount.toLocaleString()} characters).`,
        },
        { status: 400 }
      );
    }

    // 2. Enforce Account Credits: 1 Character = 1 Credit
    if (userEmail) {
      // If skipDeduct is active (multi-part batch chunk), verify that the account has not already exceeded limit
      const quota = checkCreditBalance(userEmail, skipDeduct ? 0 : charCount);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: quota.error || 'Your credit limit has been reached. Please upgrade to a Paid Plan to continue generating voice.',
            creditExceeded: true,
            remainingCredits: quota.remainingCredits,
            creditsUsed: quota.creditsUsed,
            creditLimit: quota.creditLimit,
          },
          { status: 403 }
        );
      }
    }

    const hasAudio = audioFile && audioFile.size > 0;
    const hasPresetVoice = Boolean(formData.get('gender') || formData.get('voiceName'));

    if (!hasAudio && !hasPresetVoice) {
      return NextResponse.json(
        { error: 'A voice sample audio recording or voice profile is required for cloning.' },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    let contentType: string;
    let engineUsed = 'HuggingFace-F5-TTS';

    if (hasAudio) {
      try {
        console.log(`[Voice Cloning] Synthesizing "${trimmedText.slice(0, 40)}..." via Hugging Face F5-TTS...`);
        const hfResult = await synthesizeF5VoiceClone(audioFile, trimmedText, {
          refText: refText.trim(),
          removeSilence: true,
          timeoutMs: 65000,
        });
        buffer = hfResult.buffer;
        contentType = hfResult.contentType;
      } catch (hfErr) {
        console.warn('[Voice Cloning] Hugging Face F5-TTS error or queue timeout, falling back to Neural Edge TTS:', hfErr);
        engineUsed = 'EdgeTTS-Multilingual-Fallback';

        const isMale = gender === 'male';
        const selectedBaseVoice = isMale
          ? 'en-US-BrianMultilingualNeural'
          : 'en-US-AvaMultilingualNeural';

        const edgeResult = await synthesizeSpeech(trimmedText, {
          voice: selectedBaseVoice,
          rate: '+0%',
          pitch: '+0Hz',
          volume: '+0%',
        });
        buffer = edgeResult.buffer;
        contentType = edgeResult.contentType;
      }
    } else {
      engineUsed = 'EdgeTTS-Preset';
      const isMale = gender === 'male';
      const selectedBaseVoice = isMale
        ? 'en-US-BrianMultilingualNeural'
        : 'en-US-AvaMultilingualNeural';

      const edgeResult = await synthesizeSpeech(trimmedText, {
        voice: selectedBaseVoice,
        rate: '+0%',
        pitch: '+0Hz',
        volume: '+0%',
      });
      buffer = edgeResult.buffer;
      contentType = edgeResult.contentType;
    }

    // Deduct credits on successful generation (1 char = 1 credit) unless skipped for client batch orchestrator
    if (userEmail && !skipDeduct) {
      deductCredits(userEmail, charCount);
    }

    const fileExt = contentType.includes('wav') ? 'wav' : 'mp3';

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="cloned-${encodeURIComponent(voiceName)}.${fileExt}"`,
        'X-Cloning-Engine': engineUsed,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/clone:', err);
    return NextResponse.json(
      {
        error: (err as Error)?.message || 'Voice cloning failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
