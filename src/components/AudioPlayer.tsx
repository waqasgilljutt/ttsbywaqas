'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Disc3,
  FastForward,
} from 'lucide-react';

interface AudioPlayerProps {
  audioUrl: string | null;
  voiceName?: string;
  onDownload?: () => void;
  isLoading?: boolean;
}

export function AudioPlayer({ audioUrl, voiceName, onDownload, isLoading }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    // Reset player state when a new audio URL is generated
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Audio play failed:', err));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.muted = false;
      setIsMuted(false);
    } else {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else {
        setIsMuted(false);
      }
    }
  };

  const seekRelative = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
  };

  const handleCopyLink = () => {
    if (!audioUrl) return;
    navigator.clipboard.writeText(audioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!audioUrl && !isLoading) {
    return (
      <div className="p-8 rounded-2xl bg-studio-900/40 border border-studio-800/80 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-studio-950 border border-studio-800 flex items-center justify-center text-studio-500">
          <Disc3 className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-studio-300">Ready to Synthesize</h4>
          <p className="text-xs text-studio-500 mt-1 max-w-sm">
            Enter your script above and click &quot;Generate Speech&quot; to synthesize audio using Edge TTS neural voices.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-studio-900/90 border border-brand-500/20 shadow-xl shadow-brand-500/5 flex flex-col gap-4">
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top row: Voice info & quick actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-slate-200">Generated Audio Ready</span>
          {voiceName && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-studio-800 text-brand-300 font-mono">
              {voiceName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Copy / Share Button */}
          <button
            type="button"
            title="Copy Audio Data / Link"
            onClick={handleCopyLink}
            className="p-2 rounded-lg bg-studio-800 hover:bg-studio-700 text-studio-300 hover:text-white transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Download Button */}
          <a
            href={audioUrl || '#'}
            download={`tts-by-waqas-gill-${voiceName || 'voice'}-${Date.now()}.mp3`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            Download MP3
          </a>
        </div>
      </div>

      {/* Visual Waveform Mockup & Progress Scrubber */}
      <div className="flex flex-col gap-1.5 pt-2">
        <div className="flex items-end justify-between gap-1 h-10 px-1">
          {Array.from({ length: 36 }).map((_, i) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const barPos = i / 36;
            const isPassed = barPos <= progress;
            // pseudo randomized heights based on index
            const baseHeights = [30, 45, 75, 55, 90, 60, 40, 85, 95, 70, 50, 65, 80, 45, 90, 100, 60, 40, 70, 85, 90, 65, 50, 75, 80, 60, 40, 55, 90, 75, 50, 65, 45, 80, 60, 35];
            const heightPercent = baseHeights[i % baseHeights.length];

            return (
              <div
                key={i}
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-full transition-colors duration-150 ${
                  isPassed
                    ? 'bg-brand-400 shadow-sm shadow-brand-400/50'
                    : 'bg-studio-800 hover:bg-studio-700'
                } ${isPlaying && isPassed ? 'opacity-100' : 'opacity-70'}`}
              />
            );
          })}
        </div>

        {/* Progress Slider */}
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          className="w-full"
        />

        {/* Time Labels */}
        <div className="flex items-center justify-between text-[11px] font-mono text-studio-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-studio-800/80">
        {/* Play / Pause & Seek buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Rewind 5s"
            onClick={() => seekRelative(-5)}
            className="p-2 rounded-lg text-studio-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-xl bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 transition-all hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            title="Forward 5s"
            onClick={() => seekRelative(5)}
            className="p-2 rounded-lg text-studio-400 hover:text-white hover:bg-studio-800 transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center bg-studio-950 p-1 rounded-lg border border-studio-800 text-xs">
          {[0.8, 1, 1.25, 1.5, 2].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaybackRate(spd)}
              className={`px-2 py-0.5 rounded transition-colors font-mono text-[11px] ${
                playbackRate === spd
                  ? 'bg-brand-600 text-white font-medium'
                  : 'text-studio-400 hover:text-studio-200'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="text-studio-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}
