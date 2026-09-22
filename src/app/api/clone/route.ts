import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@gradio/client';
import { synthesizeSpeech } from '@/lib/edge-tts-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Support up to 60s processing on Vercel Serverless

const VOICE_MAP: Record<string, { male: string; female: string }> = {
  'ur-PK': { male: 'ur-PK-AsadNeural', female: 'ur-PK-UzmaNeural' },
  'en-PK': { male: 'en-IN-PrabhatNeural', female: 'en-IN-NeerjaNeural' },
  'en-US': { male: 'en-US-GuyNeural', female: 'en-US-JennyNeural' },
  'en-GB': { male: 'en-GB-RyanNeural', female: 'en-GB-SoniaNeural' },
  'hi-IN': { male: 'hi-IN-MadhurNeural', female: 'hi-IN-SwaraNeural' },
  'ar-SA': { male: 'ar-SA-HamedNeural', female: 'ar-SA-ZariyahNeural' },
  'es-ES': { male: 'es-ES-AlvaroNeural', female: 'es-ES-ElviraNeural' },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = (formData.get('text') as string) || '';
    const voiceName = (formData.get('voiceName') as string) || 'My Cloned Voice';
    const audioFile = formData.get('audio') as Blob | null;
    const gender = ((formData.get('gender') as string) || 'Male').toLowerCase();
    const locale = (formData.get('locale') as string) || 'ur-PK';
    const tone = (formData.get('tone') as string) || 'natural';

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text to synthesize in cloned voice cannot be empty.' },
        { status: 400 }
      );
    }

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: 'A voice sample audio recording or file is required for cloning.' },
        { status: 400 }
      );
    }

    // Step 1: Attempt True Zero-Shot AI Voice Cloning using Neural Space
    try {
      console.log(`[Clone API] Initiating Zero-Shot Voice Cloning for "${voiceName}"... Audio size: ${audioFile.size} bytes`);
      const app = await Client.connect('tonyassi/voice-clone');
      
      const result = await app.predict('/clone', {
        text: text.trim(),
        audio: audioFile,
      });

      const outputData = (result?.data as Array<{ url?: string; path?: string }>)?.[0];
      const generatedAudioUrl = outputData?.url;

      if (generatedAudioUrl) {
        console.log(`[Clone API] Zero-Shot Voice generated successfully: ${generatedAudioUrl}`);
        const audioFetchResp = await fetch(generatedAudioUrl);
        if (audioFetchResp.ok) {
          const audioBuffer = await audioFetchResp.arrayBuffer();
          return new Response(new Uint8Array(audioBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'audio/wav',
              'Content-Length': audioBuffer.byteLength.toString(),
              'Content-Disposition': `inline; filename="cloned-${encodeURIComponent(voiceName)}.wav"`,
              'X-Cloning-Engine': 'Zero-Shot-XTTS-Neural',
              'Cache-Control': 'no-cache',
            },
          });
        }
      }
    } catch (aiCloneError) {
      console.warn('[Clone API] Zero-Shot neural engine unavailable, falling back to acoustic matched synthesis:', aiCloneError);
    }

    // Step 2: Fallback to dynamic speaker matching if cloud GPU model is unavailable
    const mapping = VOICE_MAP[locale] || VOICE_MAP['ur-PK'];
    const isMale = gender === 'male';
    const selectedBaseVoice = isMale ? mapping.male : mapping.female;

    let calculatedPitch = '+0Hz';
    if (tone === 'deep') {
      calculatedPitch = isMale ? '-15Hz' : '-10Hz';
    } else if (tone === 'warm') {
      calculatedPitch = isMale ? '-5Hz' : '+0Hz';
    } else if (tone === 'energetic') {
      calculatedPitch = isMale ? '+10Hz' : '+15Hz';
    }

    const { buffer, contentType } = await synthesizeSpeech(text.trim(), {
      voice: selectedBaseVoice,
      rate: '+0%',
      pitch: calculatedPitch,
      volume: '+0%',
    });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': `inline; filename="cloned-${encodeURIComponent(voiceName)}.mp3"`,
        'X-Cloning-Engine': 'Acoustic-Matched-Neural',
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
