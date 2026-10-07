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
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-orange-400" />
          Selected Neural Voice
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-orange-400 hover:text-orange-300 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
        >
          {isOpen ? 'Close Browser' : 'Browse All 320+ Voices'}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Selected Voice Card */}
      {selectedVoice && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 shadow-lg hover:border-orange-500/50 transition-all cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-300 font-extrabold text-sm shadow-xs shadow-orange-500/20">
              {selectedVoice.Locale.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm group-hover:text-orange-400 transition-colors">
                  {selectedVoice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                    selectedVoice.Gender === 'Female'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {selectedVoice.Gender}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-medium">
                <Globe className="w-3 h-3 text-slate-500" />
                {selectedVoice.LocaleName || selectedVoice.Locale}
                {selectedVoice.VoiceTag?.VoicePersonalities?.[0] && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300">{selectedVoice.VoiceTag.VoicePersonalities[0]}</span>
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
              className="p-2.5 rounded-xl bg-white/[0.06] hover:bg-orange-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
        <div className="rounded-3xl bg-[#0e1019] border border-white/10 p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in duration-150">
          {/* Search bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search speaker, accent, or country..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:bg-white/[0.08] transition-all"
              />
            </div>

            {/* Locale Dropdown */}
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="bg-[#131624] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
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
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08]">
            {/* Quick Language Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {popularLocales.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setSelectedLocale(item.code)}
                  className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap text-xs cursor-pointer ${
                    selectedLocale === item.code
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/25'
                      : 'bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Gender and Favorites */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.05] border border-white/10 rounded-xl p-0.5 text-xs">
                {(['all', 'Female', 'Male'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`px-2.5 py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                      selectedGender === g
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {g === 'all' ? 'All' : g}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                  onlyFavorites
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-white/[0.05] border-white/10 text-slate-400 hover:text-white'
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
                        ? 'bg-orange-500/15 border-orange-500 text-white shadow-md shadow-orange-500/15'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/15 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white'
                            : 'bg-white/[0.06] text-slate-400 border border-white/10'
                        }`}
                      >
                        {voice.Locale.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className={`font-bold text-xs truncate ${isSelected ? 'text-orange-300' : 'text-slate-200 group-hover:text-white'}`}>
                            {voice.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '')}
                          </span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded shrink-0 font-medium ${
                              voice.Gender === 'Female'
                                ? 'bg-pink-500/20 text-pink-300'
                                : 'bg-blue-500/20 text-blue-300'
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
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isPlaying
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-400 hover:text-white hover:bg-white/[0.1]'
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
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-400'
                            : 'text-slate-500 hover:text-amber-400 hover:bg-white/[0.1]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center ml-1 shadow-xs shadow-orange-500/40">
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
