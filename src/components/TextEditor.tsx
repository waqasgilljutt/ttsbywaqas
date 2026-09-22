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
          <Type className="w-4 h-4 text-brand-600" />
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Script / Text to Synthesize
          </label>
        </div>

        {text.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeText('')}
            disabled={disabled}
            className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors font-medium self-end sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Preset Templates */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] shrink-0 font-medium">
          <Sparkles className="w-3 h-3 text-brand-600" /> Presets:
        </span>
        {TEMPLATES.map((item) => (
          <button
            key={item.name}
            type="button"
            disabled={disabled}
            onClick={() => onChangeText(item.text)}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200/80 text-slate-700 transition-all whitespace-nowrap text-xs font-medium"
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
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all resize-y text-sm leading-relaxed"
        />

        {/* Floating Stats */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-600" />
              <strong className="text-slate-900 font-bold">{wordCount.toLocaleString()}</strong> words
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formatSpeechTime(totalSeconds)}
            </span>
          </div>

          <div
            className={`font-mono text-xs font-semibold ${
              charCount > maxChars ? 'text-rose-600 font-bold' : 'text-slate-600'
            }`}
          >
            <span className={charCount > maxChars ? 'text-rose-600' : 'text-brand-700 font-bold'}>
              {charCount.toLocaleString()}
            </span>{' '}
            / {maxChars.toLocaleString()} characters (1 char = 1 credit)
          </div>
        </div>

        {charCount > maxChars && (
          <div className="mt-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2 animate-in fade-in font-medium">
            <span>
              <strong>Limit Exceeded:</strong> Maximum allowed per voice generation is 50,000 characters. Please trim your script.
            </span>
          </div>
        )}

        {charCount > 3000 && charCount <= maxChars && (
          <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Long-Form Batch Engine Active:</strong> Your {charCount.toLocaleString()} character script will be synthesized seamlessly across chapters into one continuous MP3 with zero timeouts.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
              50,000 Max Ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
