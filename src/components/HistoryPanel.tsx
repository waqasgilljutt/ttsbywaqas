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
      <div className="p-4 rounded-2xl bg-studio-900/40 border border-studio-800 text-center text-studio-500 text-xs">
        No recent generations yet. Your synthesized audio clips will appear here.
      </div>
    );
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-4 rounded-2xl bg-studio-900/60 border border-studio-800 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-studio-200">
            Recent Generations ({history.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-studio-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All
        </button>
      </div>

      {/* History Items List */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-studio-950/60 border border-studio-800/80 hover:border-studio-750 transition-all flex items-center justify-between gap-3 group"
          >
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelectHistory(item)}
            >
              <p className="text-xs text-slate-200 truncate font-medium group-hover:text-brand-300 transition-colors">
                &ldquo;{item.text}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-studio-400">
                <span className="flex items-center gap-1 text-brand-400 font-mono">
                  <Volume2 className="w-3 h-3" />
                  {item.voiceName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-studio-500" />
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
              {/* Play / Load Button */}
              <button
                type="button"
                title="Play in studio player"
                onClick={() => onSelectHistory(item)}
                className="p-1.5 rounded-lg bg-studio-900 hover:bg-brand-600 text-studio-300 hover:text-white transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
              </button>

              {/* Download Button */}
              <a
                href={item.audioUrl}
                download={`tts-by-waqas-gill-${item.voiceName}-${item.timestamp}.mp3`}
                title="Download MP3"
                className="p-1.5 rounded-lg bg-studio-900 hover:bg-studio-800 text-studio-300 hover:text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </a>

              {/* Delete Button */}
              <button
                type="button"
                title="Remove"
                onClick={() => onDeleteHistoryItem(item.id)}
                className="p-1.5 rounded-lg text-studio-500 hover:text-rose-400 hover:bg-studio-900 transition-colors"
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
