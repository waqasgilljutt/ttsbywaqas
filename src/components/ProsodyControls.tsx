'use client';

import React from 'react';
import { Sliders, RotateCcw, Gauge, Music, Volume1 } from 'lucide-react';

interface ProsodyControlsProps {
  rate: number;
  onChangeRate: (val: number) => void;
  pitch: number;
  onChangePitch: (val: number) => void;
  volume: number;
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
  const rateMultiplier = ((100 + rate) / 100).toFixed(2);

  return (
    <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-4">
      {/* Header and Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Voice Tuning &amp; Prosody
          </h3>
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors font-medium"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed / Rate */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-600" /> Speed (Rate)
            </span>
            <span className="font-mono text-brand-700 font-bold">{rateMultiplier}x</span>
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

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>0.5x</span>
            <span className="cursor-pointer hover:text-brand-600" onClick={() => onChangeRate(0)}>
              1.0x Normal
            </span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-pink-600" /> Pitch
            </span>
            <span className="font-mono text-brand-700 font-bold">
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

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>-50Hz</span>
            <span className="cursor-pointer hover:text-brand-600" onClick={() => onChangePitch(0)}>
              0Hz
            </span>
            <span>+50Hz</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center gap-1.5">
              <Volume1 className="w-3.5 h-3.5 text-emerald-600" /> Volume
            </span>
            <span className="font-mono text-brand-700 font-bold">
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

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>-50%</span>
            <span className="cursor-pointer hover:text-brand-600" onClick={() => onChangeVolume(0)}>
              Normal
            </span>
            <span>+50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
