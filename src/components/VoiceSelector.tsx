'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Play,
  Pause,
  Star,
  Globe,
  User,
  SlidersHorizontal,
  ChevronDown,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { Voice } from '@/lib/edge-tts-service';

interface VoiceSelectorProps {
  voices: Voice[];
  locales: { locale: string; name: string; count: number }[];
  selectedVoice: Voice | null;
  onSelectVoice: (voice: Voice) => void;
  favorites: string[];
  onToggleFavorite: (shortName: string) => void;
  onPreviewVoice: (voice: Voice) => void;
  previewingVoiceShortName?: string | null;
}

export function VoiceSelector({
  voices,
  locales,
  selectedVoice,
  onSelectVoice,
  favorites,
  onToggleFavorite,
  onPreviewVoice,
  previewingVoiceShortName,
}: VoiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'Female' | 'Male'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Top popular locales for quick tabs
  const popularLocales = [
    { code: 'all', label: 'All Languages' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'en-GB', label: 'English (UK)' },
    { code: 'ur-PK', label: 'Urdu (PK)' },
    { code: 'es-ES', label: 'Spanish' },
    { code: 'ar-SA', label: 'Arabic' },
    { code: 'hi-IN', label: 'Hindi' },
    { code: 'fr-FR', label: 'French' },
    { code: 'de-DE', label: 'German' },
  ];

  const filteredVoices = useMemo(() => {
    return voices.filter((v) => {
      // Favorites filter
      if (onlyFavorites && !favorites.includes(v.ShortName)) {
        return false;
      }
      // Locale filter
      if (selectedLocale !== 'all' && v.Locale.toLowerCase() !== selectedLocale.toLowerCase()) {
        return false;
      }
      // Gender filter
      if (selectedGender !== 'all' && v.Gender !== selectedGender) {
        return false;
      }
      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = v.FriendlyName.toLowerCase().includes(query);
        const matchesShort = v.ShortName.toLowerCase().includes(query);
        const matchesLocale = v.LocaleName?.toLowerCase().includes(query);
        const matchesPersonality = v.VoiceTag?.VoicePersonalities?.some((p) =>
          p.toLowerCase().includes(query)
        );
        return matchesName || matchesShort || matchesLocale || matchesPersonality;
      }
      return true;
    });
  }, [voices, selectedLocale, selectedGender, onlyFavorites, favorites, search]);

  return (
    <div className="flex flex-col gap-3">
      {/* Current Voice Banner / Toggle Button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-studio-200 flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-brand-400" />
          Selected Voice
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors font-medium flex items-center gap-1"
        >
          {isOpen ? 'Close Browser' : 'Browse All 320+ Voices'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Selected Voice Card */}
      {selectedVoice && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-3.5 rounded-xl bg-studio-900/90 border border-brand-500/30 shadow-lg shadow-brand-500/5 hover:border-brand-500/60 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {selectedVoice.Locale.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                  {selectedVoice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    selectedVoice.Gender === 'Female'
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {selectedVoice.Gender}
                </span>
              </div>
              <p className="text-xs text-studio-400 flex items-center gap-1.5 mt-0.5">
                <Globe className="w-3 h-3 text-studio-500" />
                {selectedVoice.LocaleName || selectedVoice.Locale}
                {selectedVoice.VoiceTag?.VoicePersonalities?.[0] && (
                  <>
                    <span>•</span>
                    <span className="text-studio-300">{selectedVoice.VoiceTag.VoicePersonalities[0]}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Preview Voice"
              onClick={(e) => {
                e.stopPropagation();
                onPreviewVoice(selectedVoice);
              }}
              className="p-2 rounded-lg bg-studio-800 hover:bg-brand-600 text-studio-300 hover:text-white transition-colors"
            >
              {previewingVoiceShortName === selectedVoice.ShortName ? (
                <Pause className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Voice Explorer Modal / Drawer */}
      {isOpen && (
        <div className="rounded-2xl bg-studio-900/95 border border-studio-800 p-4 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Search bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-studio-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by speaker, accent, or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-studio-950 border border-studio-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-studio-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Locale Dropdown */}
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="bg-studio-950 border border-studio-800 rounded-xl px-3 py-2 text-sm text-studio-200 focus:outline-none focus:border-brand-500"
            >
              <option value="all">All Locales ({voices.length})</option>
              {locales.map((loc) => (
                <option key={loc.locale} value={loc.locale}>
                  {loc.name} ({loc.count})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-studio-800/60">
            {/* Quick Language Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
              {popularLocales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedLocale(item.code)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    selectedLocale === item.code
                      ? 'bg-brand-600 text-white font-medium'
                      : 'bg-studio-950/70 text-studio-400 hover:text-studio-200 hover:bg-studio-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Gender and Favorites Filter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-studio-950 rounded-lg p-0.5 border border-studio-800 text-xs">
                {(['all', 'Female', 'Male'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      selectedGender === g
                        ? 'bg-brand-600 text-white font-medium'
                        : 'text-studio-400 hover:text-studio-200'
                    }`}
                  >
                    {g === 'all' ? 'All' : g}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs transition-colors ${
                  onlyFavorites
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-medium'
                    : 'bg-studio-950 border-studio-800 text-studio-400 hover:text-studio-200'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="max-h-80 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredVoices.length === 0 ? (
              <div className="col-span-full py-8 text-center text-studio-400 text-sm">
                No voices found matching your search and filter criteria.
              </div>
            ) : (
              filteredVoices.map((voice) => {
                const isSelected = selectedVoice?.ShortName === voice.ShortName;
                const isFav = favorites.includes(voice.ShortName);
                const isPlaying = previewingVoiceShortName === voice.ShortName;

                return (
                  <div
                    key={voice.ShortName}
                    onClick={() => {
                      onSelectVoice(voice);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-brand-950/40 border-brand-500 shadow-md shadow-brand-500/10'
                        : 'bg-studio-950/60 border-studio-800/80 hover:border-studio-700 hover:bg-studio-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-studio-900 text-studio-300 border border-studio-800'
                        }`}
                      >
                        {voice.Locale.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium text-white text-xs truncate">
                            {voice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded shrink-0 ${
                              voice.Gender === 'Female'
                                ? 'bg-pink-500/10 text-pink-400'
                                : 'bg-blue-500/10 text-blue-400'
                            }`}
                          >
                            {voice.Gender[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-studio-400 truncate">
                          {voice.LocaleName || voice.Locale}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title={isPlaying ? 'Stop' : 'Preview voice'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreviewVoice(voice);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isPlaying
                            ? 'bg-brand-600 text-white'
                            : 'text-studio-400 hover:text-white hover:bg-studio-800'
                        }`}
                      >
                        {isPlaying ? (
                          <Pause className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Play className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        title={isFav ? 'Remove favorite' : 'Add to favorites'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(voice.ShortName);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFav
                            ? 'text-amber-400'
                            : 'text-studio-500 hover:text-amber-400 hover:bg-studio-800'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center ml-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
