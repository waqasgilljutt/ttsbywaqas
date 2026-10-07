'use client';

import React, { useState } from 'react';
import {
  Terminal,
  Zap,
  CheckCircle2,
  MessageCircle,
  Mail,
} from 'lucide-react';

export function ApiAccessPage() {
  const [customQuotaInput, setCustomQuotaInput] = useState('5');

  const tiers = [
    {
      name: 'Starter Developer',
      quota: '1 Million Characters',
      desc: 'Ideal for indie developers, bots, small websites, and prototype apps.',
      features: [
        '1,000,000 Characters / Month',
        'All 320+ Neural Voices & Locales',
        'Instant REST API Endpoint',
        'Direct MP3 Audio Stream Export',
        'Standard 30-day Validity Cycle',
      ],
      whatsappMsg:
        'Hello TTSNexs Team! I want to order a Starter Developer API Key (1 Million Characters/Month). Please share pricing and payment details.',
    },
    {
      name: 'Pro Creator & App',
      quota: '5 Million Characters',
      popular: true,
      desc: 'Perfect for content automation channels, SaaS platforms, and mobile apps.',
      features: [
        '5,000,000 Characters / Month',
        'All 320+ Neural Voices & Instant Cloner',
        'High Concurrency Rate Limits',
        'Base64 JSON or MP3 Binary Output',
        'Priority Technical Support',
      ],
      whatsappMsg:
        'Hello TTSNexs Team! I want to order a Pro Developer API Key (5 Million Characters/Month). Please share pricing and payment details.',
    },
    {
      name: 'Enterprise Scale',
      quota: '10 Million Characters',
      desc: 'Designed for high-traffic platforms, automated dubbing, and enterprise pipelines.',
      features: [
        '10,000,000 Characters / Month',
        'Dedicated High-Bandwidth Throughput',
        'Full Voice Cloning API Endpoints',
        'Custom Webhook Integration Option',
        'VIP Direct WhatsApp Assistance',
      ],
      whatsappMsg:
        'Hello TTSNexs Team! I want to order an Enterprise Scale API Key (10 Million Characters/Month). Please share pricing and payment details.',
    },
    {
      name: 'Custom Order Quota',
      quota: 'Tailored (20M - 100M+)',
      custom: true,
      desc: 'Need 25M, 50M, or unlimited volume? We create bespoke plans tailored to your needs.',
      features: [
        'Custom Character Quota as needed',
        'Custom Billing & Multi-Month Validity',
        'Dedicated SLA & Maximum Concurrency',
        'White-Label Endpoints Consultation',
        '1-on-1 Architecture Support',
      ],
      whatsappMsg: `Hello TTSNexs Team! I want to order a Custom API Key with ${customQuotaInput} Million Characters/Month. Please provide a custom quote.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <div className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide uppercase">
          <Terminal className="w-3.5 h-3.5 text-orange-400" />
          <span>Developer REST API v1</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Enterprise Neural TTS &amp; Voice API
        </h1>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
          Integrate <strong className="text-white">320+ ultra-realistic neural AI voices</strong> and instant voice cloning directly into your applications, bots, video pipelines, and customer workflows with sub-second latency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <a
            href="https://wa.me/923180429188?text=Hello%20TTSNexs%20Team!%20I%20want%20to%20inquire%20about%20ordering%20a%20Developer%20API%20Key."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-slate-950" />
            <span>Order Custom API Key on WhatsApp</span>
          </a>

          <a
            href="mailto:muhammadwaqasmwg@gmail.com?subject=TTSNexs%20Developer%20API%20Inquiry"
            className="px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Email Inquiry</span>
          </a>
        </div>
      </div>

      {/* Quota & Pricing Tiers */}
      <div className="flex flex-col gap-6">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Developer Character Quota Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Choose a monthly capacity package or request a custom order for your software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-3xl studio-card flex flex-col justify-between gap-6 transition-all ${
                t.popular
                  ? 'border-2 border-orange-500/80 shadow-2xl shadow-orange-500/20 ring-1 ring-orange-500/30'
                  : 'hover:border-white/20'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-white">{t.name}</h4>
                  {t.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold uppercase tracking-wide shadow-md">
                      Popular
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xl font-black text-white font-mono">{t.quota}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.desc}</p>
                </div>

                {t.custom && (
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Specify Required Characters:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={customQuotaInput}
                        onChange={(e) => setCustomQuotaInput(e.target.value)}
                        className="w-20 px-2.5 py-1 text-xs font-bold rounded-lg border border-white/20 bg-[#07080e] text-white"
                      />
                      <span className="text-xs font-bold text-orange-400">Million Chars</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/[0.08] pt-4 flex flex-col gap-2.5">
                  {t.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={`https://wa.me/923180429188?text=${encodeURIComponent(
                  t.custom
                    ? `Hello TTSNexs Team! I want to order a Custom API Key with ${customQuotaInput} Million Characters/Month. Please share custom pricing.`
                    : t.whatsappMsg
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-center transition-all cursor-pointer ${
                  t.popular
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:scale-[1.02]'
                    : 'bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/10'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Order Callout Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-orange-950/40 via-amber-950/30 to-black text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-orange-500/30">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Custom Provisioning</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Need a Specific Character Quota for your Company?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tell us how many million characters your software requires. We generate and deliver your dedicated API key with instant activation in under 5 minutes!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="https://wa.me/923180429188?text=Hello%20TTSNexs%20Team!%20I%20want%20to%20order%20a%20Custom%20Developer%20API%20Key%20for%20my%20software.%20Please%20guide%20me."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-slate-950" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href="mailto:muhammadwaqasmwg@gmail.com?subject=TTSNexs%20Custom%20API%20Order"
            className="px-6 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            <span>Email Inquiry</span>
          </a>
        </div>
      </div>
    </div>
  );
}
