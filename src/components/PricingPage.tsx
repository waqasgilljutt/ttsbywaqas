'use client';

import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, PhoneCall, ExternalLink, HelpCircle } from 'lucide-react';

export function PricingPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'popular'>('all');

  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: 'Free on Signup',
      price: 'Rs. 0',
      period: 'lifetime free',
      credits: '30,000 Credits',
      description: 'Automatically credited to every new Gmail account on registration.',
      features: [
        '30,000 Free Characters / Credits',
        '1 Character = 1 Credit',
        'Up to 50,000 characters per single voice generation',
        'Access to all 322+ Neural Voices',
        'Standard high-speed MP3 download',
        'Voice Cloning Studio preview',
      ],
      cta: 'Free on Signup',
      popular: false,
      buttonVariant: 'outline',
    },
    {
      id: '1m',
      name: 'Starter Pack (1M)',
      badge: 'Budget Friendly',
      price: 'Rs. 300',
      period: 'one-time payment',
      credits: '1,000,000 Credits',
      description: 'Ideal for short video creators, TikTokers, and presentation voiceovers.',
      features: [
        '1,000,000 (1M) Credits / Characters',
        '1 Character = 1 Credit',
        '~1.5 to 2 hours of continuous audio',
        'Up to 50,000 characters per script',
        'Full commercial YouTube monetization rights',
        'Instant EasyPaisa / JazzCash activation',
      ],
      cta: 'Buy 1M for Rs. 300',
      popular: false,
      buttonVariant: 'secondary',
    },
    {
      id: '3m',
      name: 'Creator Pack (3M)',
      badge: 'Most Popular',
      price: 'Rs. 900',
      period: 'one-time payment',
      credits: '3,000,000 Credits',
      description: 'The sweet spot for active YouTubers, faceless channels, and podcasters.',
      features: [
        '3,000,000 (3M) Credits / Characters',
        '1 Character = 1 Credit',
        '~5 to 6 hours of high-definition speech',
        'Batch Engine enabled for long scripts',
        'Priority generation queue',
        'Commercial monetization rights',
      ],
      cta: 'Buy 3M for Rs. 900',
      popular: true,
      buttonVariant: 'primary',
    },
    {
      id: '10m',
      name: 'Pro Studio (10M)',
      badge: 'Best Value',
      price: 'Rs. 2,500',
      period: 'one-time payment',
      credits: '10,000,000 Credits',
      description: 'Designed for audiobook publishers, course creators, and video production teams.',
      features: [
        '10,000,000 (10M) Credits / Characters',
        '1 Character = 1 Credit',
        '~16 to 20 hours of continuous speech',
        'Full Audiobook Batch Engine with continuous stitching',
        'VIP WhatsApp support from Waqas Gill',
        'Commercial rights for unlimited projects',
      ],
      cta: 'Buy 10M for Rs. 2,500',
      popular: false,
      buttonVariant: 'dark',
    },
    {
      id: 'unlimited',
      name: 'Unlimited VIP Lifetime',
      badge: 'VIP Lifetime',
      price: 'Rs. 4,000',
      period: 'lifetime unlimited',
      credits: 'Unlimited Forever',
      description: 'Zero restrictions. Never worry about running out of credits again.',
      features: [
        'Unlimited Credits Forever (Never Expire)',
        'Unlimited character voice synthesis',
        'Up to 50,000 characters per single script',
        'All 322+ voices across 80+ languages',
        'Full Voice Cloning & Studio access',
        'Direct 1-on-1 priority support from Waqas Gill',
      ],
      cta: 'Get Unlimited for Rs. 4,000',
      popular: true,
      buttonVariant: 'vip',
    },
  ];

  const handleBuyClick = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `Hello Waqas Gill! I want to activate the ${planName} (${price} PKR) for my TTS account on "TTS bY Waqas Gill". Please share payment details.`
    );
    window.open(`https://www.facebook.com/mwaqasgillcs/`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-16">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EmpireNexs Official Pricing</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Transparent PKR Credit Plans
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          <strong>1 Character = 1 Credit.</strong> Every new account starts with <strong>30,000 free credits</strong>. Recharge easily via EasyPaisa, JazzCash, or Bank Transfer.
        </p>
      </div>

      {/* Payment Methods Notice Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Instant Pakistani Payment Methods
          </span>
          <h3 className="text-xl font-bold">
            Pay with EasyPaisa, JazzCash, or Raast Bank Transfer
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Send payment to Waqas Gill, share the transaction screenshot on WhatsApp or Facebook, and your account credits will be activated immediately!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://www.facebook.com/mwaqasgillcs/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 flex items-center gap-2 transition-all hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 text-brand-600" />
            <span>Contact Waqas Gill</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan) => {
          const isVip = plan.id === 'unlimited';
          const isCreator = plan.id === '3m';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                isVip
                  ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-white border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20'
                  : isCreator
                  ? 'bg-white border-2 border-brand-600 shadow-xl shadow-brand-500/10'
                  : 'bg-white border border-slate-200/90 shadow-xs hover:border-slate-300'
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                    isVip
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                      : isCreator
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div>
                  <h3
                    className={`text-lg font-bold tracking-tight ${
                      isVip ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      isVip ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span
                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                      isVip ? 'text-amber-400 font-mono' : 'text-slate-900 font-mono'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      isVip ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {plan.period}
                  </span>
                </div>

                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    isVip
                      ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                      : 'bg-brand-50 text-brand-700 border border-brand-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{plan.credits}</span>
                </div>

                <ul className="flex flex-col gap-2.5 pt-2">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <Check
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isVip
                            ? 'text-amber-400'
                            : isCreator
                            ? 'text-brand-600'
                            : 'text-emerald-600'
                        }`}
                      />
                      <span className={isVip ? 'text-slate-300' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleBuyClick(plan.name, plan.price)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs ${
                    isVip
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20'
                      : isCreator
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <span>{plan.cta}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQs */}
      <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-brand-600" />
          <h3 className="text-base font-bold text-slate-900">
            Frequently Asked Questions about Credits
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              How does the 1 Character = 1 Credit formula work?
            </h4>
            <p>
              Whenever you generate speech or cloned voice, each character in your text uses 1 credit. For example, a 1,000 character script uses 1,000 credits.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              What happens when my 30,000 free credits run out?
            </h4>
            <p>
              Once your 30,000 credits are used, you can easily top up with any credit pack starting from just Rs. 300 PKR for 1,000,000 credits!
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              How do I pay in Pakistan?
            </h4>
            <p>
              You can transfer payment via EasyPaisa, JazzCash, or any Bank Transfer. Just contact Waqas Gill with the screenshot and your account will be recharged instantly.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Do purchased credits expire?
            </h4>
            <p>
              No, your credits never expire. You can use them whenever you need, at your own pace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
