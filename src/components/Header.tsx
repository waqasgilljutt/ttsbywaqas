'use client';

import React from 'react';
import { Mic2, Sparkles, Volume2, Radio } from 'lucide-react';

interface HeaderProps {
  totalVoices: number;
  selectedVoiceName?: string;
}

export function Header({ totalVoices, selectedVoiceName }: HeaderProps) {
  return (
    <header className="border-b border-studio-800/80 bg-studio-950/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-[1px] shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-studio-950 rounded-[11px] flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                TTS <span className="bg-gradient-to-r from-brand-400 to-indigo-300 bg-clip-text text-transparent">bY Waqas Gill</span>
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 rounded-full">
                Studio
              </span>
            </div>
            <p className="text-xs text-studio-400 hidden sm:block">
              Professional Text-to-Speech Platform by Waqas Gill
            </p>
          </div>
        </div>

        {/* Live Status and Stats */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-900/60 border border-studio-800 text-xs text-studio-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Active Engine:</span>
            <span className="text-slate-100 font-medium">Edge Neural AI</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-studio-900/60 border border-studio-800 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-studio-300">Voices:</span>
            <span className="text-white font-semibold">{totalVoices > 0 ? totalVoices : '320+'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
