'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { VoiceSelector } from '@/components/VoiceSelector';
import { TextEditor } from '@/components/TextEditor';
import { ProsodyControls } from '@/components/ProsodyControls';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HistoryPanel, HistoryItem } from '@/components/HistoryPanel';
import { Voice } from '@/lib/edge-tts-service';
import { Sparkles, Loader2, PlayCircle, AlertCircle, Info, Mic2 } from 'lucide-react';

const INITIAL_TEXT =
  "Welcome to TTS bY Waqas Gill! You can customize voice speed, pitch, and choose from over 320 high-fidelity neural voices across dozens of languages. Supports up to 50,000 words!";

export default function Home() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [locales, setLocales] = useState<{ locale: string; name: string; count: number }[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [text, setText] = useState(INITIAL_TEXT);

  // Prosody states
  const [rate, setRate] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(0);

  // Audio and generation states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History & Favorites
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(['en-US-JennyNeural', 'en-US-GuyNeural', 'ur-PK-UzmaNeural']);

  // Voice preview state
  const [previewingVoiceShortName, setPreviewingVoiceShortName] = useState<string | null>(null);
  const [previewAudioObj, setPreviewAudioObj] = useState<HTMLAudioElement | null>(null);

  // Load voices on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        const res = await fetch('/api/voices');
        const data = await res.json();
        if (data.success && data.voices) {
          setVoices(data.voices);
          setLocales(data.locales || []);
          // Pick default voice: Jenny (en-US) or first available
          const defaultVoice =
            data.voices.find((v: Voice) => v.ShortName === 'en-US-JennyNeural') || data.voices[0];
          setSelectedVoice(defaultVoice);
        }
      } catch (err) {
        console.error('Failed to load voices:', err);
      }
    }
    loadVoices();

    // Load favorites and history from localStorage
    try {
      const savedFavs = localStorage.getItem('edge_tts_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedHist = localStorage.getItem('edge_tts_history');
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Persist favorites
  const toggleFavorite = (shortName: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(shortName)
        ? prev.filter((id) => id !== shortName)
        : [...prev, shortName];
      try {
        localStorage.setItem('edge_tts_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  // Reset prosody settings
  const handleResetProsody = () => {
    setRate(0);
    setPitch(0);
    setVolume(0);
  };

  // Main TTS synthesis
  const handleSynthesize = useCallback(async () => {
    if (!text.trim() || isSynthesizing) return;
    setIsSynthesizing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoice?.ShortName || 'en-US-JennyNeural',
          rate: rate !== 0 ? `${rate >= 0 ? '+' : ''}${rate}%` : '+0%',
          pitch: pitch !== 0 ? `${pitch >= 0 ? '+' : ''}${pitch}Hz` : '+0Hz',
          volume: volume !== 0 ? `${volume >= 0 ? '+' : ''}${volume}%` : '+0%',
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `Synthesis failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Save generation to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        text: text.trim(),
        voiceName: selectedVoice?.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '') || 'Neural Voice',
        audioUrl: url,
        timestamp: Date.now(),
        rate,
        pitch,
      };

      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev.slice(0, 19)]; // Keep latest 20
        try {
          localStorage.setItem('edge_tts_history', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        return updated;
      });
    } catch (err: unknown) {
      console.error('Synthesis error:', err);
      setErrorMessage((err as Error)?.message || 'Failed to synthesize speech. Please try again.');
    } finally {
      setIsSynthesizing(false);
    }
  }, [text, isSynthesizing, selectedVoice, rate, pitch, volume]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to synthesize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSynthesize();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSynthesize]);

  // Voice Preview
  const handlePreviewVoice = async (voice: Voice) => {
    // If already previewing this voice, stop it
    if (previewingVoiceShortName === voice.ShortName) {
      if (previewAudioObj) {
        previewAudioObj.pause();
      }
      setPreviewingVoiceShortName(null);
      return;
    }

    if (previewAudioObj) {
      previewAudioObj.pause();
    }

    setPreviewingVoiceShortName(voice.ShortName);

    try {
      const sampleText = `Hello, this is ${voice.FriendlyName.replace('Microsoft ', '').split(' ')[0]} speaking natural speech.`;
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleText,
          voice: voice.ShortName,
          rate: '+0%',
          pitch: '+0Hz',
          volume: '+0%',
        }),
      });

      if (!res.ok) throw new Error('Preview failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      setPreviewAudioObj(audio);

      audio.onended = () => {
        setPreviewingVoiceShortName(null);
      };

      await audio.play();
    } catch (e) {
      console.error('Preview error:', e);
      setPreviewingVoiceShortName(null);
    }
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('edge_tts_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  // Clear all history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('edge_tts_history');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header totalVoices={voices.length} selectedVoiceName={selectedVoice?.ShortName} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workstation Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Voice Selector & Prosody Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Voice Selection */}
            <div className="p-5 rounded-2xl bg-studio-900/60 border border-studio-800">
              <VoiceSelector
                voices={voices}
                locales={locales}
                selectedVoice={selectedVoice}
                onSelectVoice={setSelectedVoice}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onPreviewVoice={handlePreviewVoice}
                previewingVoiceShortName={previewingVoiceShortName}
              />
            </div>

            {/* Prosody Controls (Rate, Pitch, Volume) */}
            <ProsodyControls
              rate={rate}
              onChangeRate={setRate}
              pitch={pitch}
              onChangePitch={setPitch}
              volume={volume}
              onChangeVolume={setVolume}
              onReset={handleResetProsody}
            />

            {/* Info / Engine details card */}
            <div className="p-4 rounded-2xl bg-studio-900/30 border border-studio-800/60 text-xs text-studio-400 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-studio-300 font-semibold">
                <Info className="w-4 h-4 text-brand-400" />
                <span>About Edge TTS Neural Engine</span>
              </div>
              <p>
                Powered by Microsoft Edge&apos;s online text-to-speech service with natural human-like inflections, accurate pronunciation, and multi-language support. Completely free without API rate limits or subscription keys.
              </p>
            </div>
          </div>

          {/* Right Column: Script Editor, Generation CTA, Audio Player & History (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Script Editor */}
            <div className="p-5 rounded-2xl bg-studio-900/60 border border-studio-800">
              <TextEditor
                text={text}
                onChangeText={setText}
                disabled={isSynthesizing}
              />

              {/* Action Buttons Row */}
              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-studio-800/80">
                <div className="text-xs text-studio-400 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-studio-800 font-mono text-[10px]">
                    Ctrl + Enter
                  </span>
                  <span>to generate</span>
                </div>

                <button
                  type="button"
                  disabled={isSynthesizing || !text.trim()}
                  onClick={handleSynthesize}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isSynthesizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Audio...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Speech</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Audio Player */}
            <AudioPlayer
              audioUrl={audioUrl}
              voiceName={selectedVoice?.ShortName}
              isLoading={isSynthesizing}
            />

            {/* History Panel */}
            <HistoryPanel
              history={history}
              onSelectHistory={(item) => {
                setAudioUrl(item.audioUrl);
                setText(item.text);
                setRate(item.rate);
                setPitch(item.pitch);
              }}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-studio-900 py-6 mt-12 bg-studio-950/60 text-xs text-studio-500 text-center">
        <p>
          TTS bY Waqas Gill • Built with Next.js 15, Tailwind CSS &amp; Microsoft Edge Speech Engine
        </p>
      </footer>
    </div>
  );
}
