'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic2,
  Dna,
  CreditCard,
  Building2,
  ChevronRight,
  ShieldCheck,
  FolderHeart,
  Terminal,
} from 'lucide-react';

export type TabType = 'text-to-voice' | 'voice-cloning' | 'voice-library' | 'pricing' | 'about' | 'api-access' | 'admin';

interface SidebarProps {
  activeTab?: TabType;
  onSelectTab?: (tab: TabType) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  currentUser?: { name: string; email: string } | null;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname();
  const isOwner = currentUser?.email?.toLowerCase() === 'muhammadwaqasmwg@gmail.com';

  const navItems = [
    {
      id: 'text-to-voice' as TabType,
      href: '/',
      label: 'Text to Voice',
      description: '320+ Neural Voices & 50k Chars',
      icon: Mic2,
      badge: 'Core',
    },
    {
      id: 'voice-cloning' as TabType,
      href: '/voice-cloning',
      label: 'Voice Cloning',
      description: 'Zero-Shot Mic & Audio Cloner',
      icon: Dna,
      badge: 'AI Studio',
    },
    {
      id: 'voice-library' as TabType,
      href: '/voice-library',
      label: 'Voice Library',
      description: 'Saved Custom Voice Profiles',
      icon: FolderHeart,
      badge: 'Library',
    },
    {
      id: 'pricing' as TabType,
      href: '/pricing',
      label: 'Pricing Plans',
      description: 'Free, Pro & Enterprise',
      icon: CreditCard,
      badge: 'Demo',
    },
    {
      id: 'about' as TabType,
      href: '/about',
      label: 'About TTSNexs',
      description: 'Story & Creator',
      icon: Building2,
      badge: 'About',
    },
    {
      id: 'api-access' as TabType,
      href: '/api-access',
      label: 'Get API Access',
      description: 'Custom Quota & Developer Key',
      icon: Terminal,
      badge: '⚡ API',
    },
  ];

  // OWNER-ONLY TAB: Invisible to regular users
  if (isOwner) {
    navItems.push({
      id: 'admin' as TabType,
      href: '/admin',
      label: 'Owner Command',
      description: 'Registered Users & Analytics',
      icon: ShieldCheck,
      badge: '👑 Owner',
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-80 bg-[#0b0c14]/95 backdrop-blur-2xl border-r border-white/[0.08] p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-2 shadow-lg shadow-orange-500/25 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center border border-orange-400/30">
              <img src="/logo.png" alt="TTSNexs Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-white tracking-tight group-hover:text-orange-400 transition-colors">
                  TTSNexs
                </h1>
                <span className="px-1.5 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-extrabold text-[10px] border border-orange-500/30">
                  AI
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400"></span>
                Neural Voice Studio
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-3 pb-1">
              Studio Navigation
            </span>
            {navItems.map((item) => {
              const isActive = activeTab
                ? activeTab === item.id
                : item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    if (onSelectTab) onSelectTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-400 border border-orange-500/30 shadow-sm shadow-orange-500/10 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30'
                          : 'bg-white/[0.06] text-slate-400 group-hover:bg-white/[0.12] group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold tracking-tight leading-snug ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {item.label}
                        </p>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : 'bg-white/[0.06] text-slate-400 border border-white/[0.08]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium leading-normal mt-0.5 ${isActive ? 'text-orange-300/80' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform ${
                      isActive ? 'text-orange-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="flex flex-col gap-3 pt-4 border-t border-white/[0.08]">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Free Studio License</span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Generations up to 50,000 characters per voice script.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>v2.5 High-Capacity</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400" />
              <span className="text-white font-bold">Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
