'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { VoiceSelector } from '@/components/VoiceSelector';
import { TextEditor } from '@/components/TextEditor';
import { ProsodyControls } from '@/components/ProsodyControls';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HistoryPanel, HistoryItem } from '@/components/HistoryPanel';
import { Voice } from '@/lib/edge-tts-service';
import { synthesizeLargeScript } from '@/lib/batch-synthesizer';
import { Sparkles, Loader2, AlertCircle, Zap, ArrowRight, Mic2, Play, Volume2 } from 'lucide-react';
import { SeoContentSection } from '@/components/SeoContentSection';

const INITIAL_TEXT =
  "Welcome to TTSNexs Studio! You can customize voice speed, pitch, and choose from over 320 high-fidelity neural voices across dozens of languages. Supports up to 50,000 characters per script!";

export default function Home() {
  const router = useRouter();
  const {
    currentUser,
    userCredits,
    setUserCredits,
    setIsAuthModalOpen,
  } = useApp();

  const currentUserRef = useRef<{ name: string; email: string } | null>(null);
  const userCreditsRef = useRef<{
    isUnlimited: boolean;
    creditsUsed: number;
    creditLimit: number;
    remainingCredits: number;
    planName: string;
  } | null>(null);

  currentUserRef.current = currentUser;
  userCreditsRef.current = userCredits;

  // Core TTS states
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
  const [favorites, setFavorites] = useState<string[]>([
    'en-US-JennyNeural',
    'en-US-GuyNeural',
    'ur-PK-UzmaNeural',
  ]);

  // Voice preview state
  const [previewingVoiceShortName, setPreviewingVoiceShortName] = useState<string | null>(null);
  const [previewAudioObj, setPreviewAudioObj] = useState<HTMLAudioElement | null>(null);

  // Load voices and cached state on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        const res = await fetch('/api/voices');
        const data = await res.json();
        if (data.success && data.voices) {
          setVoices(data.voices);
          setLocales(data.locales || []);
          const defaultVoice =
            data.voices.find((v: Voice) => v.ShortName === 'en-US-JennyNeural') || data.voices[0];
          setSelectedVoice(defaultVoice);
        }
      } catch (err) {
        console.error('Failed to load voices:', err);
      }
    }
    loadVoices();

    try {
      const savedFavs = localStorage.getItem('edge_tts_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedHist = localStorage.getItem('edge_tts_history');
      if (savedHist) setHistory(JSON.parse(savedHist));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

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

  const handleResetProsody = () => {
    setRate(0);
    setPitch(0);
    setVolume(0);
  };

  // Progress state for Simple Text to Speech
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [synthesisStatusText, setSynthesisStatusText] = useState('');
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSynthesize = useCallback(async () => {
    if (!text.trim() || isSynthesizing) return;

    // Gating check: User must be signed in
    const activeUser = currentUserRef.current || currentUser;
    if (!activeUser) {
      setIsAuthModalOpen(true);
      return;
    }

    const currentCreds = userCreditsRef.current || userCredits;
    // Check credit balance before starting synthesis
    if (currentCreds && !currentCreds.isUnlimited && currentCreds.remainingCredits < text.trim().length) {
      setErrorMessage(
        `Insufficient credits! This script requires ${text.trim().length.toLocaleString()} credits, but you have ${currentCreds.remainingCredits.toLocaleString()} credits left. Please upgrade your plan or shorten your script.`
      );
      return;
    }

    setIsSynthesizing(true);
    setSynthesisProgress(8);
    setSynthesisStatusText('Connecting to EmpireNexs Neural Speech Engine...');
    setErrorMessage(null);

    const steps = [
      { progress: 25, text: 'Parsing script & detecting sentence boundaries...' },
      { progress: 50, text: 'Synthesizing voice inflections & prosody tuning...' },
      { progress: 75, text: 'Streaming audio frames from server...' },
      { progress: 92, text: 'Rendering high-definition MP3 audio...' },
    ];
    let stepIndex = 0;
    progressTimerRef.current = setInterval(() => {
      if (stepIndex < steps.length) {
        setSynthesisProgress(steps[stepIndex].progress);
        setSynthesisStatusText(steps[stepIndex].text);
        stepIndex++;
      }
    }, 450);

    try {
      const voiceShortName = selectedVoice?.ShortName || 'en-US-JennyNeural';
      const formattedRate = rate !== 0 ? `${rate >= 0 ? '+' : ''}${rate}%` : '+0%';
      const formattedPitch = pitch !== 0 ? `${pitch >= 0 ? '+' : ''}${pitch}Hz` : '+0Hz';
      const formattedVolume = volume !== 0 ? `${volume >= 0 ? '+' : ''}${volume}%` : '+0%';

      // High-capacity batch synthesis: handles 1 chunk or 50,000 characters across chapters
      const blob = await synthesizeLargeScript(
        text.trim(),
        async (chunkText) => {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: chunkText,
              voice: voiceShortName,
              rate: formattedRate,
              pitch: formattedPitch,
              volume: formattedVolume,
              userEmail: activeUser.email,
              skipDeduct: true,
            }),
          });

          if (!res.ok) {
            const errorJson = await res.json().catch(() => ({}));
            throw new Error(errorJson.error || `Synthesis failed with status ${res.status}`);
          }

          return await res.blob();
        },
        (progressInfo) => {
          if (progressTimerRef.current && progressInfo.totalChunks > 1) {
            clearInterval(progressTimerRef.current);
          }
          setSynthesisProgress(progressInfo.percent);
          setSynthesisStatusText(progressInfo.statusText);
        }
      );

      const url = URL.createObjectURL(blob);

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setSynthesisProgress(100);
      setSynthesisStatusText('Speech synthesized successfully!');

      // Deduct credits in client state and localStorage
      const charsDeducted = text.trim().length;
      if (activeUser?.email) {
        const targetEmail = activeUser.email.toLowerCase();
        const isOwner = targetEmail === 'muhammadwaqasmwg@gmail.com';
        const prev = userCreditsRef.current || userCredits;
        const currentLimit = prev ? prev.creditLimit : 30000;
        const currentUsed = prev ? (prev.creditsUsed || 0) : 0;
        const isUnlimited = isOwner || prev?.isUnlimited || currentLimit === -1;
        const newUsed = currentUsed + charsDeducted;
        const newRemaining = isUnlimited ? Infinity : Math.max(0, currentLimit - newUsed);
        const updated = {
          isUnlimited,
          creditsUsed: newUsed,
          creditLimit: currentLimit,
          remainingCredits: newRemaining,
          planName: prev?.planName || (isUnlimited ? 'Unlimited VIP Lifetime' : 'Free Starter (30k)'),
        };

        userCreditsRef.current = updated;
        setUserCredits(updated);

        try {
          localStorage.setItem(`empirenexs_credits_${targetEmail}`, JSON.stringify(updated));
        } catch {}

        // Sync with server store and admin dashboard
        fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'increment-usage',
            email: activeUser.email,
            characters: charsDeducted,
            creditsUsed: newUsed,
          }),
        }).catch(() => {});
      }

      setTimeout(() => {
        setAudioUrl(url);
        setIsSynthesizing(false);
      }, 350);

      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        text: text.trim(),
        voiceName:
          selectedVoice?.FriendlyName.replace('Microsoft ', '').replace(' Online (Natural)', '') ||
          'Neural Voice',
        audioUrl: url,
        timestamp: Date.now(),
        rate,
        pitch,
      };

      setHistory((prev) => {
        const updated = [newHistoryItem, ...prev.slice(0, 19)];
        try {
          localStorage.setItem('edge_tts_history', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        return updated;
      });
    } catch (err: unknown) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      console.error('Synthesis error:', err);
      setErrorMessage((err as Error)?.message || 'Failed to synthesize speech. Please try again.');
      setIsSynthesizing(false);
    }
  }, [text, isSynthesizing, selectedVoice, rate, pitch, volume, currentUser, userCredits, setIsAuthModalOpen, setUserCredits]);

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

  const handlePreviewVoice = async (voice: Voice) => {
    if (previewingVoiceShortName === voice.ShortName) {
      if (previewAudioObj) previewAudioObj.pause();
      setPreviewingVoiceShortName(null);
      return;
    }

    if (previewAudioObj) previewAudioObj.pause();
    setPreviewingVoiceShortName(voice.ShortName);

    try {
      const isUrdu = voice.Locale.startsWith('ur') || voice.ShortName.includes('-ur-');
      const isHindi = voice.Locale.startsWith('hi') || voice.ShortName.includes('-hi-');
      const sampleText = isUrdu
        ? 'السلام علیکم! یہ ٹی ٹی ایس اسٹوڈیو کی ہائی ڈیفینیشن نیورل آواز ہے۔'
        : isHindi
        ? 'नमस्ते! यह टीटीएस स्टूडियो की हाई डेफिनेशन न्यूरल आवाज़ है।'
        : `Hello, this is ${
            voice.FriendlyName.replace('Microsoft ', '').replace('👑 ', '').split(' ')[0]
          } speaking natural speech.`;
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
      audio.onended = () => setPreviewingVoiceShortName(null);
      await audio.play();
    } catch (e) {
      console.error('Preview error:', e);
      setPreviewingVoiceShortName(null);
    }
  };

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

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('edge_tts_history');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {errorMessage.toLowerCase().includes('credit') && (
              <button
                type="button"
                onClick={() => {
                  router.push('/pricing');
                  setErrorMessage(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Buy Credits</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Catchy Studio Hero Banner (Editorial Luxury Dark Aesthetic) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent border border-white/[0.08] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="flex flex-col gap-3.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-widest w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CREATE. SYNTHESIZE. MONETIZE.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.1]">
            Your All-in-One Voice &amp; Speech{' '}
            <span className="font-serif italic font-normal bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
              Platform
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
            Synthesize broadcast-quality speech with <strong>320+ ultra-realistic neural models</strong> across 140+ languages. Supports massive <strong>50,000-character scripts</strong> in a single pass with instant zero-shot voice cloning.
          </p>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSynthesize}
              disabled={isSynthesizing || !text.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>Synthesize Script</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/voice-cloning')}
              className="px-5 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white font-bold text-xs sm:text-sm transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <Mic2 className="w-4 h-4 text-orange-400" />
              <span>Clone Voice</span>
            </button>
          </div>
        </div>

        {/* Floating Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1 backdrop-blur-md">
            <span className="text-2xl font-black text-white">320+</span>
            <span className="text-[11px] text-slate-400 font-medium">Neural AI Voices</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1 backdrop-blur-md">
            <span className="text-2xl font-black text-orange-400">50,000</span>
            <span className="text-[11px] text-slate-400 font-medium">Chars / Pass</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1 backdrop-blur-md">
            <span className="text-2xl font-black text-amber-400">&lt;350ms</span>
            <span className="text-[11px] text-slate-400 font-medium">Instant Latency</span>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-1 backdrop-blur-md">
            <span className="text-2xl font-black text-emerald-400">48kHz</span>
            <span className="text-[11px] text-slate-400 font-medium">Studio Master</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Voice Selector & Prosody Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="studio-card p-6">
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
          <div className="studio-card p-6 text-xs text-slate-400 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>About TTSNexs Studio</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono text-[10px] font-bold border border-orange-500/20">
                Studio Engine
              </span>
            </div>
            <p className="leading-relaxed">
              <strong className="text-white">TTSNexs</strong> delivers studio-quality neural speech synthesis across 320+ realistic voices and 140+ languages with up to 50,000 characters per script and instant voice cloning.
            </p>
          </div>
        </div>

        {/* Right Column: Script Editor, Generation CTA, Audio Player & History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="studio-card p-6">
            <TextEditor
              text={text}
              onChangeText={setText}
              disabled={isSynthesizing}
            />

            {/* Progress bar with percentage for Simple Text to Speech */}
            {isSynthesizing && (
              <div className="mt-4 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-orange-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                    <span>{synthesisStatusText}</span>
                  </div>
                  <span className="font-mono text-orange-400 font-extrabold text-sm">
                    {synthesisProgress}%
                  </span>
                </div>

                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${synthesisProgress}%` }}
                    className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full transition-all duration-300 shadow-sm shadow-orange-500/50"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-slate-300 font-mono text-[10px] font-bold">
                  Ctrl + Enter
                </span>
                <span>to generate</span>
              </div>

              <button
                type="button"
                disabled={isSynthesizing || !text.trim()}
                onClick={handleSynthesize}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isSynthesizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Speech...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-white" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <AudioPlayer
            audioUrl={audioUrl}
            voiceName={selectedVoice?.ShortName}
            isLoading={isSynthesizing}
          />

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

          {/* On-Page SEO Rich Content & FAQ Section */}
          <SeoContentSection />
        </div>
      </div>
    </div>
  );
}
