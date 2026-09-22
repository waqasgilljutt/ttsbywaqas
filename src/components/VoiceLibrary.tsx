'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderHeart,
  Play,
  Pause,
  Trash2,
  Sparkles,
  Search,
  Plus,
  ArrowRight,
  Volume2,
  Clock,
  CheckCircle2,
  Mic,
  Dna,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { SavedClone } from './VoiceCloner';

interface VoiceLibraryProps {
  onUseVoice: (clone: SavedClone) => void;
  onNavigateToCloner: () => void;
  currentUser?: { name: string; email: string } | null;
  onRequireAuth?: () => void;
}

export function VoiceLibrary({
  onUseVoice,
  onNavigateToCloner,
  currentUser,
  onRequireAuth,
}: VoiceLibraryProps) {
  const [savedClones, setSavedClones] = useState<SavedClone[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('empirenexs_saved_clones');
      if (stored) {
        setSavedClones(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to load saved clones:', err);
    }
  }, []);

  const handleDelete = (id: string) => {
    const updated = savedClones.filter((c) => c.id !== id);
    setSavedClones(updated);
    try {
      localStorage.setItem('empirenexs_saved_clones', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    if (activePlayingId === id) {
      if (audioRef.current) audioRef.current.pause();
      setActivePlayingId(null);
    }
  };

  const handleClearExpired = () => {
    const updated = savedClones.filter((c) => c.audioUrl && c.audioUrl.startsWith('data:'));
    setSavedClones(updated);
    try {
      localStorage.setItem('empirenexs_saved_clones', JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
    if (activePlayingId) {
      if (audioRef.current) audioRef.current.pause();
      setActivePlayingId(null);
    }
  };

  const handleTogglePlay = (clone: SavedClone) => {
    if (!clone.audioUrl || clone.audioUrl.startsWith('blob:')) {
      return;
    }

    if (activePlayingId === clone.id) {
      if (audioRef.current) audioRef.current.pause();
      setActivePlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = clone.audioUrl;
        audioRef.current.play().catch((err) => {
          console.warn('Audio play error:', err);
          setActivePlayingId(null);
        });
        setActivePlayingId(clone.id);
      }
    }
  };

  const expiredCount = savedClones.filter(
    (c) => !c.audioUrl || c.audioUrl.startsWith('blob:')
  ).length;

  const filteredClones = savedClones.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-16">
      {/* Hidden audio element for preview */}
      <audio
        ref={audioRef}
        onEnded={() => setActivePlayingId(null)}
        onError={() => setActivePlayingId(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold w-fit">
            <FolderHeart className="w-3.5 h-3.5 text-brand-600" />
            <span>Voice Library Studio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Saved Voice Clones Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Select any of your saved voice models to instantly load it into the Voice Cloner and synthesize new scripts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              onRequireAuth?.();
              return;
            }
            onNavigateToCloner();
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Clone New Voice</span>
        </button>
      </div>

      {/* Expired legacy clones warning banner */}
      {expiredCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>{expiredCount} voice profile{expiredCount > 1 ? 's were' : ' was'}</strong> saved in an earlier session with a temporary link. Please clear expired profiles, then record or upload a fresh sample to save permanently.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearExpired}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Expired ({expiredCount})</span>
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      {savedClones.length > 0 && (
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your voice clones by name..."
              className="w-full bg-transparent pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 px-3 font-medium">
            {filteredClones.length} {filteredClones.length === 1 ? 'Voice' : 'Voices'}
          </span>
        </div>
      )}

      {/* Empty State */}
      {savedClones.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col items-center justify-center text-center gap-4 my-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 shadow-sm">
            <Dna className="w-8 h-8" />
          </div>
          <div className="max-w-md flex flex-col gap-1.5">
            <h3 className="text-lg font-bold text-slate-900">No Saved Voices Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Record a 5 to 10 second audio sample or upload an audio file in the Voice Cloning Studio, then click &ldquo;Save to Library&rdquo; to store your custom voice models here permanently.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCloner}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Mic className="w-4 h-4" />
            <span>Open Voice Cloner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredClones.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-3xl border border-slate-200">
          No voice clones match &ldquo;{searchQuery}&rdquo;. Try another search keyword.
        </div>
      ) : (
        /* Voice Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClones.map((clone) => {
            const isExpired = !clone.audioUrl || clone.audioUrl.startsWith('blob:');
            const isPlaying = activePlayingId === clone.id;

            return (
              <div
                key={clone.id}
                className={`bg-white rounded-3xl border p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group ${
                  isExpired ? 'border-amber-200/80 bg-amber-50/20' : 'border-slate-200/90'
                }`}
              >
                {/* Card Top: Avatar & Name */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
                        isExpired
                          ? 'bg-gradient-to-tr from-amber-500 to-slate-400 shadow-amber-500/10'
                          : 'bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-brand-500/20'
                      }`}>
                        <Dna className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {clone.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{clone.date}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(clone.id)}
                      title="Delete Clone"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isExpired ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-800 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Expired Link (Old Session)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Permanent Voice Model
                      </span>
                    )}

                    {clone.gender && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {clone.gender}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Middle: Audio Preview Player or Expired Box */}
                {isExpired ? (
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-[11px] leading-snug">
                      Audio expired. Delete this card and re-save a sample in Voice Cloner.
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(clone)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs transition-all shrink-0 ${
                        isPlaying
                          ? 'bg-amber-500 hover:bg-amber-600'
                          : 'bg-brand-600 hover:bg-brand-500'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-700 truncate">
                        {isPlaying ? 'Playing sample preview...' : 'Voice Sample Audio'}
                      </span>
                      <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isPlaying ? 'w-full bg-brand-600 animate-pulse' : 'w-0'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Bottom: Primary CTA */}
                {isExpired ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(clone.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 hover:border-rose-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Expired Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        onRequireAuth?.();
                        return;
                      }
                      onUseVoice(clone);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all group-hover:bg-brand-600"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Use This Voice</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
