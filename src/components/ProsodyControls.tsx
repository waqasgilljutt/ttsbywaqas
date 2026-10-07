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
    <div className="studio-card p-5 flex flex-col gap-4">
      {/* Header and Reset Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Voice Tuning &amp; Prosody
          </h3>
        </div>

        {!isDefault && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors font-medium cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed / Rate */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-orange-400" /> Speed (Rate)
            </span>
            <span className="font-mono text-orange-400 font-bold">{rateMultiplier}x</span>
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>0.5x</span>
            <span className="cursor-pointer hover:text-orange-400" onClick={() => onChangeRate(0)}>
              1.0x Normal
            </span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-amber-400" /> Pitch
            </span>
            <span className="font-mono text-amber-400 font-bold">
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>-50Hz</span>
            <span className="cursor-pointer hover:text-amber-400" onClick={() => onChangePitch(0)}>
              0Hz
            </span>
            <span>+50Hz</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Volume1 className="w-3.5 h-3.5 text-emerald-400" /> Volume
            </span>
            <span className="font-mono text-emerald-400 font-bold">
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

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>-50%</span>
            <span className="cursor-pointer hover:text-emerald-400" onClick={() => onChangeVolume(0)}>
              Normal
            </span>
            <span>+50%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
