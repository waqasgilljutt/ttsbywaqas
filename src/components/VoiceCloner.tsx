'use client';

import React, { useState, useRef } from 'react';
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
  RefreshCw,
} from 'lucide-react';

export function VoiceCloner() {
  // Input mode: 'record' | 'upload'
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

  // Synthesis parameters
  const [voiceName, setVoiceName] = useState('My Voice Clone');
  const [scriptText, setScriptText] = useState(
    'Hello! This is a demonstration of instant voice cloning powered by EmpireNexs. My vocal timbre and tone have been synthesized into natural synthetic speech.'
  );

  // Output states
  const [isCloning, setIsCloning] = useState(false);
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null);
  const [isPlayingCloned, setIsPlayingCloned] = useState(false);
  const clonedAudioRef = useRef<HTMLAudioElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Stop Mic Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  // Handle File Upload
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

  // Trigger Voice Cloning Synthesis
  const handleCloneAndSpeak = async () => {
    const audioBlobToUse =
      inputMode === 'record' ? recordedAudioBlob : uploadedFile;

    if (!audioBlobToUse) {
      setErrorMsg('Please record your voice or upload an audio sample first.');
      return;
    }

    if (!scriptText.trim()) {
      setErrorMsg('Please enter a script text for the cloned voice to speak.');
      return;
    }

    setIsCloning(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlobToUse, 'voice-sample.wav');
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
      setClonedAudioUrl(audioUrl);
    } catch (err: unknown) {
      console.error('Cloning error:', err);
      setErrorMsg((err as Error)?.message || 'Voice cloning synthesis failed.');
    } finally {
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
          Clone any voice with 5–15 seconds of clear speech. Record your mic or upload an audio file.
        </p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="hover:text-rose-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Voice Sample Input (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-brand-600" />
                Step 1: Voice Sample
              </h3>

              {/* Mode Toggle (Record vs Upload) */}
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
                    <span className="text-xs font-semibold text-slate-700">
                      Click to Record Audio Sample
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-xs">
                      Record 5 to 15 seconds of clean speaking in a quiet room for the best clone quality.
                    </p>
                  </div>
                )}

                {/* Recorded Audio Preview */}
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

            {/* Voice Name Label */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Voice Profile Name
              </label>
              <input
                type="text"
                value={voiceName}
                onChange={(e) => setVoiceName(e.target.value)}
                placeholder="e.g. Waqas Gill Voice, CEO Voice"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-brand-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Script & Generation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Step 2: Script to Speak in Cloned Voice
            </h3>

            {/* Textarea */}
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

            {/* Action Button */}
            <button
              type="button"
              disabled={isCloning || (!recordedAudioBlob && !uploadedFile)}
              onClick={handleCloneAndSpeak}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isCloning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Cloning Vocal Timbre &amp; Synthesizing...</span>
                </>
              ) : (
                <>
                  <Dna className="w-5 h-5" />
                  <span>Clone Voice &amp; Generate Speech</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Audio Card */}
          {clonedAudioUrl && (
            <div className="bg-white rounded-3xl border border-brand-200 p-6 shadow-md shadow-brand-500/5 flex flex-col gap-4 animate-in fade-in">
              <audio
                ref={clonedAudioRef}
                src={clonedAudioUrl}
                onEnded={() => setIsPlayingCloned(false)}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Cloned Speech Ready
                    </h4>
                    <p className="text-xs text-slate-500">{voiceName}</p>
                  </div>
                </div>

                <a
                  href={clonedAudioUrl}
                  download={`cloned-${voiceName.toLowerCase().replace(/\s+/g, '-')}.mp3`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Cloned MP3</span>
                </a>
              </div>

              {/* Player bar */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={togglePlayCloned}
                  className="w-11 h-11 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                >
                  {isPlayingCloned ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 flex items-end gap-1 h-8 bg-slate-50 rounded-xl px-3 py-1 border border-slate-200/80">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: `${20 + (i % 7) * 12}%` }}
                      className={`w-full rounded-full transition-all ${
                        isPlayingCloned ? 'bg-brand-500 animate-pulse' : 'bg-slate-300'
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
