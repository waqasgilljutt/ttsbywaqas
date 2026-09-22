'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, HelpCircle } from 'lucide-react';

export function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free Community',
      badge: 'Free Forever',
      price: '$0',
      period: 'lifetime free',
      description: 'Perfect for creators, students, and personal voiceover projects.',
      features: [
        '50,000 words per script',
        'Access to all 322+ Microsoft Neural Voices',
        'Standard MP3 audio download',
        'Instant Voice Cloning preview',
        'Speech rate, pitch, and volume tuning',
        'Community support',
      ],
      cta: 'Current Plan',
      popular: false,
      buttonVariant: 'outline',
    },
    {
      name: 'Pro Studio',
      badge: 'Most Popular',
      price: isYearly ? '$15' : '$19',
      period: 'per month',
      description: 'For YouTube creators, podcasters, marketers, and video editors.',
      features: [
        'Unlimited words & script generations',
        '322+ Ultra-HD Studio Voices (Lossless WAV & MP3 128kbps)',
        'Unlimited Instant Voice Cloning profiles',
        'Zero-latency generation queue',
        'Commercial monetization rights',
        'Saved voice history & cloud backup',
        'Priority technical support',
      ],
      cta: 'Get Started with Pro',
      popular: true,
      buttonVariant: 'primary',
    },
    {
      name: 'EmpireNexs Enterprise',
      badge: 'Custom AI',
      price: isYearly ? '$69' : '$89',
      period: 'per month',
      description: 'Full custom speech infrastructure for software companies and agencies.',
      features: [
        'Everything in Pro Studio',
        'Custom voice model training & fine-tuning',
        'Dedicated Developer REST API & Webhooks',
        'High-throughput parallel audio generation',
        '99.9% uptime SLA guarantee',
        'Direct 1-on-1 support from Waqas Gill & EmpireNexs engineering team',
      ],
      cta: 'Contact EmpireNexs',
      popular: false,
      buttonVariant: 'dark',
    },
  ];

  const faqs = [
    {
      q: 'Is the core Text-to-Speech really 100% free?',
      a: 'Yes! The Free Community tier allows up to 50,000 words per script across 322+ voices with zero subscription costs.',
    },
    {
      q: 'Can I use generated voices for YouTube monetization?',
      a: 'Yes! All audio synthesized on this platform can be used for YouTube videos, podcasts, and social media content.',
    },
    {
      q: 'How does the Voice Cloner work?',
      a: 'You simply record 5 to 15 seconds of clean speech or upload an audio file. Our neural model extracts the vocal pitch, timbre, and accent to reproduce speech in that voice.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-16">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EmpireNexs Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          Choose the right plan for your audio production needs. Start free today with no credit card required.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="mt-4 flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsYearly(false)}
            className={`px-4 py-2 rounded-xl transition-all ${
              !isYearly
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setIsYearly(true)}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              isYearly
                ? 'bg-white text-brand-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-white border-2 border-brand-600 shadow-xl shadow-brand-500/10 scale-100 md:scale-[1.03]'
                : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-bold text-[11px] shadow-sm uppercase tracking-wider">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                {!plan.popular && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {plan.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 min-h-[36px] mb-6">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-slate-900">
                  {plan.price}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  / {plan.period}
                </span>
              </div>

              {/* Feature list */}
              <div className="flex flex-col gap-3 mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  What&apos;s Included:
                </span>
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {feat.includes('Waqas Gill') ? (
                        <>
                          Direct 1-on-1 support from{' '}
                          <a
                            href="https://www.facebook.com/mwaqasgillcs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:text-brand-700 hover:underline font-semibold"
                            title="Connect with Waqas Gill on Facebook"
                          >
                            Waqas Gill
                          </a>{' '}
                          &amp; EmpireNexs engineering team
                        </>
                      ) : (
                        feat
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all ${
                plan.buttonVariant === 'primary'
                  ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/25 hover:scale-[1.02]'
                  : plan.buttonVariant === 'dark'
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:scale-[1.02]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((f, i) => (
            <div key={i} className="flex flex-col gap-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <h4 className="text-xs font-bold text-slate-900">{f.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
