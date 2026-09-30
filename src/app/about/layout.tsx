import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About EmpireNexs & Waqas Gill | Advanced Neural Audio Innovation',
  description:
    'Discover the mission behind EmpireNexs AI Voice Studio, founded by Waqas Gill. Empowering creators and businesses with studio-grade text-to-speech and voice cloning technology.',
  alternates: {
    canonical: 'https://ttsnexs.online/about',
  },
  openGraph: {
    title: 'About EmpireNexs & Waqas Gill | Neural Voice Technology',
    description: 'Empowering creators with 320+ neural voices and 1-minute voice cloning.',
    url: 'https://ttsnexs.online/about',
    images: ['/logo.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
