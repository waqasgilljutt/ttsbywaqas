import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import { synthesizeNeuralVoiceClone } from '@/lib/hf-voice-cloner';
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
    let engineUsed = 'Coqui-XTTS-v2';

    if (hasAudio) {
      // Execute true zero-shot neural voice cloning (Coqui XTTS-v2 + F5-TTS)
      // NEVER silently swap user's voice for Brian/Ava!
      try {
        console.log(`[Voice Cloning] Synthesizing "${trimmedText.slice(0, 40)}..." via Zero-Shot Neural Engine...`);
        const result = await synthesizeNeuralVoiceClone(audioFile, trimmedText, {
          refText: refText.trim(),
          removeSilence: true,
          timeoutMs: 55000,
        });
        buffer = result.buffer;
        contentType = result.contentType;
        engineUsed = result.engine;
      } catch (cloneErr: unknown) {
        console.error('[Voice Cloning] Neural engine error:', cloneErr);
        const errMsg = (cloneErr as Error)?.message || 'Voice cloning GPU cluster is currently busy.';
        const isQuotaErr = errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('limit') || errMsg.toLowerCase().includes('busy');
        const advice = isQuotaErr
          ? 'Daily free ZeroGPU limit (5 mins) reached on this token. Add additional free HF tokens to your HF_TOKENS pool or upgrade to Hugging Face PRO for 40 mins/day.'
          : 'Please try again in a few moments.';
        return NextResponse.json(
          {
            error: `${errMsg} (${advice})`,
          },
          { status: 503 }
        );
      }
    } else {
      // Pure preset voice profile (without audio sample)
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
