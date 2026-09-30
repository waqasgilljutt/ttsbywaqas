import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ttsnexs.online';

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "EmpireNexs - Best AI Voice Generator & Instant Voice Cloning Tool",
    template: "%s | EmpireNexs AI Voice Platform",
  },
  description:
    "Experience studio-grade Text to Speech with 320+ realistic AI voices in 140+ languages and instant voice cloning with EmpireNexs. Supports up to 50,000 characters per script, 100% free by Waqas Gill.",
  keywords: [
    "voice over tool",
    "voice cloning tool",
    "best tts",
    "ai voice generator",
    "text to speech online",
    "ai voice clone online",
    "free voice cloning",
    "text to voice converter",
    "realistic ai voice generator",
    "50000 characters text to speech",
    "urdu text to speech",
    "hindi ai voice generator",
    "instant voice clone",
    "voiceover generator for youtube",
    "EmpireNexs",
    "TTS By Waqas Gill",
    "Waqas Gill",
  ],
  authors: [
    {
      name: "Waqas Gill",
      url: "https://www.facebook.com/mwaqasgillcs/",
    },
    {
      name: "EmpireNexs",
      url: siteUrl,
    },
  ],
  creator: "Waqas Gill (EmpireNexs)",
  publisher: "EmpireNexs",
  applicationName: "EmpireNexs AI Voice Studio",
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "EmpireNexs AI Voice Platform",
    title: "EmpireNexs - Best AI Voice Generator & Instant Voice Cloning Tool",
    description:
      "Generate studio-quality voiceovers with 320+ lifelike AI voices or clone your voice in seconds. Supports 50,000 characters per script, 100% free by Waqas Gill.",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "EmpireNexs Official 3D Black and Gold Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EmpireNexs - Best AI Voice Generator & Instant Voice Cloning Tool",
    description:
      "Studio-grade AI Voice Over & Instant Voice Cloning with 320+ realistic voices and up to 50,000 characters per script.",
    images: ["/logo.png"],
    creator: "@EmpireNexs",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  verification: {
    google: "0BQ6AxuSCNPHJ-nugq23MddBI6RUBp-JTIhwGHOXrTA",
  },
};

const jsonLdStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "EmpireNexs AI Voice Generator & Voice Cloner",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All modern browsers (Chrome, Edge, Safari, Firefox)",
      "url": siteUrl,
      "image": `${siteUrl}/logo.png`,
      "description":
        "The leading AI Voice Over Tool and Zero-Shot Instant Voice Cloner supporting 320+ neural voices, 140+ languages, and up to 50,000 characters per script.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250",
        "bestRating": "5",
        "worstRating": "1",
      },
      "featureList": [
        "Instant Microphone Voice Cloning",
        "320+ High Fidelity Neural Voices",
        "50,000 Characters Single Pass Synthesis",
        "Zero-Robotic Inflection Acoustic Engine",
        "140+ Global Locales including Urdu, Hindi, English, Arabic",
        "Studio Quality 48kHz MP3 Audio Export",
      ],
    },
    {
      "@type": "Organization",
      "name": "EmpireNexs",
      "url": siteUrl,
      "logo": `${siteUrl}/logo.png`,
      "sameAs": [
        "https://www.facebook.com/mwaqasgillcs/",
      ],
      "founder": {
        "@type": "Person",
        "name": "Waqas Gill",
        "url": "https://www.facebook.com/mwaqasgillcs/",
        "jobTitle": "Lead AI Architect & Founder",
      },
    },
    {
      "@type": "WebSite",
      "name": "EmpireNexs AI Voice Platform",
      "url": siteUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is EmpireNexs and why is it considered the best AI voice over tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "EmpireNexs is a premier AI voice over platform offering 320+ realistic neural voices across 140+ languages with up to 50,000 characters per script and instant microphone voice cloning, created by Waqas Gill.",
          },
        },
        {
          "@type": "Question",
          "name": "How does voice cloning work on EmpireNexs?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Record 15 to 30 seconds of your voice or upload an audio sample. EmpireNexs analyzes pitch, harmonics, and pacing to immediately reproduce authentic clone speech without long training queues.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I convert 50,000 characters of text to speech in one go?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, EmpireNexs supports full 50,000 characters in a single pass without splitting into separate files, ideal for audiobooks, long YouTube videos, and podcasts.",
          },
        },
        {
          "@type": "Question",
          "name": "Is EmpireNexs free to use for commercial YouTube videos?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, EmpireNexs provides free access to standard neural voices and instant voice cloning, created by Waqas Gill to democratize AI voice technology.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="google-site-verification" content="0BQ6AxuSCNPHJ-nugq23MddBI6RUBp-JTIhwGHOXrTA" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdStructuredData) }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans antialiased selection:bg-brand-500 selection:text-white">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
