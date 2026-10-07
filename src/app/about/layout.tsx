import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About TTSNexs | Advanced Neural Voice Studio',
  description:
    'Discover the mission behind TTSNexs AI Voice Studio, built to empower creators and businesses with studio-grade text-to-speech and voice cloning technology.',
  alternates: {
    canonical: 'https://ttsnexs.online/about',
  },
  openGraph: {
    title: 'About TTSNexs | Neural Voice Technology',
    description: 'Empowering creators with 320+ neural voices and instant voice cloning.',
    url: 'https://ttsnexs.online/about',
    images: ['/logo.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
