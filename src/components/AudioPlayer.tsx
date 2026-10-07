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
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
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
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const mm = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const ss = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${mm}:${ss}`;
  };

  if (!audioUrl && !isLoading) {
    return (
      <div className="studio-card p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400">
          <Disc3 className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Studio Audio Player Ready</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Enter your script above and click &quot;Generate Speech&quot; to synthesize audio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="studio-card p-6 flex flex-col gap-4">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Top row: Status & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold text-white">Generated Speech Ready</span>
          {voiceName && (
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-orange-500/15 text-orange-300 font-mono font-semibold border border-orange-500/30">
              {voiceName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Copy Audio Data / Link"
            onClick={handleCopyLink}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 transition-colors border border-white/[0.08] cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <a
            href={audioUrl || '#'}
            download={`ttsnexs-${voiceName || 'voice'}-${Date.now()}.mp3`}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            Download MP3
          </a>
        </div>
      </div>

      {/* Waveform representation */}
      <div className="flex flex-col gap-2 pt-2">
        <div className="flex items-end justify-between gap-1 h-12 px-2 bg-[#07080e]/60 rounded-2xl p-2 border border-white/10">
          {Array.from({ length: 36 }).map((_, i) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const barPos = i / 36;
            const isPassed = barPos <= progress;
            const baseHeights = [30, 45, 75, 55, 90, 60, 40, 85, 95, 70, 50, 65, 80, 45, 90, 100, 60, 40, 70, 85, 90, 65, 50, 75, 80, 60, 40, 55, 90, 75, 50, 65, 45, 80, 60, 35];
            const heightPercent = baseHeights[i % baseHeights.length];

            return (
              <div
                key={i}
                style={{ height: `${heightPercent}%` }}
                className={`w-full rounded-full transition-colors ${
                  isPassed ? 'bg-gradient-to-t from-orange-500 to-amber-400' : 'bg-white/15'
                } ${isPlaying && isPassed ? 'opacity-100 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'opacity-70'}`}
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

        {/* Time Labels with digital clock indicators */}
        <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-300 shadow-xs">
            <span className={`w-2 h-2 rounded-full bg-orange-400 ${isPlaying ? 'animate-ping' : ''}`} />
            <span>Current: {formatTime(currentTime)}</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400">
            <span>Duration: {formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Main Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Rewind 5s"
            onClick={() => seekRelative(-5)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            title="Forward 5s"
            onClick={() => seekRelative(5)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Multipliers */}
        <div className="flex items-center bg-white/[0.04] border border-white/10 p-1 rounded-xl text-xs">
          {[0.8, 1, 1.25, 1.5, 2].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setPlaybackRate(spd)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-mono text-xs font-semibold cursor-pointer ${
                playbackRate === spd
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
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
