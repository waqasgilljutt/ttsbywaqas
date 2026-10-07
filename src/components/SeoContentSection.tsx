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
    question: 'What is TTSNexs and why is it considered the best AI voice over tool?',
    answer:
      'TTSNexs is a cutting-edge, studio-grade AI Voice Generator and Instant Voice Cloning platform. It offers 320+ ultra-realistic neural voices spanning 140+ languages and regional accents. Unlike traditional platforms that restrict you to 1,000 or 3,000 characters, TTSNexs supports up to 50,000 characters in a single pass with natural human inflection and zero robotic tone.',
  },
  {
    question: 'How does the instant voice cloning tool work?',
    answer:
      'Our zero-shot neural voice cloning engine allows you to replicate your own voice or any target speaker in seconds. Simply record 15 to 30 seconds of clean speech using your microphone or upload an audio file (MP3, WAV, M4A). TTSNexs analyzes vocal timbre, pitch harmonics, and pacing to produce authentic clone speech from any written script.',
  },
  {
    question: 'Can I generate full audiobooks and long scripts with 50,000 characters?',
    answer:
      'Yes! TTSNexs is purpose-built for creators, authors, and video producers. Our high-throughput synthesis engine processes scripts up to 50,000 characters directly into high-fidelity 48kHz audio without unnatural pauses or chapter fragmentation.',
  },
  {
    question: 'Is TTSNexs Text to Speech free to use for YouTube and podcasts?',
    answer:
      'Yes, TTSNexs offers generous free access for YouTube content creators, podcasters, educators, and indie developers. You can export studio-grade MP3/WAV files for your video voiceovers, social media reels, and presentations.',
  },
  {
    question: 'Which languages and accents are supported?',
    answer:
      'Over 140 locales are supported, including English (US, UK, Australia, India, Canada), Urdu (Pakistan, India), Hindi, Arabic (UAE, Saudi, Egypt), Spanish, French, German, Japanese, Portuguese, Chinese, and many more with native regional dialects.',
  },
  {
    question: 'How does TTSNexs compare to ElevenLabs and other TTS tools?',
    answer:
      'While legacy commercial platforms charge exorbitant monthly subscriptions and cap character lengths at low tiers, TTSNexs democratizes AI voice technology by offering 50,000-character scripts, instant cloning, and 320+ lifelike neural voices with fast synthesis speeds and accessible tiers.',
  },
];

