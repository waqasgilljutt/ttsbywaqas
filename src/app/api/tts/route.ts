import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import { checkCreditBalance, deductCredits, MAX_PER_VOICE_CHARACTERS } from '@/lib/user-store';
import {
  isFameSpeakConfigured,
  isFameSpeakVoice,
  getFameSpeakNeuralVoiceId,
  generateSpeechFromVoiceId,
} from '@/lib/famespeak-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch, volume, userEmail: rawEmail, skipDeduct, apiKey: bodyApiKey } = body;
    const userEmail = rawEmail || req.headers.get('x-user-email');
    const apiKey = req.headers.get('x-api-key') || req.nextUrl.searchParams.get('key') || bodyApiKey;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const charCount = trimmedText.length;

    // 1. External Scraper & Developer API Key Protection
    if (apiKey) {
      const { validateApiKey } = await import('@/lib/api-key-store');
      const keyCheck = validateApiKey(apiKey, charCount);
      if (!keyCheck.valid) {
        return NextResponse.json(
          {
            success: false,
            error: keyCheck.error || 'Invalid or expired Developer API Key.',
            orderCustomKey: 'https://ttsnexs.online/api-access',
            contact: 'muhammadwaqasmwg@gmail.com',
          },
          { status: 401 }
        );
      }
    } else {
      const { isInternalWebRequest } = await import('@/lib/api-key-store');
      const isInternal = isInternalWebRequest(req);
      if (!isInternal && !userEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized: External API access requires an authorized Developer API Key.',
            message: 'To order a custom API Key with your desired quota (1 Million, 5M, 10M, 50M+ characters), visit https://ttsnexs.online/api-access or contact EmpireNexs on WhatsApp.',
            apiPortalUrl: 'https://ttsnexs.online/api-access',
          },
          { status: 401 }
        );
      }
    }

    // 2. Enforce Per-Voice Generation Limit of 50,000 Characters
    if (charCount > MAX_PER_VOICE_CHARACTERS) {
      return NextResponse.json(
        {
          error: `Text exceeds the maximum per-voice limit of ${MAX_PER_VOICE_CHARACTERS.toLocaleString()} characters (current: ${charCount.toLocaleString()} characters).`,
        },
        { status: 400 }
      );
    }

    // 3. Enforce Account Credits: 1 Character = 1 Credit for Web Users
    if (userEmail && !apiKey) {
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

    let buffer: Buffer;
    let contentType = 'audio/mpeg';

    if (isFameSpeakVoice(voice) && isFameSpeakConfigured()) {
      const fameVoiceId = getFameSpeakNeuralVoiceId(voice) || '6ac5fadc28b249e398582b2d';
      console.log(`[TTS Engine] Synthesizing "${trimmedText.slice(0, 30)}..." via FameSpeak Ultra Neural Voice ID: ${fameVoiceId}`);
      const fameResult = await generateSpeechFromVoiceId(fameVoiceId, trimmedText);
      buffer = fameResult.buffer;
      contentType = fameResult.contentType || 'audio/mpeg';
    } else {
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

      const result = await synthesizeSpeech(trimmedText, {
        voice: voice || 'en-US-JennyNeural',
        rate: formattedRate,
        pitch: formattedPitch,
        volume: formattedVolume,
      });
      buffer = result.buffer;
      contentType = result.contentType;
    }

    // Deduct from API Key quota or user account credits
    if (apiKey) {
      const { deductApiKeyChars } = await import('@/lib/api-key-store');
      deductApiKeyChars(apiKey, charCount);
    } else if (userEmail && !skipDeduct) {
      deductCredits(userEmail, charCount);
    }

    const wantsJson = req.headers.get('accept')?.includes('application/json') || body.responseType === 'json';
    if (wantsJson) {
      const base64Audio = Buffer.from(buffer).toString('base64');
      return NextResponse.json({
        success: true,
        characters: charCount,
        voice: voice || 'en-US-JennyNeural',
        contentType,
        audioBase64: `data:${contentType};base64,${base64Audio}`,
      });
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
