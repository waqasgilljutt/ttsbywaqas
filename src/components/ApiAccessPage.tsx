'use client';

import React, { useState } from 'react';
import {
  Code2,
  Terminal,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';

export function ApiAccessPage() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'curl' | 'nodejs' | 'python'>('curl');
  const [customQuotaInput, setCustomQuotaInput] = useState('5');

  const curlCode = `curl -X POST "https://ttsnexs.online/api/tts" \\
  -H "x-api-key: nexs_live_your_api_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello world! This is studio grade neural speech powered by EmpireNexs.",
    "voice": "en-US-JennyNeural",
    "rate": "+0%",
    "pitch": "+0Hz"
  }' \\
  --output speech.mp3`;

  const nodeCode = `const response = await fetch("https://ttsnexs.online/api/tts", {
  method: "POST",
  headers: {
    "x-api-key": "nexs_live_your_api_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "Hello world! This is studio grade neural speech.",
    voice: "en-US-JennyNeural",
    rate: "+0%",
  }),
});

const audioBuffer = await response.arrayBuffer();
// Save audioBuffer to speech.mp3`;

  const pythonCode = `import requests

url = "https://ttsnexs.online/api/tts"
headers = {
    "x-api-key": "nexs_live_your_api_key",
    "Content-Type": "application/json"
}
payload = {
    "text": "Hello world! This is studio grade neural speech.",
    "voice": "en-US-JennyNeural",
    "rate": "+0%"
}

response = requests.post(url, json=payload, headers=headers)
with open("speech.mp3", "wb") as f:
    f.write(response.content)`;

  const currentCode =
    selectedLanguage === 'curl' ? curlCode : selectedLanguage === 'nodejs' ? nodeCode : pythonCode;

  const copySnippet = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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
        'Hello EmpireNexs! I want to order a Starter Developer API Key (1 Million Characters/Month) for TTSNexs. Please share pricing and payment details.',
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
        'Hello EmpireNexs! I want to order a Pro Developer API Key (5 Million Characters/Month) for TTSNexs. Please share pricing and payment details.',
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
        'Hello EmpireNexs! I want to order an Enterprise Scale API Key (10 Million Characters/Month) for TTSNexs. Please share pricing and payment details.',
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
      whatsappMsg: `Hello EmpireNexs! I want to order a Custom API Key with ${customQuotaInput} Million Characters/Month for TTSNexs. Please provide a custom quote.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <div className="text-center flex flex-col items-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold tracking-wide uppercase">
          <Terminal className="w-3.5 h-3.5" />
          <span>Developer REST API v1</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Enterprise Neural TTS &amp; Voice API
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
          Integrate <strong>320+ ultra-realistic neural AI voices</strong> and instant voice cloning directly into your applications, bots, video pipelines, and customer workflows with sub-second latency.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
          <a
            href="https://wa.me/923180429188?text=Hello%20EmpireNexs!%20I%20want%20to%20inquire%20about%20ordering%20a%20Developer%20API%20Key%20for%20TTSNexs."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Order Custom API Key on WhatsApp</span>
          </a>

          <a
            href="mailto:muhammadwaqasmwg@gmail.com?subject=TTSNexs%20Developer%20API%20Inquiry"
            className="px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
          >
            <Mail className="w-4 h-4 text-slate-600" />
            <span>Email Inquiry</span>
          </a>
        </div>
      </div>

      {/* Code Showcase & Interactive Documentation */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Simple, Powerful REST Endpoints</h3>
              <p className="text-xs text-slate-400">Send text, receive studio-quality MP3 audio in milliseconds.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
              {(['curl', 'nodejs', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedLanguage === lang
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={copySnippet}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Copy Code"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedCode ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <pre className="p-4 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800/80 text-xs sm:text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
          <code>{currentCode}</code>
        </pre>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-medium">Protocol</span>
            <span className="text-xs font-bold text-slate-200 font-mono">HTTPS REST (POST)</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-medium">Authentication</span>
            <span className="text-xs font-bold text-slate-200 font-mono">x-api-key header</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-medium">Max Pass Length</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">50,000 Chars / Call</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80 flex flex-col gap-1">
            <span className="text-[11px] text-slate-400 font-medium">Audio Output</span>
            <span className="text-xs font-bold text-amber-400 font-mono">48kHz MP3 / Base64</span>
          </div>
        </div>
      </div>

      {/* Quota & Pricing Tiers */}
      <div className="flex flex-col gap-6">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Developer Character Quota Packages
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Choose a monthly capacity package or request a custom order for your software.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {tiers.map((t, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-7 rounded-3xl bg-white border flex flex-col justify-between gap-6 transition-all ${
                t.popular
                  ? 'border-brand-500 shadow-lg shadow-brand-500/10 ring-2 ring-brand-500/20'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-slate-900">{t.name}</h4>
                  {t.popular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold uppercase tracking-wide">
                      Popular
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-2xl font-black text-slate-900">{t.quota}</span>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
                </div>

                {t.custom && (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Specify Required Characters:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={customQuotaInput}
                        onChange={(e) => setCustomQuotaInput(e.target.value)}
                        className="w-20 px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                      <span className="text-xs font-bold text-slate-600">Million Chars</span>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4 flex flex-col gap-2.5">
                  {t.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href={`https://wa.me/923180429188?text=${encodeURIComponent(
                  t.custom
                    ? `Hello EmpireNexs! I want to order a Custom API Key with ${customQuotaInput} Million Characters/Month for TTSNexs. Please share custom pricing.`
                    : t.whatsappMsg
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 text-center transition-all shadow-xs ${
                  t.popular
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
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
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 to-slate-950 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-700/40">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold w-fit">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Custom Provisioning</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">
            Need a Specific Character Quota for your Company?
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Tell us how many million characters your software requires. We generate and deliver your dedicated API key with instant activation in under 5 minutes!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <a
            href="https://wa.me/923180429188?text=Hello%20Waqas%20Gill!%20I%20want%20to%20order%20a%20Custom%20Developer%20API%20Key%20for%20my%20software.%20Please%20guide%20me."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <a
            href="mailto:muhammadwaqasmwg@gmail.com?subject=TTSNexs%20Custom%20API%20Order"
            className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Email Founder</span>
          </a>
        </div>
      </div>
    </div>
  );
}