export function SeoContentSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="w-full mt-16 pt-12 border-t border-white/[0.08] flex flex-col gap-16 text-slate-300">
      {/* SECTION 1: Main SEO Value Proposition & H2 */}
      <div className="flex flex-col gap-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mx-auto shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>The #1 AI Voice Over &amp; Voice Cloning Tool</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Next-Generation <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">AI Text to Speech</span> &amp; Instant Voice Cloning Studio
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Transform text into hyper-realistic human speech in seconds. Whether you are producing 
          YouTube voiceovers, TikTok narrations, audiobooks, educational e-learning courses, or commercial advertisements, 
          <strong className="text-white"> TTSNexs</strong> delivers broadcast-quality acoustic fidelity with 
          over 320 lifelike neural voices and instant microphone-based voice cloning.
        </p>
      </div>

      {/* SECTION 2: Key Feature Pillars (Targeting Search Keywords) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="studio-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
            <Mic2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Best AI Voice Over Tool
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access over 320 expressive AI voices spanning 140+ languages and dialects. Fine-tune pitch, speech cadence, and volume with millisecond precision for natural, humanlike delivery.
            </p>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 mt-auto pt-2 border-t border-white/[0.08]">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Multi-lingual neural prosody</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Crystal clear 48kHz MP3 export</span>
            </li>
          </ul>
        </div>

        <div className="studio-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Dna className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Instant AI Voice Cloning Tool
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clone any voice with only 15 to 30 seconds of reference audio. Record through your microphone or upload any audio file to generate speech that mirrors the unique warmth, timbre, and accent.
            </p>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 mt-auto pt-2 border-t border-white/[0.08]">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero-shot acoustic cloning</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Save &amp; reuse custom voice profiles</span>
            </li>
          </ul>
        </div>

        <div className="studio-card p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              50,000 Characters Limit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Convert long-form documents, novel chapters, podcast scripts, and research papers without hitting frustrating character roadblocks or needing to merge audio files manually.
            </p>
          </div>
          <ul className="text-xs text-slate-300 space-y-1.5 mt-auto pt-2 border-t border-white/[0.08]">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Single-pass continuous synthesis</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Zero timeout or buffer drops</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 3: How It Works in 3 Simple Steps (Rich Snippets target) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#0e101a] via-[#131624] to-[#0a0b12] text-white flex flex-col gap-8 shadow-2xl border border-white/[0.08]">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            Simple 3-Step Workflow
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            How to Generate Studio Speech &amp; Voice Clones
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Create professional-grade voiceovers in less than 30 seconds with no complex software installation required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h4 className="font-bold text-sm text-white">Enter or Paste Your Text</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Type or paste your script into our intelligent text editor. Supports short video hooks or long audiobooks up to 50,000 characters.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h4 className="font-bold text-sm text-white">Pick a Voice or Clone Yours</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose from 320+ natural neural voices across 140+ languages, or record 15-30 seconds of your own voice in our Voice Cloning tab.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
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
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Why TTSNexs is the Top Choice for Voice Synthesis
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Compare our platform features against standard text-to-speech tools
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] studio-card">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/[0.08] text-slate-300 font-bold">
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-orange-400 bg-orange-500/10">TTSNexs Voice AI</th>
                <th className="p-4 sm:p-5 text-slate-500">Typical Online TTS Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] text-slate-300">
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Character Limit Per Script</td>
                <td className="p-4 sm:p-5 font-bold text-orange-400 bg-orange-500/5">Up to 50,000 Chars</td>
                <td className="p-4 sm:p-5 text-slate-500">1,000 – 3,000 Chars only</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Neural Voices Variety</td>
                <td className="p-4 sm:p-5 font-bold text-orange-400 bg-orange-500/5">320+ Voices across 140+ Locales</td>
                <td className="p-4 sm:p-5 text-slate-500">Limited (10 – 30 basic voices)</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Instant Voice Cloning</td>
                <td className="p-4 sm:p-5 font-bold text-orange-400 bg-orange-500/5">Included (15-30s reference)</td>
                <td className="p-4 sm:p-5 text-slate-500">Paid Add-on ($20+/mo) or Unavailable</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Audio Fidelity</td>
                <td className="p-4 sm:p-5 font-bold text-orange-400 bg-orange-500/5">Studio 48kHz HD Audio</td>
                <td className="p-4 sm:p-5 text-slate-500">22kHz Compressed / Robotic</td>
              </tr>
              <tr>
                <td className="p-4 sm:p-5 font-semibold text-white">Free Access Tier</td>
                <td className="p-4 sm:p-5 font-bold text-emerald-400 bg-emerald-500/10">Yes (30,000 Credits / Mo)</td>
                <td className="p-4 sm:p-5 text-slate-500">Strict paywall after 3 runs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 5: FAQs (SEO Rich Snippets Target) */}
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="text-center">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
            Got Questions?
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Frequently Asked Questions
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Everything you need to know about our AI voice over generator and voice cloning technology.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_LIST.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-white/[0.08] studio-card transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-white hover:text-orange-400 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-orange-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-white/[0.08] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 6: Footer Branding CTA */}
      <div className="p-8 rounded-3xl studio-card text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#0b0c14] p-2 shadow-md flex items-center justify-center border border-orange-500/30">
          <img src="/logo.png" alt="TTSNexs Official Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">
            TTSNexs - Next-Generation AI Voice Studio
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Empowering creators and developers with studio-grade neural speech, instant voice cloning, and accessible high-capacity synthesis.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/voice-cloning"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md"
          >
            <Dna className="w-4 h-4" />
            <span>Try Voice Cloning</span>
          </Link>
          <Link
            href="/about"
            className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
          >
            About &amp; Creator
          </Link>
        </div>
      </div>
    </section>
  );
}
