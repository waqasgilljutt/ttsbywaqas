import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/edge-tts-service';
import {
  isFameSpeakConfigured,
  synthesizeFameSpeakVoiceClone,
  generateSpeechFromVoiceId,
  startFameSpeakVoiceCloneJob,
  checkFameSpeakJobStatus,
  downloadFameSpeakJobAudio,
} from '@/lib/famespeak-service';
import { checkCreditBalance, deductCredits, MAX_PER_VOICE_CHARACTERS } from '@/lib/user-store';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const audioJobId = searchParams.get('audioJobId') || searchParams.get('audioUrl');

    if (audioJobId) {
      const audioResult = await downloadFameSpeakJobAudio(audioJobId);
      return new Response(new Uint8Array(audioResult.buffer), {
        status: 200,
        headers: {
          'Content-Type': audioResult.contentType,
          'Content-Length': audioResult.buffer.length.toString(),
          'Cache-Control': 'no-cache',
        },
      });
    }

    if (jobId) {
      const statusResult = await checkFameSpeakJobStatus(jobId);
      return NextResponse.json(statusResult);
    }

    return NextResponse.json({ error: 'Missing jobId or audioJobId query parameter' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Status query failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = (formData.get('text') as string) || '';
    const voiceName = (formData.get('voiceName') as string) || 'Waqas Gill Cloned Voice';
    const audioFile = formData.get('audio') as Blob | null;
    const neuralVoiceId =
      (formData.get('neuralVoiceId') as string | null) ||
      (formData.get('clonedVoiceId') as string | null) ||
      (formData.get('famespeakVoiceId') as string | null);
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
    const hasPresetVoice = Boolean(formData.get('gender') || formData.get('voiceName') || neuralVoiceId);

    if (!hasAudio && !hasPresetVoice && !neuralVoiceId) {
      return NextResponse.json(
        { error: 'A voice sample audio recording or voice profile is required for cloning.' },
        { status: 400 }
      );
    }

    let buffer: Buffer = Buffer.alloc(0);
    let contentType = 'audio/mpeg';
    let engineUsed = 'EmpireNexs-Neural-Pro';
    let activeVoiceId = neuralVoiceId || '';

    const isAsync = req.headers.get('x-async-clone') === 'true' || formData.get('async') === 'true';

    // Fast-path: Async non-blocking generation for EmpireNexs Neural Pro
    if (isAsync && isFameSpeakConfigured() && (hasAudio || neuralVoiceId)) {
      try {
        let rawAudioBuffer: Buffer | null = null;
        let mimeType = 'audio/wav';
        if (hasAudio) {
          const arrayBuffer = await audioFile.arrayBuffer();
          rawAudioBuffer = Buffer.from(arrayBuffer);
          mimeType = audioFile.type || 'audio/wav';
        }

        const job = await startFameSpeakVoiceCloneJob(
          rawAudioBuffer,
          neuralVoiceId,
          trimmedText,
          { voiceName, mimeType }
        );

        if (userEmail && !skipDeduct) {
          deductCredits(userEmail, charCount);
        }

        return NextResponse.json({
          status: 'IN_PROGRESS',
          jobId: job.jobId,
          voiceId: job.voiceId,
          statusUrl: job.statusUrl,
          engine: 'EmpireNexs-Neural-Pro',
        }, { status: 202 });
      } catch (err: unknown) {
        console.warn('[EmpireNexs Voice Engine] Async job start failed, falling back to sync:', err);
      }
    }

    // A) Direct synthesis with a saved neural voice ID
    if (neuralVoiceId && isFameSpeakConfigured()) {
      try {
        console.log(`[EmpireNexs Voice Engine] Synthesizing "${trimmedText.slice(0, 40)}..." with Voice ID: ${neuralVoiceId}`);
        const fameRes = await generateSpeechFromVoiceId(neuralVoiceId, trimmedText);
        buffer = fameRes.buffer;
        contentType = fameRes.contentType;
        engineUsed = 'EmpireNexs-Neural-Profile';
      } catch (err: unknown) {
        console.error('[EmpireNexs Voice Engine] Error generating from Voice ID:', err);
        return NextResponse.json(
          { error: (err as Error)?.message || 'Failed to generate voice from saved profile.' },
          { status: 500 }
        );
      }
    } else if (hasAudio) {
      // B) Neural voice cloning from user audio recording
      const arrayBuffer = await audioFile.arrayBuffer();
      const rawAudioBuffer = Buffer.from(arrayBuffer);
      const mimeType = audioFile.type || 'audio/wav';

      if (!isFameSpeakConfigured()) {
        return NextResponse.json(
          { error: 'EmpireNexs Voice Engine is not configured. Please check your API settings.' },
          { status: 500 }
        );
      }

      try {
        console.log(`[EmpireNexs Voice Engine] Synthesizing "${trimmedText.slice(0, 40)}..." via EmpireNexs Neural Pro Engine...`);
        const fameResult = await synthesizeFameSpeakVoiceClone(
          rawAudioBuffer,
          trimmedText,
          {
            voiceName,
            mimeType,
            timeoutMs: 55000,
          }
        );
        buffer = fameResult.buffer;
        contentType = fameResult.contentType;
        engineUsed = 'EmpireNexs-Neural-Pro';
        activeVoiceId = fameResult.voiceId || activeVoiceId;
        console.log(`[EmpireNexs Voice Engine] EmpireNexs Neural Pro synthesis successful (${buffer.length} bytes).`);
      } catch (fameErr: unknown) {
        console.error('[EmpireNexs Voice Engine] Engine error:', fameErr);
        const errMsg = (fameErr as Error)?.message || 'Voice cloning failed';
        return NextResponse.json(
          { error: `Voice cloning failed: ${errMsg}. Please try again.` },
          { status: 500 }
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
        ...(activeVoiceId ? { 'X-Neural-Voice-Id': activeVoiceId } : {}),
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
