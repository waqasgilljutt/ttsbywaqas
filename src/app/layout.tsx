import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TTS bY Waqas Gill | EmpireNexs AI Voice Platform",
  description: "Next-generation Text-to-Speech & Voice Cloning Studio powered by EmpireNexs & Waqas Gill. 320+ realistic voices with up to 50,000 words limit.",
  keywords: ["TTS", "TTS bY Waqas Gill", "EmpireNexs", "Voice Cloning", "Edge TTS", "Text to Speech"],
  verification: {
    google: "0BQ6AxuSCNPHJ-nugq23MddBI6RUBp-JTIhwGHOXrTA",
  },
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
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col font-sans">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
