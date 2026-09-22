'use client';

import React from 'react';
import { Menu, Radio, Sparkles, User as UserIcon, LogOut } from 'lucide-react';
import { TabType } from './Sidebar';

interface TopNavbarProps {
  activeTab: TabType;
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
}

export function TopNavbar({
  activeTab,
  onOpenMobileSidebar,
  onOpenAuthModal,
  currentUser,
  onLogout,
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
    'pricing': {
      title: 'Pricing & Plans',
      subtitle: 'Transparent plans for creators, developers, and businesses',
    },
    'about': {
      title: 'About EmpireNexs',
      subtitle: 'Our technology, mission, and the story of Waqas Gill',
    },
  };

  const currentInfo = titles[activeTab] || titles['text-to-voice'];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile menu toggle + Dynamic Section Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block">
            {activeTab === 'about' ? (
              <>
                Our technology, mission, and the story of{' '}
                <a
                  href="https://www.facebook.com/mwaqasgillcs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline font-medium"
                  title="Connect with Waqas Gill on Facebook"
                >
                  Waqas Gill
                </a>
              </>
            ) : (
              currentInfo.subtitle
            )}
          </p>
        </div>
      </div>

      {/* Right: Engine status and Auth Profile/Button */}
      <div className="flex items-center gap-3">
        {/* Active Engine Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200/90 text-xs text-slate-600 font-medium">
          <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Engine:</span>
          <span className="text-slate-900 font-semibold">EmpireNexs Neural</span>
        </div>

        {/* User Account / Sign In */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
              <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">
                {currentUser.name[0].toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{currentUser.name}</span>
            </div>

            <button
              type="button"
              title="Sign Out"
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-sm shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
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
