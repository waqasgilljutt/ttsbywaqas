'use client';

import React from 'react';
import { History, Play, Download, Trash2, Clock, Volume2 } from 'lucide-react';

export interface HistoryItem {
  id: string;
  text: string;
  voiceName: string;
  audioUrl: string;
  timestamp: number;
  rate: number;
  pitch: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export function HistoryPanel({
  history,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearHistory,
}: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-center text-slate-400 text-xs">
        No recent generations yet. Synthesized audio clips will appear here.
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Generations ({history.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* History Items List */}
      <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelectHistory(item)}
            >
              <p className="text-xs text-slate-900 truncate font-semibold group-hover:text-brand-600 transition-colors">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-brand-700 font-mono font-semibold">
                  <Volume2 className="w-3 h-3" />
                  {item.voiceName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {formatTimestamp(item.timestamp)}
                </span>
                {item.rate !== 0 && (
                  <>
                    <span>•</span>
                    <span>Rate: {item.rate > 0 ? `+${item.rate}` : item.rate}%</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                title="Play in studio player"
                onClick={() => onSelectHistory(item)}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-brand-600 hover:text-white text-slate-600 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
              </button>

              <a
                href={item.audioUrl}
                download={`tts-by-waqas-gill-${item.voiceName}-${item.timestamp}.mp3`}
                title="Download MP3"
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                title="Remove"
                onClick={() => onDeleteHistoryItem(item.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
