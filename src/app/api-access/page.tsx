import { Metadata } from 'next';
import { ApiAccessPage } from '@/components/ApiAccessPage';

export const metadata: Metadata = {
  title: 'Developer REST API Access & Custom Quota Plans | TTSNexs',
  description:
    'Integrate 320+ high-fidelity neural AI voices and instant voice cloning into your software, bots, and mobile apps with custom character capacity.',
};

export default function ApiAccess() {
  return <ApiAccessPage />;
}
