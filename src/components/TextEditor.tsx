'use client';

import React from 'react';
import { Type, Sparkles, Trash2, Clock, FileText } from 'lucide-react';

interface TextEditorProps {
  text: string;
  onChangeText: (val: string) => void;
  disabled?: boolean;
}

const TEMPLATES = [
  {
    name: 'YouTube Narration',
    text: "Welcome back to the channel! Today, we're diving deep into the next big breakthrough in artificial intelligence. Before we begin, make sure to hit that subscribe button!",
  },
  {
    name: 'Tech Tutorial',
    text: "In this walkthrough, we will learn how to connect Next.js 15 with TTSNexs Neural Text to Speech engine to generate lifelike natural speech in real-time.",
  },
  {
    name: 'News Announcement',
    text: "Good evening. Tonight's top story: Researchers have announced a groundbreaking milestone in synthetic speech synthesis, creating human-like intonations across hundreds of languages.",
  },
  {
    name: 'Storytelling',
    text: "The old library was quiet, save for the gentle hum of the rain tapping against the tall stained glass windows. Deep inside the archives, an ancient book began to glow with a faint violet light.",
  },
  {
    name: 'Customer Support',
    text: "Thank you for calling Customer Support. Your call is very important to us. To speak with a representative regarding your account, please press one now.",
  },
  {
    name: 'Urdu Greeting',
    text: "السلام علیکم! ٹی ٹی ایس نیکس اسٹوڈیو میں خوش آمدید۔ آپ کا دن اچھا گزرے۔",
  },
];

export function TextEditor({ text, onChangeText, disabled }: TextEditorProps) {
  const charCount = text.length;
  const maxChars = 50000;
  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = wordsArray.length;
  const totalSeconds = Math.max(1, Math.round((wordCount / 150) * 60));

  const formatSpeechTime = (sec: number) => {
    if (sec < 60) return `~${sec}s speech`;
    const mins = Math.floor(sec / 60);
    if (mins < 60) return `~${mins} min speech`;
    const hrs = (mins / 60).toFixed(1);
    return `~${hrs} hr speech`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header and Template Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-orange-400" />
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Script / Text to Synthesize
          </label>
        </div>

        {text.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeText('')}
            disabled={disabled}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors font-medium self-end sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Preset Templates */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-orange-400" /> Presets:
        </span>
        {TEMPLATES.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={disabled}
            onClick={() => onChangeText(item.text)}
            className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-orange-500/15 hover:text-orange-300 hover:border-orange-500/30 border border-white/[0.08] text-slate-300 transition-all whitespace-nowrap text-xs font-medium cursor-pointer"
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          rows={6}
          disabled={disabled}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Enter or paste the text you want the voice to read aloud (up to 50,000 characters)..."
          className="w-full bg-[#07080e]/70 border border-white/10 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:bg-[#0b0c14] focus:ring-1 focus:ring-orange-500/30 transition-all resize-y text-sm leading-relaxed"
        />

        {/* Floating Stats */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              <strong className="text-white font-bold">{wordCount.toLocaleString()}</strong> words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {formatSpeechTime(totalSeconds)}
            </span>
          </div>

          <div
            className={`font-mono text-xs font-semibold ${
              charCount > maxChars ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            <span className={charCount > maxChars ? 'text-rose-400' : 'text-orange-400 font-bold'}>
              {charCount.toLocaleString()}
            </span>{' '}
            / {maxChars.toLocaleString()} characters (1 char = 1 credit)
          </div>
        </div>

        {charCount > maxChars && (
          <div className="mt-2.5 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-in fade-in font-medium">
            <span>
              <strong>Limit Exceeded:</strong> Maximum allowed per voice generation is 50,000 characters. Please trim your script.
            </span>
          </div>
        )}

        {charCount > 3000 && charCount <= maxChars && (
          <div className="mt-2.5 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Long-Form Batch Engine Active:</strong> Your {charCount.toLocaleString()} character script will be synthesized seamlessly across chapters into one continuous MP3 with zero timeouts.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
              50,000 Max Ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
