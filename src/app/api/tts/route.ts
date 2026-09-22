import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import { checkCreditBalance, deductCredits, MAX_PER_VOICE_CHARACTERS } from '@/lib/user-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch, volume, userEmail: rawEmail, skipDeduct } = body;
    const userEmail = rawEmail || req.headers.get('x-user-email');

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const charCount = trimmedText.length;

    // 1. Enforce Per-Voice Generation Limit of 50,000 Characters
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

    // Format prosody values to match SSML expectations
    const formattedRate = typeof rate === 'string' && (rate.startsWith('+') || rate.startsWith('-'))
      ? rate
      : (typeof rate === 'number' ? `${rate >= 0 ? '+' : ''}${Math.round(rate)}%` : '+0%');

    const formattedPitch = typeof pitch === 'string' && (pitch.startsWith('+') || pitch.startsWith('-'))
      ? pitch
      : (typeof pitch === 'number' ? `${pitch >= 0 ? '+' : ''}${Math.round(pitch)}Hz` : '+0Hz');

    const formattedVolume = typeof volume === 'string' && (volume.startsWith('+') || volume.startsWith('-'))
      ? volume
      : (typeof volume === 'number' ? `${volume >= 0 ? '+' : ''}${Math.round(volume)}%` : '+0%');

    const { buffer, contentType } = await synthesizeSpeech(trimmedText, {
      voice: voice || 'en-US-JennyNeural',
      rate: formattedRate,
      pitch: formattedPitch,
      volume: formattedVolume,
    });

    // Deduct credits on successful generation (1 char = 1 credit) unless skipped for client batch orchestrator
    if (userEmail && !skipDeduct) {
      deductCredits(userEmail, charCount);
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': 'inline; filename="speech.mp3"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: unknown) {
    console.error('Error synthesizing speech in /api/tts:', err);
    return NextResponse.json(
      {
        error: (err as Error)?.message || 'Speech synthesis failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
