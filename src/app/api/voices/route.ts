import { NextRequest, NextResponse } from 'next/server';
import { fetchVoices } from '@/lib/edge-tts-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const locale = searchParams.get('locale') || '';
    const gender = searchParams.get('gender') || '';

    const allVoices = await fetchVoices();

    // Extract unique locales and languages for easy filtering
    const localesMap = new Map<string, { locale: string; name: string; count: number }>();

    for (const v of allVoices) {
      if (!localesMap.has(v.Locale)) {
        localesMap.set(v.Locale, {
          locale: v.Locale,
          name: v.LocaleName || v.Locale,
          count: 1,
        });
      } else {
        const item = localesMap.get(v.Locale)!;
        item.count += 1;
      }
    }

    const availableLocales = Array.from(localesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    let filtered = allVoices;

    if (locale && locale !== 'all') {
      filtered = filtered.filter((v) => v.Locale.toLowerCase() === locale.toLowerCase());
    }

    if (gender && gender !== 'all') {
      filtered = filtered.filter(
        (v) => v.Gender.toLowerCase() === gender.toLowerCase()
      );
    }

    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.FriendlyName.toLowerCase().includes(search) ||
          v.ShortName.toLowerCase().includes(search) ||
          v.LocaleName.toLowerCase().includes(search) ||
          (v.VoiceTag?.VoicePersonalities &&
            v.VoiceTag.VoicePersonalities.some((p) => p.toLowerCase().includes(search)))
      );
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      allTotal: allVoices.length,
      locales: availableLocales,
      voices: filtered,
    });
  } catch (err: unknown) {
    console.error('Error in /api/voices:', err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error)?.message || 'Failed to fetch voices',
      },
      { status: 500 }
    );
  }
}
