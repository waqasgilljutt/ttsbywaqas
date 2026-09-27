import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '320+ AI Voices Library | Male, Female, Accents & 140+ Languages',
  description:
    'Explore 320+ high-fidelity neural voices across 140+ languages and locales. Listen to instant audio previews, filter by gender and accent, and find the perfect voice for your project on EmpireNexs.',
  keywords: [
    'ai voice library',
    'text to speech voices',
    '300+ ai voices',
    'urdu ai voice',
    'hindi ai voice',
    'english neural voice',
    'realistic female voice',
    'realistic male voice',
  ],
  alternates: {
    canonical: 'https://dofashion.online/voice-library',
  },
  openGraph: {
    title: '320+ AI Voices Library | EmpireNexs Neural Voice Studio',
    description: 'Explore 320+ high-fidelity voices across 140+ languages. Free instant previews.',
    url: 'https://dofashion.online/voice-library',
    images: ['/logo.png'],
  },
};

export default function VoiceLibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
