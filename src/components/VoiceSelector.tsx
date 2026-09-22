'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  Play,
  Pause,
  Star,
  Globe,
  ChevronDown,
  Volume2,
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
      if (onlyFavorites && !favorites.includes(v.ShortName)) return false;
      if (selectedLocale !== 'all' && v.Locale.toLowerCase() !== selectedLocale.toLowerCase()) return false;
      if (selectedGender !== 'all' && v.Gender !== selectedGender) return false;
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
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-brand-600" />
          Selected Neural Voice
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-brand-600 hover:text-brand-700 transition-colors font-semibold flex items-center gap-1"
        >
          {isOpen ? 'Close Browser' : 'Browse All 320+ Voices'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Selected Voice Card */}
      {selectedVoice && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-2xl bg-white border border-brand-200/90 shadow-xs hover:border-brand-500 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 font-extrabold text-sm">
              {selectedVoice.Locale.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {selectedVoice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    selectedVoice.Gender === 'Female'
                      ? 'bg-pink-50 text-pink-700 border border-pink-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {selectedVoice.Gender}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                <Globe className="w-3 h-3 text-slate-400" />
                {selectedVoice.LocaleName || selectedVoice.Locale}
                {selectedVoice.VoiceTag?.VoicePersonalities?.[0] && (
                  <>
                    <span>•</span>
                    <span className="text-slate-600">{selectedVoice.VoiceTag.VoicePersonalities[0]}</span>
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
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-brand-600 text-slate-600 hover:text-white transition-colors"
            >
              {previewingVoiceShortName === selectedVoice.ShortName ? (
                <Pause className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Expanded Voice Explorer Modal / Dropdown */}
      {isOpen && (
        <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-xl flex flex-col gap-4 animate-in fade-in duration-150">
          {/* Search bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search speaker, accent, or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
              />
            </div>

            {/* Locale Dropdown */}
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-brand-600 font-medium"
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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            {/* Quick Language Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {popularLocales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedLocale(item.code)}
                  className={`px-3 py-1 rounded-xl transition-colors whitespace-nowrap text-xs ${
                    selectedLocale === item.code
                      ? 'bg-brand-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Gender and Favorites */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 rounded-xl p-0.5 text-xs">
                {(['all', 'Female', 'Male'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                      selectedGender === g
                        ? 'bg-white text-brand-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {g === 'all' ? 'All' : g}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                  onlyFavorites
                    ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>Favorites</span>
              </button>
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="max-h-80 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredVoices.length === 0 ? (
              <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                No voices found matching your criteria.
              </div>
            ) : (
              filteredVoices.map((voice) => {
                const isSelected = selectedVoice?.ShortName === voice.ShortName;
                const isFav = favorites.includes(voice.ShortName);
                const isPlaying = previewingVoiceShortName === voice.ShortName;

                return (
                  <div
                    key={voice.ShortName}
                    onClick={() => onSelectVoice(voice)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-brand-50/60 border-brand-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {voice.Locale.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-bold text-slate-900 text-xs truncate">
                            {voice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded shrink-0 font-medium ${
                              voice.Gender === 'Female'
                                ? 'bg-pink-50 text-pink-700'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {voice.Gender[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
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
                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
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
                            ? 'text-amber-500'
                            : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-500' : ''}`} />
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center ml-1">
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
