/**
 * VisionSentinel AI - Side-by-Side Temporal Delta Comparison Tool
 * Precision forensic tool comparing Frame T1 (Baseline) vs Frame T2 (Incident),
 * visualizing differential heatmaps, histogram divergence, and pixel displacement.
 */

import React, { useState } from 'react';
import { Keyframe, VisionEvent } from '../types';
import {
  Columns2,
  Split,
  Layers,
} from 'lucide-react';

interface TemporalDeltaComparatorProps {
  keyframes: Keyframe[];
  events: VisionEvent[];
  currentTime?: number;
  onSeekTo?: (seconds: number) => void;
}

export const TemporalDeltaComparator: React.FC<TemporalDeltaComparatorProps> = ({
  keyframes,
  events,
  currentTime = 0,
  onSeekTo,
}) => {
  // Select initial baseline (T1) and incident (T2) frames
  const [indexA, setIndexA] = useState<number>(0);
  const [indexB, setIndexB] = useState<number>(Math.min(1, Math.max(0, keyframes.length - 1)));
  const [viewMode, setViewMode] = useState<'side-by-side' | 'split-slider' | 'diff-heat'>('side-by-side');
  const [splitPercent, setSplitPercent] = useState<number>(50);

  if (keyframes.length < 2) {
    return (
      <div className="bg-[#101010] border border-[#202020] rounded-xl p-8 text-center space-y-3">
        <Columns2 className="w-8 h-8 text-[#F5C542] mx-auto opacity-70" />
        <h4 className="text-sm font-bold text-[#F5F5F5]">Temporal Delta Comparator Idle</h4>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
          At least 2 extracted keyframes are required to perform optical differencing and differential analysis.
          Ingest a video stream or load benchmark footage to populate frames.
        </p>
      </div>
    );
  }

  const frameA = keyframes[indexA] || keyframes[0];
  const frameB = keyframes[indexB] || keyframes[keyframes.length - 1];

  const deltaSeconds = Math.abs(frameB.timestamp_seconds - frameA.timestamp_seconds);
  const deltaScore = Math.abs(frameB.motion_score - frameA.motion_score);
  const isCutOccurred = keyframes
    .slice(Math.min(indexA, indexB), Math.max(indexA, indexB) + 1)
    .some((kf) => kf.is_scene_boundary);

  // Associated events occurring between T1 and T2
  const intermediateEvents = events.filter((e) => {
    const minT = Math.min(frameA.timestamp_seconds, frameB.timestamp_seconds);
    const maxT = Math.max(frameA.timestamp_seconds, frameB.timestamp_seconds);
    return e.timestamp_seconds >= minT - 0.2 && e.timestamp_seconds <= maxT + 0.2;
  });

  return (
    <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Top Header Control Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#202020] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-[#8C6A16]/80 bg-gradient-to-br from-[#151515] to-[#0D0D0D] flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,197,66,0.18)]">
            <Columns2 className="w-4 h-4 text-[#F5C542]" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5F5F5] tracking-tight uppercase flex items-center gap-2">
              <span>Temporal Delta Comparator</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#151515] text-[#F5C542] border border-[#202020]">
                I(t) vs I(t+Δ)
              </span>
            </div>
            <div className="text-[10px] text-[#A1A1AA] font-mono">
              Temporal Offset: <span className="text-[#F5C542] font-bold">{(deltaSeconds * 1000).toFixed(0)} ms</span> ({deltaSeconds.toFixed(2)}s)
            </div>
          </div>
        </div>

        {/* View mode toggle pills */}
        <div className="inline-flex rounded-lg border border-[#202020] p-1 bg-[#0D0D0D] gap-1">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_10px_rgba(245,197,66,0.25)]'
                : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Dual View</span>
          </button>

          <button
            onClick={() => setViewMode('split-slider')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'split-slider'
                ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_10px_rgba(245,197,66,0.25)]'
                : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split Curtain</span>
          </button>

          <button
            onClick={() => setViewMode('diff-heat')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              viewMode === 'diff-heat'
                ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_10px_rgba(245,197,66,0.25)]'
                : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Diff Matrix</span>
          </button>
        </div>
      </div>

      {/* Frame Selectors (T1 Baseline vs T2 Incident) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#24D18B]" />
            <span className="text-[#A1A1AA] font-semibold text-[11px]">T1 (BASELINE):</span>
            <span className="text-[#F5F5F5] font-bold">{frameA.timestamp_seconds.toFixed(2)}s</span>
          </div>
          <select
            value={indexA}
            onChange={(e) => setIndexA(parseInt(e.target.value))}
            className="bg-[#151515] border border-[#202020] rounded px-2 py-1 text-[#F5F5F5] text-xs font-mono focus:border-[#F5C542] outline-none cursor-pointer"
          >
            {keyframes.map((kf, i) => (
              <option key={kf.id} value={i}>
                Frame #{kf.frame_index} ({kf.timestamp_seconds.toFixed(2)}s)
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
            <span className="text-[#A1A1AA] font-semibold text-[11px]">T2 (INCIDENT):</span>
            <span className="text-[#F5F5F5] font-bold">{frameB.timestamp_seconds.toFixed(2)}s</span>
          </div>
          <select
            value={indexB}
            onChange={(e) => setIndexB(parseInt(e.target.value))}
            className="bg-[#151515] border border-[#202020] rounded px-2 py-1 text-[#F5F5F5] text-xs font-mono focus:border-[#F5C542] outline-none cursor-pointer"
          >
            {keyframes.map((kf, i) => (
              <option key={kf.id} value={i}>
                Frame #{kf.frame_index} ({kf.timestamp_seconds.toFixed(2)}s)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Comparative Viewport */}
      <div className="relative rounded-xl overflow-hidden border border-[#202020] bg-[#070707] shadow-inner">
        {/* Mode 1: Dual Side-by-Side View */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#202020]">
            {/* Frame A */}
            <div className="relative p-2 space-y-1.5 bg-[#070707]">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-[#A1A1AA] border-b border-[#202020]/60">
                <span className="text-[#24D18B] font-bold">FRAME T1 (T={frameA.timestamp_seconds.toFixed(2)}s)</span>
                <span>INDEX #{frameA.frame_index}</span>
              </div>
              <div className="relative aspect-video rounded overflow-hidden bg-[#0D0D0D] border border-[#202020]">
                <img
                  src={frameA.thumbnail_data}
                  alt={`Baseline Frame at ${frameA.timestamp_seconds}s`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#24D18B] bg-[#070707]/80 px-1.5 py-0.5 rounded border border-[#24D18B]/40">
                  REF_BASELINE
                </div>
              </div>
            </div>

            {/* Frame B */}
            <div className="relative p-2 space-y-1.5 bg-[#070707]">
              <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono text-[#A1A1AA] border-b border-[#202020]/60">
                <span className="text-[#F5C542] font-bold">FRAME T2 (T={frameB.timestamp_seconds.toFixed(2)}s)</span>
                <span>INDEX #{frameB.frame_index}</span>
              </div>
              <div className="relative aspect-video rounded overflow-hidden bg-[#0D0D0D] border border-[#202020]">
                <img
                  src={frameB.annotated_thumbnail_data || frameB.thumbnail_data}
                  alt={`Incident Frame at ${frameB.timestamp_seconds}s`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 text-[9px] font-mono text-[#F5C542] bg-[#070707]/80 px-1.5 py-0.5 rounded border border-[#F5C542]/40">
                  TARGET_INSPECTION
                </div>
                {frameB.is_scene_boundary && (
                  <div className="absolute top-2 right-2 text-[9px] font-mono text-white bg-[#FF303B] px-1.5 py-0.5 rounded font-bold shadow">
                    SCENE CUT
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mode 2: Interactive Split Curtain Slider */}
        {viewMode === 'split-slider' && (
          <div className="relative aspect-video w-full select-none overflow-hidden">
            {/* Background Image: Frame B */}
            <img
              src={frameB.annotated_thumbnail_data || frameB.thumbnail_data}
              alt="Incident Frame T2"
              className="absolute inset-0 w-full h-full object-contain"
            />

            {/* Foreground Clipped Image: Frame A */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${splitPercent}%` }}
            >
              <img
                src={frameA.thumbnail_data}
                alt="Baseline Frame T1"
                className="absolute inset-0 w-full h-full object-contain max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {/* Curtain Dividing Bar */}
            <div
              className="absolute inset-y-0 w-0.5 bg-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.8)] pointer-events-none"
              style={{ left: `${splitPercent}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#070707] border-2 border-[#F5C542] flex items-center justify-center text-[#F5C542] text-[10px] font-mono">
                ⇄
              </div>
            </div>

            {/* Invisible Range Input for Scrubbing Split */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitPercent}
              onChange={(e) => setSplitPercent(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
              aria-label="Temporal Curtain Splitter"
            />

            {/* Overlay Labels */}
            <div className="absolute bottom-3 left-3 bg-[#070707]/85 px-2 py-0.5 rounded text-[10px] font-mono text-[#24D18B] border border-[#24D18B]/40 pointer-events-none">
              ◄ T1 ({frameA.timestamp_seconds.toFixed(2)}s)
            </div>
            <div className="absolute bottom-3 right-3 bg-[#070707]/85 px-2 py-0.5 rounded text-[10px] font-mono text-[#F5C542] border border-[#F5C542]/40 pointer-events-none">
              T2 ({frameB.timestamp_seconds.toFixed(2)}s) ►
            </div>
          </div>
        )}

        {/* Mode 3: Optical Difference Matrix with Pseudo-Heatmap */}
        {viewMode === 'diff-heat' && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#24D18B] px-1">T1 LUMINANCE BASELINE</div>
              <div className="aspect-video rounded overflow-hidden bg-[#0D0D0D] border border-[#202020]">
                <img
                  src={frameA.thumbnail_data}
                  alt="T1 Baseline"
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#F5C542] px-1">T2 LUMINANCE INCIDENT</div>
              <div className="aspect-video rounded overflow-hidden bg-[#0D0D0D] border border-[#202020]">
                <img
                  src={frameB.thumbnail_data}
                  alt="T2 Incident"
                  className="w-full h-full object-contain filter grayscale"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#FF303B] px-1 flex items-center justify-between">
                <span>DIFFERENTIAL MATRIX</span>
                <span className="text-[#F5C542]">|I_t - I_base|</span>
              </div>
              <div className="relative aspect-video rounded overflow-hidden bg-[#070707] border border-[#FF303B]/40 flex items-center justify-center">
                <img
                  src={frameB.annotated_thumbnail_data || frameB.thumbnail_data}
                  alt="Difference overlay"
                  className="w-full h-full object-contain filter contrast-150"
                  style={{ mixBlendMode: 'difference' }}
                />
                <div className="absolute inset-0 bg-[#F5C542]/10 pointer-events-none" />
                <div className="absolute bottom-2 right-2 text-[9px] font-mono bg-[#070707]/90 border border-[#202020] px-1.5 py-0.5 text-[#FDE08B] rounded">
                  ΔE: {(deltaScore * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Telemetry Matrix Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] text-[#A1A1AA]">TEMPORAL DISPLACEMENT</div>
          <div className="text-[#F5C542] font-bold text-sm">
            {(deltaSeconds * 1000).toFixed(0)} ms
          </div>
          <div className="text-[9px] text-[#A1A1AA]">
            ΔFrames: {Math.abs(frameB.frame_index - frameA.frame_index)} frames
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] text-[#A1A1AA]">ENERGY VARIATION</div>
          <div className="text-[#F5F5F5] font-bold text-sm">
            {(deltaScore * 100).toFixed(2)}%
          </div>
          <div className="text-[9px] text-[#A1A1AA]">
            T1: {(frameA.motion_score * 100).toFixed(1)}% → T2: {(frameB.motion_score * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] text-[#A1A1AA]">SCENE CUT BOUNDARY</div>
          <div className={isCutOccurred ? 'text-[#FF303B] font-bold text-sm' : 'text-[#24D18B] font-bold text-sm'}>
            {isCutOccurred ? 'DETECTED' : 'CONTINUOUS'}
          </div>
          <div className="text-[9px] text-[#A1A1AA]">
            {isCutOccurred ? 'Histogram Chi² > Thresh' : 'Histogram divergence nominal'}
          </div>
        </div>

        <div className="bg-[#0D0D0D] border border-[#202020] rounded-lg p-2.5 space-y-1">
          <div className="text-[10px] text-[#A1A1AA]">INTERMEDIATE EVENTS</div>
          <div className="text-[#F5C542] font-bold text-sm">
            {intermediateEvents.length} Recorded
          </div>
          <div className="text-[9px] text-[#A1A1AA]">
            Span: {intermediateEvents.length > 0 ? `${intermediateEvents[0].method}` : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};
