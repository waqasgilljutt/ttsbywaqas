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
      label: 'About EmpireNexs',
      description: 'Company & Waqas Gill',
      icon: Building2,
      badge: 'Company',
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
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-80 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col gap-6">
          {/* Brand Header */}
          <Link href="/" onClick={onCloseMobile} className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 p-2 shadow-md shadow-amber-500/20 shrink-0 group-hover:scale-105 transition-transform flex items-center justify-center border border-amber-500/30">
              <img src="/logo.png" alt="EmpireNexs Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-brand-600 transition-colors">
                  EmpireNexs
                </h1>
              </div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                TTS By Waqas Gill
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-3 pb-1">
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
                      ? 'bg-brand-50/90 text-brand-700 border border-brand-300/80 shadow-xs font-semibold'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold tracking-tight leading-snug ${isActive ? 'text-brand-900' : 'text-slate-900'}`}>
                          {item.label}
                        </p>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              isActive
                                ? 'bg-brand-200/80 text-brand-800'
                                : 'bg-slate-100 text-slate-600 border border-slate-200/70'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs font-medium leading-normal mt-0.5 ${isActive ? 'text-brand-700' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ml-2 transition-transform ${
                      isActive ? 'text-brand-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info Card */}
        <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Free Studio License</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Generations up to 50,000 characters per voice script.
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>v2.5 High-Capacity</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-800 font-bold">Ready</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
