'use client';

import React from 'react';
import { Check, Sparkles, Zap, Shield, PhoneCall, ExternalLink, HelpCircle, Clock, Calendar } from 'lucide-react';

export function PricingPage() {
  const plans = [
    {
      id: 'free',
      name: 'Free Starter',
      badge: 'Monthly Free Plan',
      price: 'Rs. 0',
      period: '/ month (30 Days)',
      credits: '30,000 Credits / Month',
      description: 'Automatically credited to every verified Gmail account on a monthly cycle.',
      features: [
        '30,000 Free Credits / Month',
        '1 Character = 1 Credit',
        '30 Days validity cycle',
        'Up to 50,000 characters per single voice generation',
        'Access to all 322+ Neural Voices',
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
      period: '/ month (30 Days)',
      credits: '1,000,000 Credits / Month',
      description: 'Ideal for short video creators, TikTokers, and presentation voiceovers.',
      features: [
        '1,000,000 (1M) Credits / Month',
        '1 Character = 1 Credit',
        'Full 30 Days monthly validity',
        '~1.5 to 2 hours of continuous audio',
        'Up to 50,000 characters per script',
        'Commercial YouTube monetization rights',
        'Instant EasyPaisa / JazzCash activation',
      ],
      cta: 'Get 1M for Rs. 300 / mo',
      popular: false,
      buttonVariant: 'secondary',
    },
    {
      id: '3m',
      name: 'Creator Pack (3M)',
      badge: 'Most Popular',
      price: 'Rs. 900',
      period: '/ month (30 Days)',
      credits: '3,000,000 Credits / Month',
      description: 'The sweet spot for active YouTubers, faceless channels, and podcasters.',
      features: [
        '3,000,000 (3M) Credits / Month',
        '1 Character = 1 Credit',
        'Full 30 Days monthly validity',
        '~5 to 6 hours of high-definition speech',
        'Batch Engine enabled for long scripts',
        'Priority generation queue',
        'Commercial monetization rights',
      ],
      cta: 'Get 3M for Rs. 900 / mo',
      popular: true,
      buttonVariant: 'primary',
    },
    {
      id: '10m',
      name: 'Pro Studio (10M)',
      badge: 'Best Value',
      price: 'Rs. 2,500',
      period: '/ month (30 Days)',
      credits: '10,000,000 Credits / Month',
      description: 'Designed for audiobook publishers, course creators, and video production teams.',
      features: [
        '10,000,000 (10M) Credits / Month',
        '1 Character = 1 Credit',
        'Full 30 Days monthly validity',
        '~16 to 20 hours of continuous speech',
        'Audiobook Batch Engine with continuous stitching',
        'VIP WhatsApp support from Waqas Gill',
        'Commercial rights for unlimited projects',
      ],
      cta: 'Get 10M for Rs. 2,500 / mo',
      popular: false,
      buttonVariant: 'dark',
    },
    {
      id: 'unlimited',
      name: 'Unlimited VIP Monthly',
      badge: 'VIP Monthly Access',
      price: 'Rs. 4,000',
      period: '/ month (30 Days)',
      credits: 'Unlimited for 1 Month',
      description: 'Zero restrictions for 30 full days. Generate as many audios and clones as you need.',
      features: [
        'Unlimited Voice Generations for 1 Month (30 Days)',
        'Unlimited character voice synthesis',
        'Up to 50,000 characters per single script',
        'All 322+ voices across 140+ languages',
        'Full Voice Cloning & Studio access',
        'Direct 1-on-1 priority VIP support',
        'Renew or extend anytime',
      ],
      cta: 'Get Unlimited for Rs. 4,000 / mo',
      popular: true,
      buttonVariant: 'vip',
    },
  ];

  const handleBuyClick = (planName: string, price: string) => {
    const text = encodeURIComponent(
      `Hello! I want to activate/renew the monthly ${planName} (${price}) for my account on "TTSNexs". Please share payment details.`
    );
    window.open(`https://wa.me/923180429188?text=${text}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 pb-16">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-xs">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          <span>Transparent Monthly PKR Plans</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Flexible 30-Day Monthly Subscriptions
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          <strong>1 Character = 1 Credit.</strong> All plans are valid for a full <strong>30-day monthly cycle</strong>. You will receive an alert 3 days prior to expiration so you can recharge seamlessly.
        </p>
      </div>

      {/* Payment Methods Notice Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-500/20">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 justify-center md:justify-start">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Monthly EasyPaisa &amp; JazzCash Activation</span>
          </span>
          <h3 className="text-xl font-bold">
            Easy Activation via EasyPaisa, JazzCash, or Bank Transfer
          </h3>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Send payment, share the transaction screenshot on WhatsApp, and your monthly plan will be activated within 5 minutes with a fresh 30-day validity!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://wa.me/923180429188?text=Hello!%20I%20want%20to%20activate%20a%20plan%20for%20TTSNexs.%20Please%20guide%20me."
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 text-slate-950" />
            <span>Chat on WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-950/70" />
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
                  ? 'bg-gradient-to-b from-indigo-950 via-slate-900 to-black text-white border-2 border-amber-500/70 shadow-2xl shadow-indigo-500/20'
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
                      ? 'bg-amber-400/15 text-amber-300 border border-amber-500/30'
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
            Frequently Asked Questions about Monthly Plans &amp; Expiration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Are plans monthly or lifetime?
            </h4>
            <p>
              All plans on EmpireNexs operate on a <strong>30-day monthly validity cycle</strong>. Each plan gives you high-capacity credits valid for 30 full days from activation.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              Will I be notified before my monthly plan expires?
            </h4>
            <p>
              Yes! Exactly <strong>3 days prior to expiration</strong>, you will see an <em>&ldquo;Expiring Soon&rdquo;</em> reminder badge in your studio header with the exact days remaining, allowing you to renew without losing continuous generation access.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              What happens when my plan expires after 1 month?
            </h4>
            <p>
              When your 30-day period concludes, your plan expires. You can renew your subscription anytime to immediately unlock a fresh 30-day monthly cycle with full credits.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-900 text-sm">
              How do I pay and renew in Pakistan?
            </h4>
            <p>
              You can transfer payment via EasyPaisa, JazzCash, or any Pakistani Bank Transfer. Send the screenshot to Waqas Gill on Facebook or WhatsApp for instant renewal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
