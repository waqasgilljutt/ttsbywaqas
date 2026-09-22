import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTS bY Waqas Gill | AI Voice Generation Platform",
  description: "Next-generation Text-to-Speech studio powered by Microsoft Edge Neural Voices. 320+ realistic voices in 70+ languages with full rate, pitch, and prosody controls by Waqas Gill.",
  keywords: ["TTS", "TTS bY Waqas Gill", "Edge TTS", "Text to Speech", "AI Voice", "Next.js"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-studio-950 text-slate-100 min-h-screen flex flex-col font-sans">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none -z-10" />
        {children}
      </body>
    </html>
  );
}
