import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TTS bY Waqas Gill | EmpireNexs AI Voice Platform",
  description: "Next-generation Text-to-Speech & Voice Cloning Studio powered by EmpireNexs & Waqas Gill. 320+ realistic voices with up to 50,000 words limit.",
  keywords: ["TTS", "TTS bY Waqas Gill", "EmpireNexs", "Voice Cloning", "Edge TTS", "Text to Speech"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
