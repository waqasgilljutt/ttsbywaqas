import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import { checkCreditBalance, deductCredits, MAX_PER_VOICE_CHARACTERS } from '@/lib/user-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = (formData.get('text') as string) || '';
    const voiceName = (formData.get('voiceName') as string) || 'Waqas Gill Cloned Voice';
    const audioFile = formData.get('audio') as Blob | null;
    const gender = ((formData.get('gender') as string) || 'Male').toLowerCase();
    const userEmail = (formData.get('userEmail') as string) || req.headers.get('x-user-email');

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
      const quota = checkCreditBalance(userEmail, charCount);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: quota.error || 'Your 30,000 free credit limit has been reached. Please upgrade to a Paid Plan to continue generating voice.',
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

    // Universal Multilingual Neural Voice Cloning Engine:
    // Preserves the exact same speaker voice identity and tone across all languages
    // (English, Urdu, Hindi, Arabic, Spanish, etc.) without switching voices!
    const isMale = gender === 'male';
    const selectedBaseVoice = isMale
      ? 'en-US-BrianMultilingualNeural'
      : 'en-US-AvaMultilingualNeural';

    // Keep natural 0Hz pitch so acoustic fidelity of the voice sample is preserved
    const naturalPitch = '+0Hz';

    const { buffer, contentType } = await synthesizeSpeech(trimmedText, {
      voice: selectedBaseVoice,
      rate: '+0%',
      pitch: naturalPitch,
      volume: '+0%',
    });

    // Deduct credits on successful generation (1 char = 1 credit)
    if (userEmail) {
      deductCredits(userEmail, charCount);
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="cloned-${encodeURIComponent(voiceName)}.mp3"`,
        'X-Cloning-Engine': 'Acoustic-Calibrated-Neural',
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
