'use client';

import React from 'react';
import {
  Building2,
  User,
  Sparkles,
  ShieldCheck,
  Cpu,
  Globe2,
  Heart,
  Award,
  ExternalLink,
} from 'lucide-react';

export function AboutPage() {
  const stats = [
    { label: 'Neural Voices', value: '322+' },
    { label: 'Supported Locales', value: '142' },
    { label: 'Max Script Capacity', value: '50,000 words' },
    { label: 'Voice Cloning Latency', value: '< 3s' },
  ];

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-16">
      {/* Hero Banner */}
      <div className="text-center flex flex-col items-center gap-4 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-[#0b0c14] p-3 shadow-xl shadow-orange-500/15 flex items-center justify-center border border-orange-500/30">
          <img src="/logo.png" alt="TTSNexs Official Logo" className="w-full h-full object-contain" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>About the Platform</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          About TTSNexs AI Studio
        </h2>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Pioneering high-fidelity artificial voice synthesis and neural audio engineering to empower creators, developers, and businesses worldwide.
        </p>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="studio-card p-6 flex flex-col items-center text-center gap-1"
          >
            <span className="text-2xl font-black text-white font-mono">{s.value}</span>
            <span className="text-xs text-slate-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Company & Founder Story Grid - Company (EmpireNexs) FIRST as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* 1. Company Card (EmpireNexs FIRST) */}
        <div className="studio-card p-8 flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-colors">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building2 className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Technology Venture &amp; Parent Company
              </span>
              <div className="mt-0.5 flex items-center gap-2">
                <h3 className="text-2xl font-extrabold text-white">EmpireNexs</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold border border-purple-500/30">
                  Official
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">EmpireNexs</strong> is a forward-thinking digital innovation venture dedicated to building next-generation AI platforms, full-stack cloud ecosystems, and voice technologies. With a focus on performance, high concurrency, and human-centric design, EmpireNexs bridges the gap between state-of-the-art research models and daily digital workflows.
            </p>
          </div>

          <a
            href="https://empirenexs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-xs font-bold text-purple-300 flex items-center justify-between transition-all group shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-purple-400" />
              <span>Visit EmpireNexs Website: https://empirenexs.com</span>
            </span>
            <ExternalLink className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* 2. Founder Card (Waqas Gill SECOND) */}
        <div className="studio-card p-8 flex flex-col justify-between gap-6 hover:border-orange-500/40 transition-colors">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <User className="w-6 h-6" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Founder &amp; Lead AI Architect
              </span>
              <div className="mt-0.5">
                <a
                  href="https://www.facebook.com/mwaqasgillcs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl font-extrabold text-white hover:text-orange-400 transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
                >
                  <span>Waqas Gill</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-400 transition-colors" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <a
                href="https://www.facebook.com/mwaqasgillcs/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-orange-400 hover:text-orange-300 hover:underline cursor-pointer"
              >
                Waqas Gill
              </a>{' '}
              is an innovative technologist and software architect passionate about democratizing artificial intelligence. Recognizing the barriers that expensive voice platforms put on everyday creators, Waqas engineered this platform to provide unbounded 50,000-character neural speech, instant voice cloning, and flexible developer APIs.
            </p>
          </div>

          <a
            href="https://www.facebook.com/mwaqasgillcs/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-xs font-bold text-orange-300 flex items-center justify-between transition-all group shadow-xs cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              <span>Connect with Waqas Gill on Facebook</span>
            </span>
            <ExternalLink className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Developer API & Custom Orders Callout Section (Under About Nexs) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-black text-white border border-orange-500/30 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold w-fit">
            <Cpu className="w-3.5 h-3.5 text-orange-400" />
            <span>Developer REST API Access</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Want to use our Neural Voice API in your software or bots?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            We provide dedicated Developer API Keys with custom character packages (1M, 5M, 10M, 50M+ characters). Order a custom capacity plan and start integrating in minutes!
          </p>
        </div>

        <a
          href="/api-access"
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all shrink-0 cursor-pointer"
        >
          <span>Get Developer API Key</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Technology Architecture Section */}
      <div className="studio-card p-8 sm:p-10 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-bold text-white">How Our Technology Works</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="font-bold text-white text-sm">1. Neural Synthesis</span>
            <p className="text-slate-400 leading-relaxed">
              Proprietary TTSNexs Neural Acoustic Engine delivers genuine human vocal cadence with expressive inflection and zero robotic artifacts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="font-bold text-white text-sm">2. 50k Chars Chunking</span>
            <p className="text-slate-400 leading-relaxed">
              Intelligent sentence boundary detection chunks large books and articles into safe payloads, recombining them into continuous, gapless audio.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
            <span className="font-bold text-white text-sm">3. Instant Voice Cloning</span>
            <p className="text-slate-400 leading-relaxed">
              Extracts speaker pitch, cadence, and vocal timbre from raw microphone recordings or audio files to reproduce natural speech.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
