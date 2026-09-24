import { NextRequest, NextResponse } from 'next/server';
import {
  isFameSpeakConfigured,
  getFameSpeakAccountStatus,
  listFameSpeakSavedVoices,
} from '@/lib/famespeak-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    if (!isFameSpeakConfigured()) {
      return NextResponse.json({
        configured: false,
        message: 'FameSpeak API key is not configured in .env.local',
      });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'voices') {
      const voices = await listFameSpeakSavedVoices();
      return NextResponse.json({
        configured: true,
        voices,
      });
    }

    // Default: return account & credit status
    const status = await getFameSpeakAccountStatus();
    return NextResponse.json({
      configured: true,
      ...status,
    });
  } catch (err: unknown) {
    console.error('Error in /api/famespeak:', err);
    return NextResponse.json(
      {
        configured: isFameSpeakConfigured(),
        error: (err as Error)?.message || 'Failed to query FameSpeak status',
      },
      { status: 500 }
    );
  }
}
