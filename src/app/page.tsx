'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar, TabType } from '@/components/Sidebar';
import { TopNavbar } from '@/components/TopNavbar';
import { AuthModal } from '@/components/AuthModal';
import { VoiceSelector } from '@/components/VoiceSelector';
import { TextEditor } from '@/components/TextEditor';
import { ProsodyControls } from '@/components/ProsodyControls';
import { AudioPlayer } from '@/components/AudioPlayer';
import { HistoryPanel, HistoryItem } from '@/components/HistoryPanel';
import { VoiceCloner, SavedClone } from '@/components/VoiceCloner';
import { VoiceLibrary } from '@/components/VoiceLibrary';
import { PricingPage } from '@/components/PricingPage';
import { AboutPage } from '@/components/AboutPage';
import { Voice } from '@/lib/edge-tts-service';
import { Sparkles, Loader2, AlertCircle, Info } from 'lucide-react';

const INITIAL_TEXT =
  "Welcome to TTS bY Waqas Gill by EmpireNexs! You can customize voice speed, pitch, and choose from over 320 high-fidelity neural voices across dozens of languages. Supports up to 50,000 words!";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('text-to-voice');
  const [activeLoadedClone, setActiveLoadedClone] = useState<SavedClone | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

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
      const savedUser = localStorage.getItem('empirenexs_user');
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const handleLoginSuccess = (user: { name: string; email: string }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('empirenexs_user', JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('empirenexs_user');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

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

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setSynthesisProgress(100);
      setSynthesisStatusText('Speech synthesized successfully!');

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
  }, [text, isSynthesizing, selectedVoice, rate, pitch, volume]);

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
      const sampleText = `Hello, this is ${
        voice.FriendlyName.replace('Microsoft ', '').split(' ')[0]
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
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl w-full mx-auto">
          {/* VIEW 1: TEXT TO VOICE STUDIO */}
          {activeTab === 'text-to-voice' && (
            <div className="flex flex-col gap-8">
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    onClick={() => setErrorMessage(null)}
                    className="font-semibold underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Voice Selector & Prosody Controls (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
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
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-xs text-slate-600 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                        <Sparkles className="w-4 h-4 text-brand-600" />
                        <span>
                          About TTS{' '}
                          <a
                            href="https://www.facebook.com/mwaqasgillcs/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-600 hover:underline"
                          >
                            bY Waqas Gill
                          </a>
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-mono text-[10px] font-bold border border-brand-200">
                        EmpireNexs
                      </span>
                    </div>
                    <p className="leading-relaxed">
                      Crafted and powered by <strong className="text-slate-900">EmpireNexs</strong> under the direction of{' '}
                      <a
                        href="https://www.facebook.com/mwaqasgillcs/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-700 hover:text-brand-800 hover:underline font-bold transition-colors"
                        title="Connect with Waqas Gill on Facebook"
                      >
                        Waqas Gill
                      </a>. Harnesses Microsoft neural speech synthesis delivering hyper-realistic human voiceovers across 320+ voices with up to 50,000 words capacity.
                    </p>
                  </div>
                </div>

                {/* Right Column: Script Editor, Generation CTA, Audio Player & History (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                    <TextEditor
                      text={text}
                      onChangeText={setText}
                      disabled={isSynthesizing}
                    />

                    {/* Progress bar with percentage for Simple Text to Speech */}
                    {isSynthesizing && (
                      <div className="mt-4 p-4 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col gap-2.5 animate-in fade-in">
                        <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                            <span>{synthesisStatusText}</span>
                          </div>
                          <span className="font-mono text-brand-700 font-extrabold text-sm">
                            {synthesisProgress}%
                          </span>
                        </div>

                        <div className="w-full h-3 bg-brand-100 rounded-full overflow-hidden p-0.5">
                          <div
                            style={{ width: `${synthesisProgress}%` }}
                            className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300 shadow-sm"
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px] font-bold">
                          Ctrl + Enter
                        </span>
                        <span>to generate</span>
                      </div>

                      <button
                        type="button"
                        disabled={isSynthesizing || !text.trim()}
                        onClick={handleSynthesize}
                        className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isSynthesizing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Synthesizing Speech...</span>
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
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: VOICE CLONING */}
          {activeTab === 'voice-cloning' && (
            <VoiceCloner
              initialClone={activeLoadedClone}
              onClearInitialClone={() => setActiveLoadedClone(null)}
              onNavigateToLibrary={() => setActiveTab('voice-library')}
            />
          )}

          {/* VIEW 3: VOICE LIBRARY */}
          {activeTab === 'voice-library' && (
            <VoiceLibrary
              onUseVoice={(clone) => {
                setActiveLoadedClone(clone);
                setActiveTab('voice-cloning');
              }}
              onNavigateToCloner={() => setActiveTab('voice-cloning')}
            />
          )}

          {/* VIEW 4: PRICING */}
          {activeTab === 'pricing' && <PricingPage />}

          {/* VIEW 5: ABOUT US */}
          {activeTab === 'about' && <AboutPage />}
        </main>

        {/* Studio Footer */}
        <footer className="border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-400 bg-white">
          <p>
            TTS bY{' '}
            <a
              href="https://www.facebook.com/mwaqasgillcs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-brand-600 hover:underline font-medium"
              title="Connect with Waqas Gill on Facebook"
            >
              Waqas Gill
            </a>{' '}
            • An <strong className="text-brand-600 font-semibold">EmpireNexs</strong> Innovation • Developed with precision by{' '}
            <a
              href="https://www.facebook.com/mwaqasgillcs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 hover:underline font-bold transition-colors"
              title="Connect with Waqas Gill on Facebook"
            >
              Waqas Gill
            </a>
          </p>
        </footer>
      </div>

      {/* Auth Modal (Sign In / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccessLogin={handleLoginSuccess}
      />
    </div>
  );
}
