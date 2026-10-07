'use client';

import React from 'react';
import { Menu, Radio, Sparkles, User as UserIcon, LogOut, Zap, Clock, AlertTriangle } from 'lucide-react';
import { TabType } from './Sidebar';
import { UserCredits } from '@/context/AppContext';

interface TopNavbarProps {
  activeTab: TabType;
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
  userCredits?: UserCredits | null;
  onOpenPricing?: () => void;
}

export function TopNavbar({
  activeTab,
  onOpenMobileSidebar,
  onOpenAuthModal,
  currentUser,
  onLogout,
  userCredits,
  onOpenPricing,
}: TopNavbarProps) {
  const titles: Record<TabType, { title: string; subtitle: string }> = {
    'text-to-voice': {
      title: 'Text to Voice Studio',
      subtitle: 'Synthesize speech with 320+ natural neural voices',
    },
    'voice-cloning': {
      title: 'Instant Voice Cloner',
      subtitle: 'Record or upload audio to synthesize in your cloned voice',
    },
    'voice-library': {
      title: 'Voice Clones Library',
      subtitle: 'Manage, preview, and activate your saved cloned voice models',
    },
    'pricing': {
      title: 'Pricing & Plans',
      subtitle: 'Transparent plans for creators, developers, and businesses',
    },
    'about': {
      title: 'About TTSNexs',
      subtitle: 'Next-generation neural AI voice synthesis studio',
    },
    'api-access': {
      title: 'Developer REST API',
      subtitle: 'Integrate neural speech & voice cloning into your software with custom quota',
    },
    'admin': {
      title: 'Owner Command Center',
      subtitle: 'Registered users, activity stats, and platform management',
    },
  };

  const currentInfo = titles[activeTab] || titles['text-to-voice'];
  const isOwner = currentUser?.email?.toLowerCase() === 'muhammadwaqasmwg@gmail.com';

  return (
    <header className="sticky top-0 z-30 bg-[#0b0c14]/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Dynamic Section Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.06] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 p-1 flex items-center justify-center border border-orange-400/30 lg:hidden shrink-0 shadow-md shadow-orange-500/20">
          <img src="/logo.png" alt="TTSNexs" className="w-full h-full object-contain" />
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
            {currentInfo.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 hidden sm:block mt-0.5 font-medium">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Engine status and Auth Profile/Button */}
      <div className="flex items-center gap-3">
        {/* Active Engine Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 font-medium shadow-xs">
          <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="TTSNexs" className="w-full h-full object-contain" />
          </div>
          <span className="text-slate-400">Engine:</span>
          <span className="text-orange-400 font-bold">TTSNexs Neural</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5 shadow-xs shadow-emerald-400"></span>
        </div>

        {/* User Account / Sign In */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2">
            {/* Live Credits / Expiration Badge */}
            <button
              type="button"
              onClick={onOpenPricing}
              title={
                userCredits?.isExpired
                  ? 'Your monthly plan has expired. Click to renew.'
                  : userCredits?.isExpiringSoon
                  ? `Your plan expires in ${userCredits.daysRemaining} days. Click to recharge.`
                  : 'Click to view plans and recharge credits'
              }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 shadow-xs ${
                userCredits?.isExpired
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                  : userCredits?.isExpiringSoon
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-amber-500/10'
                  : isOwner || userCredits?.isUnlimited
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-orange-500/40 text-orange-300 shadow-orange-500/10'
                  : userCredits && userCredits.remainingCredits <= 2000
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {userCredits?.isExpired ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Plan Expired (Renew)</span>
                </>
              ) : userCredits?.isExpiringSoon ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>
                    Expiring in {userCredits.daysRemaining}d ({userCredits.isUnlimited ? 'VIP' : `${(userCredits.remainingCredits || 0).toLocaleString()} cr`})
                  </span>
                </>
              ) : (
                <>
                  <Zap
                    className={`w-3.5 h-3.5 ${
                      isOwner || userCredits?.isUnlimited
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-emerald-400'
                    }`}
                  />
                  <span>
                    {isOwner || userCredits?.isUnlimited
                      ? 'Unlimited VIP'
                      : `${(userCredits ? userCredits.remainingCredits : 30000).toLocaleString()} Credits`}
                  </span>
                </>
              )}
            </button>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                isOwner
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-white/[0.06] border-white/10 text-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${
                  isOwner ? 'bg-gradient-to-tr from-amber-500 to-orange-600' : 'bg-gradient-to-tr from-orange-500 to-amber-500'
                }`}
              >
                {currentUser.name[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
              {isOwner && (
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] font-extrabold">
                  OWNER
                </span>
              )}
            </div>

            <button
              type="button"
              title="Sign Out"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
