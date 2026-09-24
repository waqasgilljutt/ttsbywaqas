'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Mic2,
  Dna,
  CreditCard,
  Building2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  FolderHeart,
} from 'lucide-react';

export type TabType = 'text-to-voice' | 'voice-cloning' | 'voice-library' | 'pricing' | 'about' | 'admin';

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
      description: 'Saved custom voice profiles',
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
      label: 'About EmpireNexs',
      description: 'Vision & Waqas Gill story',
      icon: Building2,
      badge: 'Company',
    },
  ];

  // OWNER-ONLY TAB: Invisible to regular users
  if (isOwner) {
    navItems.push({
      id: 'admin' as TabType,
      href: '/admin',
      label: 'Owner Command',
      description: 'Registered users & stats',
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
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex flex-col gap-6">
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 p-[1px] shadow-md shadow-brand-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[15px] flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-brand-600" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">
                  TTS bY Waqas Gill
                </h1>
              </div>
              <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wider mt-0.5">
                EmpireNexs AI
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
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
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isActive
                      ? 'bg-brand-50/80 text-brand-700 border border-brand-200 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs truncate">{item.label}</p>
                      <p className="text-[10px] text-slate-400 truncate font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? 'bg-brand-100 text-brand-700 font-bold'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-brand-600 translate-x-0.5' : 'text-slate-300'
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-200/80">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Free Studio License</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Generations up to 50,000 characters per voice.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>v2.5 High-Capacity</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-600 font-medium">Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
