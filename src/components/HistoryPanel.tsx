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
      <div className="studio-card p-5 text-center text-slate-400 text-xs">
        No recent generations yet. Synthesized audio clips will appear here.
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="studio-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Recent Generations ({history.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
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
            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-orange-500/40 hover:bg-white/[0.05] transition-all flex items-center justify-between gap-3 group"
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelectHistory(item)}
            >
              <p className="text-xs text-white truncate font-semibold group-hover:text-orange-300 transition-colors">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-orange-400 font-mono font-semibold">
                  <Volume2 className="w-3 h-3" />
                  {item.voiceName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
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
                className="p-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 hover:text-white text-slate-300 transition-colors shadow-xs cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
              </button>

              <a
                href={item.audioUrl}
                download={`ttsnexs-${item.voiceName}-${item.timestamp}.mp3`}
                title="Download MP3"
                className="p-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/10 text-slate-300 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                title="Remove"
                onClick={() => onDeleteHistoryItem(item.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
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
