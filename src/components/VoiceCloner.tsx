'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Upload,
  Play,
  Pause,
  Download,
  Sparkles,
  Loader2,
  Trash2,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Dna,
  BookmarkPlus,
  History,
  Clock,
  User,
  Globe2,
  Sliders,
  Check,
  Share2,
} from 'lucide-react';

interface SavedClone {
  id: string;
  name: string;
  date: string;
  audioUrl: string;
  gender: 'Male' | 'Female';
  locale: string;
}

interface ClonedHistoryItem {
  id: string;
  voiceName: string;
  text: string;
  audioUrl: string;
  timestamp: number;
  gender: string;
  locale: string;
}

export function VoiceCloner() {
  const [inputMode, setInputMode] = useState<'record' | 'upload'>('record');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);

  // Voice parameters (Default: Male, Urdu)
  const [voiceName, setVoiceName] = useState('Waqas Gill Clone');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [locale, setLocale] = useState('ur-PK');
  const [tone, setTone] = useState<'natural' | 'deep' | 'warm' | 'energetic'>('natural');

  // Target Script
  const [scriptText, setScriptText] = useState(
    'السلام علیکم! یہ میری اپنی آواز کا AI کلون ہے جو ایمپائر نیکس کی ٹیکنالوجی کے ذریعے بنایا گیا ہے۔'
  );

  // Saved Clones Library
  const [savedClones, setSavedClones] = useState<SavedClone[]>([]);
  const [selectedCloneId, setSelectedCloneId] = useState<string | null>(null);
  const [cloneSavedNotice, setCloneSavedNotice] = useState(false);

  // Cloned Generation History
  const [clonedHistory, setClonedHistory] = useState<ClonedHistoryItem[]>([]);

  // Generation & Progress states
  const [isCloning, setIsCloning] = useState(false);
  const [cloneProgress, setCloneProgress] = useState(0);
  const [cloneStatusText, setCloneStatusText] = useState('');
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Output player states
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [isPlayingCloned, setIsPlayingCloned] = useState(false);
  const [currentClonedTime, setCurrentClonedTime] = useState(0);
  const [clonedDuration, setClonedDuration] = useState(0);
  const clonedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load saved clones and history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('empirenexs_saved_clones');
      if (saved) setSavedClones(JSON.parse(saved));

      const hist = localStorage.getItem('empirenexs_cloned_history');
      if (hist) setClonedHistory(JSON.parse(hist));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mm}:${ss}`;
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Mic access error:', err);
      setErrorMsg('Microphone access denied. Please allow microphone permissions or upload an audio file.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setErrorMsg('Audio file is too large. Please select a file under 20MB.');
        return;
      }
      setUploadedFile(file);
      setUploadedAudioUrl(URL.createObjectURL(file));
    }
  };

  // Save current clone to library
  const handleSaveCloneToLibrary = () => {
    const activeUrl = recordedAudioUrl || uploadedAudioUrl;
    if (!activeUrl) {
      setErrorMsg('Record or upload a voice sample first before saving.');
      return;
    }

    const newClone: SavedClone = {
      id: Date.now().toString(),
      name: voiceName.trim() || 'My Voice Clone',
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
      audioUrl: activeUrl,
      gender,
      locale,
    };

    const updated = [newClone, ...savedClones];
    setSavedClones(updated);
    try {
      localStorage.setItem('empirenexs_saved_clones', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setCloneSavedNotice(true);
    setTimeout(() => setCloneSavedNotice(false), 2500);
  };

  const handleDeleteClone = (id: string) => {
    const updated = savedClones.filter((c) => c.id !== id);
    setSavedClones(updated);
    if (selectedCloneId === id) setSelectedCloneId(null);
    try {
      localStorage.setItem('empirenexs_saved_clones', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleUseSavedClone = (clone: SavedClone) => {
    setSelectedCloneId(clone.id);
    setVoiceName(clone.name);
    setGender(clone.gender || 'Male');
    setLocale(clone.locale || 'ur-PK');
    setRecordedAudioUrl(clone.audioUrl);
    fetch(clone.audioUrl)
      .then((r) => r.blob())
      .then((b) => setRecordedAudioBlob(b))
      .catch(() => {});
  };

  // Trigger Voice Cloning Synthesis
  const handleCloneAndSpeak = async () => {
    const audioBlobToUse = inputMode === 'record' ? recordedAudioBlob : uploadedFile;

    if (!audioBlobToUse && !recordedAudioUrl) {
      setErrorMsg('Please record your voice or upload an audio sample first.');
      return;
    }

    if (!scriptText.trim()) {
      setErrorMsg('Please enter a script text for the cloned voice to speak.');
      return;
    }

    setIsCloning(true);
    setCloneProgress(8);
    setCloneStatusText(`Analyzing ${gender} vocal timbre and ${locale} accent...`);
    setErrorMsg(null);

    const steps = [
      { progress: 25, text: `Matching ${gender} acoustic timbre & pitch spectrum...` },
      { progress: 50, text: `Extracting vocal cadence and ${locale} pronunciation...` },
      { progress: 75, text: 'Synthesizing target phonemes in cloned voice...' },
      { progress: 92, text: 'Rendering high-definition cloned audio stream...' },
    ];
    let stepIndex = 0;

    progressTimerRef.current = setInterval(() => {
      if (stepIndex < steps.length) {
        setCloneProgress(steps[stepIndex].progress);
        setCloneStatusText(steps[stepIndex].text);
        stepIndex++;
      }
    }, 450);

    try {
      const formData = new FormData();
      if (audioBlobToUse) {
        formData.append('audio', audioBlobToUse, 'voice-sample.wav');
      } else if (recordedAudioUrl) {
        const fetchedBlob = await fetch(recordedAudioUrl).then((r) => r.blob());
        formData.append('audio', fetchedBlob, 'voice-sample.wav');
      }
      formData.append('text', scriptText.trim());
      formData.append('voiceName', voiceName.trim() || 'My Voice Clone');
      formData.append('gender', gender);
      formData.append('locale', locale);
      formData.append('tone', tone);

      const response = await fetch('/api/clone', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Voice cloning failed.');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setCloneProgress(100);
      setCloneStatusText('Voice cloned successfully!');

      // Save to Cloned Generation History
      const historyItem: ClonedHistoryItem = {
        id: Date.now().toString(),
        voiceName: voiceName.trim() || 'My Voice Clone',
        text: scriptText.trim(),
        audioUrl,
        timestamp: Date.now(),
        gender,
        locale,
      };

      setClonedHistory((prev) => {
        const updated = [historyItem, ...prev.slice(0, 19)];
        try {
          localStorage.setItem('empirenexs_cloned_history', JSON.stringify(updated));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
        return updated;
      });

      setTimeout(() => {
        setClonedAudioUrl(audioUrl);
        setIsCloning(false);
      }, 400);
    } catch (err: unknown) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      console.error('Cloning error:', err);
      setErrorMsg((err as Error)?.message || 'Voice cloning synthesis failed.');
      setIsCloning(false);
    }
  };

  const togglePlayCloned = () => {
    if (!clonedAudioRef.current) return;
    if (isPlayingCloned) {
      clonedAudioRef.current.pause();
      setIsPlayingCloned(false);
    } else {
      clonedAudioRef.current.play();
      setIsPlayingCloned(true);
    }
  };

  const handleClonedSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentClonedTime(time);
    if (clonedAudioRef.current) clonedAudioRef.current.currentTime = time;
  };

  const copyAudioLink = () => {
    if (!clonedAudioUrl) return;
    navigator.clipboard.writeText(clonedAudioUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setClonedHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem('empirenexs_cloned_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setClonedHistory([]);
    try {
      localStorage.removeItem('empirenexs_cloned_history');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold w-fit">
          <Dna className="w-3.5 h-3.5" />
          <span>EmpireNexs Voice AI</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Instant Voice Cloning Studio
        </h2>
        <p className="text-sm text-slate-600">
          Clone any male or female voice with authentic accent matching. Save voice profiles and track your generated history.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="hover:text-rose-900 font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Voice Sample, Speaker Settings & Saved Clones (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-brand-600" />
                Step 1: Voice Sample
              </h3>

              {/* Mode Toggle */}
              <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('record')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    inputMode === 'record'
                      ? 'bg-white text-brand-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Record Mic
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    inputMode === 'upload'
                      ? 'bg-white text-brand-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* RECORDING MODE */}
            {inputMode === 'record' ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-4 text-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 relative z-10 hover:scale-105 transition-all"
                      >
                        <Square className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                    <span className="font-mono text-sm font-bold text-rose-600 animate-pulse">
                      Recording: 0:{recordingTime < 10 ? `0${recordingTime}` : recordingTime} / 0:30
                    </span>
                    <p className="text-xs text-slate-500">
                      Speak clearly into your microphone... Click square when done.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={startRecording}
                      className="w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <span className="text-xs font-bold text-slate-800">
                      Click to Record Audio Sample
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Record 5 to 15 seconds of clean speech in a quiet room for realistic clone fidelity.
                    </p>
                  </div>
                )}

                {recordedAudioUrl && !isRecording && (
                  <div className="w-full pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <audio src={recordedAudioUrl} controls className="w-full h-9" />
                    <button
                      type="button"
                      onClick={() => {
                        setRecordedAudioBlob(null);
                        setRecordedAudioUrl(null);
                      }}
                      title="Clear Recording"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* UPLOAD MODE */
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center gap-3 text-center">
                <input
                  type="file"
                  id="voice-file-input"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="voice-file-input"
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-brand-600 hover:border-brand-500 hover:bg-brand-50/50 cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6" />
                </label>
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="voice-file-input"
                    className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                  >
                    {uploadedFile ? uploadedFile.name : 'Upload voice sample file'}
                  </label>
                  <span className="text-[11px] text-slate-400">
                    MP3, WAV, M4A up to 20MB (5s – 30s recommended)
                  </span>
                </div>

                {uploadedAudioUrl && (
                  <div className="w-full pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <audio src={uploadedAudioUrl} controls className="w-full h-9" />
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadedAudioUrl(null);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SPEAKER CHARACTERISTICS (Crucial: Gender, Accent & Timbre) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                Speaker Characteristics
              </span>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Voice Gender
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Male', 'Female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        gender === g
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{g === 'Male' ? '👨 Male' : '👩 Female'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent / Language Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Native Accent / Language
                </label>
                <select
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-600"
                >
                  <option value="ur-PK">Urdu (Pakistan) - اردُو</option>
                  <option value="en-PK">English (Pakistan / South Asia)</option>
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="hi-IN">Hindi (India) - हिन्दी</option>
                  <option value="ar-SA">Arabic (Saudi Arabia) - العربية</option>
                  <option value="es-ES">Spanish (Spain)</option>
                </select>
              </div>

              {/* Vocal Tone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Vocal Pitch / Timbre
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:border-brand-600"
                >
                  <option value="natural">Natural Balance</option>
                  <option value="deep">Deep / Authoritative Pitch</option>
                  <option value="warm">Warm &amp; Conversational</option>
                  <option value="energetic">Bright &amp; Energetic</option>
                </select>
              </div>
            </div>

            {/* Voice Profile Name & Save to Library Button */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Voice Profile Name
                </label>
                <input
                  type="text"
                  value={voiceName}
                  onChange={(e) => setVoiceName(e.target.value)}
                  placeholder="e.g. Waqas Gill Official, Host Voice"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all font-medium"
                />
              </div>

              {(recordedAudioUrl || uploadedAudioUrl) && (
                <button
                  type="button"
                  onClick={handleSaveCloneToLibrary}
                  className="py-2.5 px-4 rounded-xl border border-brand-200 bg-brand-50/60 hover:bg-brand-100/70 text-brand-700 text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Save This Clone to Library</span>
                </button>
              )}

              {cloneSavedNotice && (
                <div className="text-center text-xs font-semibold text-emerald-600 animate-in fade-in flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Saved to your Cloned Voices Library!</span>
                </div>
              )}
            </div>
          </div>

          {/* Saved Clones Library Panel */}
          {savedClones.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Dna className="w-3.5 h-3.5 text-brand-600" />
                  Your Saved Clones ({savedClones.length})
                </h4>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {savedClones.map((clone) => {
                  const isSelected = selectedCloneId === clone.id;
                  return (
                    <div
                      key={clone.id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {clone.name}
                          </p>
                          <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-slate-200 text-slate-700">
                            {clone.gender}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{clone.date} • {clone.locale}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUseSavedClone(clone)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-brand-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Use Voice'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClone(clone.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Script, Generation & Cloned History (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Step 2: Target Script
            </h3>

            <div className="relative">
              <textarea
                rows={5}
                disabled={isCloning}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Enter text you want the cloned voice to speak..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm leading-relaxed placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all resize-y"
              />
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400 font-mono">
                <span>{scriptText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>{scriptText.length} characters</span>
              </div>
            </div>

            {/* PROGRESS BAR WITH PERCENTAGE & STATUS */}
            {isCloning && (
              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col gap-2.5 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-brand-900">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
                    <span>{cloneStatusText}</span>
                  </div>
                  <span className="font-mono text-brand-700 font-extrabold text-sm">
                    {cloneProgress}%
                  </span>
                </div>

                <div className="w-full h-3 bg-brand-100 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${cloneProgress}%` }}
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              disabled={isCloning || (!recordedAudioBlob && !uploadedFile && !recordedAudioUrl)}
              onClick={handleCloneAndSpeak}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Synthesizing Cloned Voice ({cloneProgress}%)...</span>
                </>
              ) : (
                <>
                  <Dna className="w-5 h-5" />
                  <span>Clone Voice &amp; Generate Speech</span>
                </>
              )}
            </button>
          </div>

          {/* GENERATED AUDIO PLAYER WITH DIGITAL LIVE CLOCK */}
          {clonedAudioUrl && (
            <div className="bg-white rounded-3xl border border-brand-200 p-6 shadow-md shadow-brand-500/5 flex flex-col gap-4 animate-in fade-in">
              <audio
                ref={clonedAudioRef}
                src={clonedAudioUrl}
                onTimeUpdate={() => {
                  if (clonedAudioRef.current) setCurrentClonedTime(clonedAudioRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (clonedAudioRef.current) setClonedDuration(clonedAudioRef.current.duration);
                }}
                onEnded={() => setIsPlayingCloned(false)}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Cloned Speech Audio Ready
                    </h4>
                    <p className="text-xs text-slate-500">{voiceName} • {gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title="Copy Audio Link"
                    onClick={copyAudioLink}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <a
                    href={clonedAudioUrl}
                    download={`cloned-${voiceName.toLowerCase().replace(/\s+/g, '-')}.mp3`}
                    className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Cloned MP3</span>
                  </a>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="flex flex-col gap-2 pt-2">
                <input
                  type="range"
                  min={0}
                  max={clonedDuration || 1}
                  step={0.01}
                  value={currentClonedTime}
                  onChange={handleClonedSeek}
                  className="w-full"
                />

                {/* DIGITAL LIVE CLOCK WITH MINUTES & SECONDS */}
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-50 border border-brand-200 text-brand-700 shadow-xs">
                    <span className={`w-2 h-2 rounded-full bg-brand-600 ${isPlayingCloned ? 'animate-ping' : ''}`} />
                    <span>Current: {formatTime(currentClonedTime)}</span>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-600">
                    <span>Duration: {formatTime(clonedDuration)}</span>
                  </div>
                </div>
              </div>

              {/* Play / Pause Bar with Waveform visualizer */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={togglePlayCloned}
                  className="w-12 h-12 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isPlayingCloned ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex items-end gap-1 h-9 bg-slate-50 rounded-2xl px-3 py-1 border border-slate-200/80">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${20 + (i % 8) * 11}%` }}
                      className={`w-full rounded-full transition-all ${
                        isPlayingCloned ? 'bg-brand-600 animate-pulse' : 'bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CLONED GENERATION HISTORY PANEL */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cloned Speech History ({clonedHistory.length})
                </h3>
              </div>

              {clonedHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>

            {clonedHistory.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-400 text-xs">
                No cloned generations yet. When you generate speech, it will be saved here for instant replay and download.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {clonedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        setClonedAudioUrl(item.audioUrl);
                        setScriptText(item.text);
                        setVoiceName(item.voiceName);
                      }}
                    >
                      <p className="text-xs text-slate-900 truncate font-semibold group-hover:text-brand-600 transition-colors">
                        &ldquo;{item.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 text-brand-700 font-mono font-semibold">
                          <Volume2 className="w-3 h-3" />
                          {item.voiceName} ({item.gender})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Play cloned audio"
                        onClick={() => {
                          setClonedAudioUrl(item.audioUrl);
                          setScriptText(item.text);
                          setVoiceName(item.voiceName);
                        }}
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-brand-600 hover:text-white text-slate-600 transition-colors shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={item.audioUrl}
                        download={`cloned-${item.voiceName.toLowerCase().replace(/\s+/g, '-')}-${item.timestamp}.mp3`}
                        title="Download MP3"
                        className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        title="Remove"
                        onClick={() => handleDeleteHistoryItem(item.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
