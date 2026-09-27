'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Mic2,
  Dna,
  Zap,
  Globe2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  Volume2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_LIST: FAQItem[] = [
  {
    question: 'What is EmpireNexs and why is it considered the best AI voice over tool?',
    answer:
      'EmpireNexs is a cutting-edge, studio-grade AI Voice Generator and Instant Voice Cloning platform developed by Waqas Gill. It offers 320+ ultra-realistic neural voices spanning 140+ languages and regional accents. Unlike traditional platforms that restrict you to 1,000 or 3,000 characters, EmpireNexs supports up to 50,000 characters in a single pass with natural human inflection and zero robotic tone.',
  },
  {
    question: 'How does the instant voice cloning tool work?',
    answer:
      'Our zero-shot neural voice cloning engine allows you to replicate your own voice or any target speaker in seconds. Simply record 15 to 30 seconds of clean speech using your microphone or upload an audio file (MP3, WAV, M4A). EmpireNexs analyzes vocal timbre, pitch harmonics, and pacing to produce authentic clone speech from any written script.',
  },
  {
    question: 'Can I generate full audiobooks and long scripts with 50,000 characters?',
    answer:
      'Yes! EmpireNexs is purpose-built for creators, authors, and video producers. Our high-throughput synthesis engine processes scripts up to 50,000 characters directly into high-fidelity 48kHz audio without unnatural pauses or chapter fragmentation.',
  },
  {
    question: 'Is EmpireNexs Text to Speech free to use for YouTube and podcasts?',
    answer:
      'Yes, EmpireNexs offers generous free access for YouTube content creators, podcasters, educators, and indie developers. You can export studio-grade MP3/WAV files for your video voiceovers, social media reels, and presentations.',
  },
  {
    question: 'Which languages and accents are supported?',
    answer:
      'Over 140 locales are supported, including English (US, UK, Australia, India, Canada), Urdu (Pakistan, India), Hindi, Arabic (UAE, Saudi, Egypt), Spanish, French, German, Japanese, Portuguese, Chinese, and many more with native regional dialects.',
  },
  {
    question: 'How does EmpireNexs compare to ElevenLabs and other TTS tools?',
    answer:
      'While legacy commercial platforms charge exorbitant monthly subscriptions and cap character lengths at low tiers, EmpireNexs democratizes AI voice technology by offering 50,000-character scripts, instant cloning, and 320+ lifelike neural voices with fast synthesis speeds and accessible tiers.',
  },
];

export function SeoContentSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="w-full mt-16 pt-12 border-t border-slate-200/80 flex flex-col gap-16 text-slate-800">
      {/* SECTION 1: Main SEO Value Proposition & H2 */}
      <div className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-bold uppercase tracking-wider mx-auto shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>The #1 AI Voice Over &amp; Voice Cloning Tool</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Next-Generation <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">AI Text to Speech</span> &amp; Instant Voice Cloning Studio
        </h2>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
          Transform text into hyper-realistic human speech in seconds. Whether you are producing 
          YouTube voiceovers, TikTok narrations, audiobooks, educational e-learning courses, or commercial advertisements, 
          <strong> EmpireNexs</strong> delivers broadcast-quality acoustic fidelity with 
          over 320 lifelike neural voices and instant microphone-based voice cloning.
        </p>
      </div>

      {/* SECTION 2: Key Feature Pillars (Targeting Search Keywords) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shrink-0">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Best AI Voice Over Tool
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access over 320 expressive AI voices spanning 140+ languages and dialects. Fine-tune pitch, speech cadence, and volume with millisecond precision for natural, humanlike delivery.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 mt-auto pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Multi-lingual neural prosody</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Crystal clear 48kHz MP3 export</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Instant AI Voice Cloning Tool
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Clone any voice with only 15 to 30 seconds of reference audio. Record through your microphone or upload any audio file to generate speech that mirrors the unique warmth, timbre, and accent.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 mt-auto pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero-shot acoustic cloning</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Save &amp; reuse custom voice profiles</span>
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              50,000 Characters Limit
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Convert long-form documents, novel chapters, podcast scripts, and research papers without hitting frustrating character roadblocks or needing to merge audio files manually.
            </p>
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 mt-auto pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Single-pass continuous synthesis</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Zero timeout or buffer drops</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 3: How It Works in 3 Simple Steps (Rich Snippets target) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col gap-8 shadow-xl">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Simple 3-Step Workflow
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Generate Studio Speech &amp; Voice Clones
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Create professional-grade voiceovers in less than 30 seconds with no complex software installation required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Enter or Paste Your Text</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Type or paste your script into our intelligent text editor. Supports short video hooks or long audiobooks up to 50,000 characters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Pick a Voice or Clone Yours</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from 320+ natural neural voices across 140+ languages, or record 15-30 seconds of your own voice in our Voice Cloning tab.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h4 className="font-bold text-sm text-white">Synthesize &amp; Download MP3</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click Generate to synthesize instant high-definition audio. Preview playback in our visual audio wave player and download free.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Competitive Advantage Comparison Table */}
      <div className="flex flex-col gap-6">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Why EmpireNexs is the Top Choice for Voice Synthesis
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Compare our platform features against standard text-to-speech tools
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-brand-700 bg-brand-50/50">EmpireNexs Voice AI</th>
                <th className="p-4 sm:p-5 text-slate-500">Typical Online TTS Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-900">Character Limit Per Script</td>
                <td className="p-4 sm:p-5 font-bold text-brand-600 bg-brand-50/20">Up to 50,000 Chars</td>
                <td className="p-4 sm:p-5 text-slate-500">1,000 – 3,000 Chars only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-900">Neural Voices Variety</td>
                <td className="p-4 sm:p-5 font-bold text-brand-600 bg-brand-50/20">320+ Voices across 140+ Locales</td>
                <td className="p-4 sm:p-5 text-slate-500">Limited (10 – 30 basic voices)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-900">Instant Voice Cloning</td>
                <td className="p-4 sm:p-5 font-bold text-brand-600 bg-brand-50/20">Included (15-30s reference)</td>
                <td className="p-4 sm:p-5 text-slate-500">Paid Add-on ($20+/mo) or Unavailable</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-900">Audio Fidelity</td>
                <td className="p-4 sm:p-5 font-bold text-brand-600 bg-brand-50/20">Studio 48kHz HD Audio</td>
                <td className="p-4 sm:p-5 text-slate-500">22kHz Compressed / Robotic</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-slate-900">Free Access Tier</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-600 bg-brand-50/20">Yes (Free by Waqas Gill)</td>
                <td className="p-4 sm:p-5 text-slate-500">Strict paywall after 3 runs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: FAQs (SEO Rich Snippets Target) */}
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Got Questions?
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Everything you need to know about our AI voice over generator and voice cloning technology.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 bg-white transition-all overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 hover:text-brand-600 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Footer Branding CTA */}
      <div className="p-8 rounded-3xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-950 p-2 shadow-md flex items-center justify-center border border-amber-500/30">
          <img src="/logo.png" alt="EmpireNexs 3D Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900">
            Powered by EmpireNexs &amp; Waqas Gill
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Building the next generation of artificial intelligence, high-fidelity neural speech, and creative audio tools for the world.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/voice-cloning"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs transition-colors flex items-center gap-2"
          >
            <Dna className="w-4 h-4" />
            <span>Try Voice Cloning</span>
          </Link>
          <Link
            href="/about"
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            About Waqas Gill
          </Link>
        </div>
      </div>
    </section>
  );
}
