import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing & Plans | Affordable AI Voice Cloning & TTS Credits',
  description:
    'Choose the best plan for EmpireNexs AI Voice Studio. High-capacity character packages, fast neural synthesis, and unlimited voice cloning.',
  keywords: [
    'tts pricing',
    'voice cloning price',
    'ai voice over cost',
    'cheap text to speech api',
    'unlimited voice cloning plan',
  ],
  alternates: {
    canonical: 'https://dofashion.online/pricing',
  },
  openGraph: {
    title: 'EmpireNexs AI Voice Studio Pricing & Plans',
    description: 'Affordable AI Voice Cloning & TTS credits. Scale your content creation with zero limits.',
    url: 'https://dofashion.online/pricing',
    images: ['/logo.png'],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
