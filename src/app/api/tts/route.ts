import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice, rate, pitch, volume } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and cannot be empty.' },
        { status: 400 }
      );
    }

    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount > 50000) {
      return NextResponse.json(
        {
          error: `Text exceeds the maximum limit of 50,000 words (current: ${wordCount.toLocaleString()} words).`,
        },
        { status: 400 }
      );
    }

    // Format prosody values to match SSML expectations
    // rate: e.g. "+0%", "+25%", "-10%"
    // pitch: e.g. "+0Hz", "+20Hz", "-20Hz"
    // volume: e.g. "+0%", "+20%", "-20%"
    const formattedRate = typeof rate === 'string' && (rate.startsWith('+') || rate.startsWith('-'))
      ? rate
      : (typeof rate === 'number' ? `${rate >= 0 ? '+' : ''}${Math.round(rate)}%` : '+0%');

    const formattedPitch = typeof pitch === 'string' && (pitch.startsWith('+') || pitch.startsWith('-'))
      ? pitch
      : (typeof pitch === 'number' ? `${pitch >= 0 ? '+' : ''}${Math.round(pitch)}Hz` : '+0Hz');

    const formattedVolume = typeof volume === 'string' && (volume.startsWith('+') || volume.startsWith('-'))
      ? volume
      : (typeof volume === 'number' ? `${volume >= 0 ? '+' : ''}${Math.round(volume)}%` : '+0%');

    const { buffer, contentType } = await synthesizeSpeech(text.trim(), {
      voice: voice || 'en-US-JennyNeural',
      rate: formattedRate,
      pitch: formattedPitch,
      volume: formattedVolume,
    });

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
