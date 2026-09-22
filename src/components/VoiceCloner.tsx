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
  RotateCcw,
  Check,
  Share2,
} from 'lucide-react';

interface SavedClone {
  id: string;
  name: string;
  date: string;
  audioUrl: string;
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

  // Voice name and script
  const [voiceName, setVoiceName] = useState('My Voice Clone');
  const [scriptText, setScriptText] = useState(
    'Hello! This is an authentic demonstration of instant voice cloning by EmpireNexs. My vocal cadence and tone have been reproduced into natural speech.'
  );

  // Saved Clones Library
  const [savedClones, setSavedClones] = useState<SavedClone[]>([]);
  const [selectedCloneId, setSelectedCloneId] = useState<string | null>(null);
  const [cloneSavedNotice, setCloneSavedNotice] = useState(false);

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

  // Load saved clones from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('empirenexs_saved_clones');
      if (saved) {
        setSavedClones(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Format time in padded mm:ss
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mm}:${ss}`;
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

  // Delete saved clone
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

  // Select a saved clone
  const handleUseSavedClone = (clone: SavedClone) => {
    setSelectedCloneId(clone.id);
    setVoiceName(clone.name);
    setRecordedAudioUrl(clone.audioUrl);
    // Create dummy blob for pipeline
    fetch(clone.audioUrl)
      .then((r) => r.blob())
      .then((b) => setRecordedAudioBlob(b))
      .catch(() => {});
  };

  // Trigger Voice Cloning Synthesis with simulated incremental progress
  const handleCloneAndSpeak = async () => {
    const audioBlobToUse =
      inputMode === 'record' ? recordedAudioBlob : uploadedFile;

    if (!audioBlobToUse && !recordedAudioUrl) {
      setErrorMsg('Please record your voice or upload an audio sample first.');
      return;
    }

    if (!scriptText.trim()) {
      setErrorMsg('Please enter a script text for the cloned voice to speak.');
      return;
    }

    setIsCloning(true);
    setCloneProgress(5);
    setCloneStatusText('Initializing EmpireNexs neural voice cloner...');
    setErrorMsg(null);

    // Dynamic progress bar simulation
    const steps = [
      { progress: 20, text: 'Analyzing vocal timbre & frequency spectrum...' },
      { progress: 45, text: 'Extracting speaker pitch embeddings & formants...' },
      { progress: 70, text: 'Synthesizing target phonemes in cloned cadence...' },
      { progress: 90, text: 'Assembling high-definition audio stream...' },
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
          Clone any voice with 5–15 seconds of clear speech. Save voice profiles to library and synthesize anytime.
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
        {/* Left Column: Voice Sample & Saved Clones (5 cols) */}
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
                      ? 'bg-white text-brand-700 shadow-xs'
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
                      ? 'bg-white text-brand-700 shadow-xs'
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
                      Record 5 to 15 seconds of clean speaking in a quiet room for the best clone quality.
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
                  placeholder="e.g. Waqas Gill Voice, Commercial Voice"
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
                  Your Saved Voice Clones ({savedClones.length})
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
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {clone.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{clone.date}</p>
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

        {/* Right Column: Script & Synthesis with Progress Bar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col gap-5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Step 2: Script to Speak in Cloned Voice
            </h3>

            <div className="relative">
              <textarea
                rows={5}
                disabled={isCloning}
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Type what you want your cloned voice to say..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm leading-relaxed placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:bg-white transition-all resize-y"
              />
              <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400 font-mono">
                <span>{scriptText.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>{scriptText.length} characters</span>
              </div>
            </div>

            {/* PROGRESS BAR WITH PERCENTAGE & DYNAMIC STATUS */}
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

                {/* Animated progress bar fill */}
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

          {/* GENERATED AUDIO PLAYER WITH LIVE MINUTES & SECONDS */}
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
                    <p className="text-xs text-slate-500">{voiceName}</p>
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
        </div>
      </div>
    </div>
  );
}
