'use client';

import React from 'react';
import { Sliders, RotateCcw, Gauge, Music, Volume1 } from 'lucide-react';

interface ProsodyControlsProps {
  rate: number; // percentage, e.g. 0, -20, +30
  onChangeRate: (val: number) => void;
  pitch: number; // Hz, e.g. 0, -10, +20
  onChangePitch: (val: number) => void;
  volume: number; // percentage, e.g. 0, -10, +20
  onChangeVolume: (val: number) => void;
  onReset: () => void;
}

export function ProsodyControls({
  rate,
  onChangeRate,
  pitch,
  onChangePitch,
  volume,
  onChangeVolume,
  onReset,
}: ProsodyControlsProps) {
  const isDefault = rate === 0 && pitch === 0 && volume === 0;

  // Converts rate percentage (-50% to +100%) to multiplier string (0.5x to 2.0x)
  const rateMultiplier = ((100 + rate) / 100).toFixed(2);

  return (
    <div className="p-4 rounded-2xl bg-studio-900/60 border border-studio-800 flex flex-col gap-4">
      {/* Header and Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-studio-200">Voice Tuning & Prosody</h3>
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-studio-400 hover:text-studio-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed / Rate */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-studio-950/60 border border-studio-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-studio-300 font-medium flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Speed (Rate)
            </span>
            <span className="font-mono text-brand-300 font-semibold">{rateMultiplier}x</span>
          </div>

          <input
            type="range"
            min={-50}
            max={100}
            step={5}
            value={rate}
            onChange={(e) => onChangeRate(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center justify-between text-[10px] text-studio-500">
            <span>0.5x (Slow)</span>
            <span className="cursor-pointer hover:text-brand-400" onClick={() => onChangeRate(0)}>
              1.0x Normal
            </span>
            <span>2.0x (Fast)</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-studio-950/60 border border-studio-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-studio-300 font-medium flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-400" /> Pitch
            </span>
            <span className="font-mono text-brand-300 font-semibold">
              {pitch > 0 ? `+${pitch}` : pitch}Hz
            </span>
          </div>

          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={pitch}
            onChange={(e) => onChangePitch(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center justify-between text-[10px] text-studio-500">
            <span>-50Hz (Deeper)</span>
            <span className="cursor-pointer hover:text-brand-400" onClick={() => onChangePitch(0)}>
              0Hz Normal
            </span>
            <span>+50Hz (Higher)</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-studio-950/60 border border-studio-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-studio-300 font-medium flex items-center gap-1.5">
              <Volume1 className="w-3.5 h-3.5 text-emerald-400" /> Volume
            </span>
            <span className="font-mono text-brand-300 font-semibold">
              {volume > 0 ? `+${volume}` : volume}%
            </span>
          </div>

          <input
            type="range"
            min={-50}
            max={50}
            step={5}
            value={volume}
            onChange={(e) => onChangeVolume(Number(e.target.value))}
            className="w-full"
          />

          <div className="flex items-center justify-between text-[10px] text-studio-500">
            <span>-50% (Softer)</span>
            <span className="cursor-pointer hover:text-brand-400" onClick={() => onChangeVolume(0)}>
              Normal
            </span>
            <span>+50% (Louder)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
