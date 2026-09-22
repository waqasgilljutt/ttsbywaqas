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
    text: "In this walkthrough, we will learn how to connect Next.js 15 with Microsoft Edge Text to Speech API to generate lifelike natural speech in real-time.",
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
    text: "السلام علیکم! ایج ٹیکسٹ ٹو اسپیچ میں خوش آمدید۔ آپ کا دن اچھا گزرے۔",
  },
];

export function TextEditor({ text, onChangeText, disabled }: TextEditorProps) {
  const charCount = text.length;
  const maxWords = 50000;
  const maxChars = 300000;
  const wordsArray = text.trim() ? text.trim().split(/\s+/) : [];
  const wordCount = wordsArray.length;
  // Average speaking rate: ~150 words per minute
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
          <Type className="w-4 h-4 text-brand-400" />
          <label className="text-sm font-semibold text-studio-200">
            Script / Text to Synthesize
          </label>
        </div>

        {/* Clear Button */}
        {text.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeText('')}
            disabled={disabled}
            className="text-xs text-studio-400 hover:text-rose-400 flex items-center gap-1 transition-colors self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Preset Templates */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-studio-500 flex items-center gap-1 text-[11px] shrink-0">
          <Sparkles className="w-3 h-3 text-brand-400" /> Presets:
        </span>
        {TEMPLATES.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={disabled}
            onClick={() => onChangeText(item.text)}
            className="px-2.5 py-1 rounded-lg bg-studio-900/80 border border-studio-800 text-studio-300 hover:text-white hover:border-brand-500/50 hover:bg-studio-800 transition-all whitespace-nowrap text-[11px]"
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
          onChange={(e) => onChangeText(e.target.value.slice(0, maxChars))}
          placeholder="Enter or paste the text you want the voice to read aloud..."
          className="w-full bg-studio-900/60 border border-studio-800 rounded-2xl p-4 text-slate-100 placeholder-studio-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all resize-y text-base leading-relaxed"
        />

        {/* Floating Stats */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-studio-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-400" />
              <strong className="text-slate-200">{wordCount.toLocaleString()}</strong> / {maxWords.toLocaleString()} words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-studio-500" />
              {formatSpeechTime(totalSeconds)}
            </span>
          </div>

          <div
            className={`font-mono text-[11px] ${
              wordCount > maxWords ? 'text-rose-400 font-semibold' : 'text-studio-500'
            }`}
          >
            {charCount.toLocaleString()} chars
          </div>
        </div>
      </div>
    </div>
  );
}
