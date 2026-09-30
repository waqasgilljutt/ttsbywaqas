import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Voice Cloning Tool Online | Clone Any Voice in 1 Minute',
  description:
    'Clone any voice instantly with EmpireNexs AI Voice Cloning Studio. Upload or record 15-30 seconds of audio to generate a 100% authentic digital voice clone. Up to 50,000 characters capacity with instant MP3 download.',
  keywords: [
    'voice cloning tool',
    'ai voice clone online free',
    'clone my voice',
    'realistic voice cloner',
    'neural voice clone',
    'voice cloner online',
    'best voice cloning tool',
    'ai voice generator free',
    'voiceover cloning',
    'clone voice ai free',
  ],
  alternates: {
    canonical: 'https://ttsnexs.online/voice-cloning',
  },
  openGraph: {
    title: 'Free AI Voice Cloning Tool Online | Clone Any Voice in 1 Minute | EmpireNexs',
    description: 'Clone your authentic voice with EmpireNexs Neural Studio. 100% realistic pitch & cadence. 50,000 characters capacity.',
    url: 'https://ttsnexs.online/voice-cloning',
    images: ['/logo.png'],
  },
};

export default function VoiceCloningLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
