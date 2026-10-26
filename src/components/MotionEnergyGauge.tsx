/**
 * VisionSentinel AI - Custom SVG Speedometer Arc Gauge
 * Visualizes real-time pixel differencing motion energy or composite forensic risk scoring
 * using Metallic Gold (#F5C542), Critical Red (#FF303B), and Restrained Green (#24D18B).
 */

import React from 'react';
import { Activity, ShieldAlert, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

interface MotionEnergyGaugeProps {
  energy: number; // 0.0 to 1.0 (or 0 to 100)
  mode?: 'motion' | 'risk';
  threshold?: number; // e.g. 0.035 for motion or 50 for risk
  peakEnergy?: number;
  isSceneCut?: boolean;
  activeBoxesCount?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const MotionEnergyGauge: React.FC<MotionEnergyGaugeProps> = ({
  energy,
  mode = 'motion',
  threshold = mode === 'risk' ? 0.50 : 0.035,
  peakEnergy,
  isSceneCut = false,
  activeBoxesCount = 0,
  label,
  size = 'md',
}) => {
  // Normalize value to 0.0 - 1.0
  const normalizedValue = Math.max(0, Math.min(1, energy > 1 ? energy / 100 : energy));
  const normalizedPeak = peakEnergy !== undefined 
    ? Math.max(0, Math.min(1, peakEnergy > 1 ? peakEnergy / 100 : peakEnergy))
    : normalizedValue;

  const displayLabel = label || (mode === 'risk' ? 'Forensic Risk Scoring' : 'Real-Time Motion Energy');

  // Geometry configuration for 220-degree sweep arc
  const radius = size === 'sm' ? 44 : size === 'lg' ? 68 : 56;
  const strokeWidth = size === 'sm' ? 7 : size === 'lg' ? 10 : 8;
  const center = radius + strokeWidth + 6;
  const svgSize = center * 2;

  // Sweep arc angles: 160 deg to 380 deg (220 deg total sweep)
  const startAngle = 160;
  const sweepAngle = 220;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (sweepAngle / 360) * circumference;
  
  // Filled arc progress
  const strokeDashoffset = arcLength * (1 - normalizedValue);

  // Determine state color and badge text
  let activeColor = '#24D18B'; // Emerald Green
  let statusText = mode === 'risk' ? 'SECURE' : 'NOMINAL';
  let statusBg = 'bg-[#24D18B]/10 text-[#24D18B] border-[#24D18B]/30';

  if (isSceneCut) {
    activeColor = '#FF303B'; // Critical Red
    statusText = 'SCENE CUT';
    statusBg = 'bg-[#FF303B]/20 text-[#FF303B] border-[#FF303B]/50 animate-pulse';
  } else if (mode === 'risk') {
    if (normalizedValue >= 0.70) {
      activeColor = '#FF303B'; // Critical Red
      statusText = 'CRITICAL THREAT';
      statusBg = 'bg-[#FF303B]/20 text-[#FF303B] border-[#FF303B]/50 animate-pulse';
    } else if (normalizedValue >= 0.35) {
      activeColor = '#F5C542'; // Metallic Gold
      statusText = 'ELEVATED RISK';
      statusBg = 'bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/50';
    } else {
      activeColor = '#24D18B'; // Emerald Green
      statusText = 'LOW ANOMALY';
      statusBg = 'bg-[#24D18B]/10 text-[#24D18B] border-[#24D18B]/30';
    }
  } else {
    // Motion mode
    if (normalizedValue >= 0.08 || activeBoxesCount > 2) {
      activeColor = '#FF303B'; // Critical Red
      statusText = 'HIGH ACTIVITY';
      statusBg = 'bg-[#FF303B]/20 text-[#FF303B] border-[#FF303B]/50';
    } else if (normalizedValue >= (threshold > 1 ? threshold / 100 : threshold)) {
      activeColor = '#F5C542'; // Metallic Gold
      statusText = 'MOTION TRIGGER';
      statusBg = 'bg-[#F5C542]/20 text-[#F5C542] border-[#F5C542]/50';
    }
  }

  // Calculate needle angle
  const needleAngle = startAngle + sweepAngle * normalizedValue;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = radius - 8;
  const needleX = center + needleLen * Math.cos(needleRad);
  const needleY = center + needleLen * Math.sin(needleRad);

  const gradientId = `gaugeGrad_${mode}_${size}`;
  const glowId = `gaugeGlow_${mode}_${size}`;

  return (
    <div className="bg-[#101010] border border-[#202020] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group transition-all duration-200 hover:border-[#F5C542]/40">
      {/* Ambient background glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-300 opacity-20"
        style={{ backgroundColor: activeColor }}
      />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F5F5]">
          {mode === 'risk' ? (
            <ShieldAlert className="w-3.5 h-3.5" style={{ color: activeColor }} />
          ) : (
            <Activity className="w-3.5 h-3.5" style={{ color: activeColor }} />
          )}
          <span>{displayLabel}</span>
        </div>
        <span
          className={`text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${statusBg}`}
        >
          {statusText}
        </span>
      </div>

      {/* SVG Arc Gauge and forensic readout */}
      <div className="flex items-center justify-around gap-2 pt-1">
        <div className="relative flex items-center justify-center">
          <svg
            width={svgSize}
            height={svgSize * 0.78}
            viewBox={`0 0 ${svgSize} ${svgSize * 0.85}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#24D18B" />
                <stop offset="50%" stopColor="#F5C542" />
                <stop offset="100%" stopColor="#FF303B" />
              </linearGradient>
              <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={activeColor} floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Background Track Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#202020"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(${startAngle} ${center} ${center})`}
            />

            {/* Threshold marker tick */}
            {(() => {
              const thNorm = Math.min(1, threshold > 1 ? threshold / 100 : threshold);
              const thAngle = startAngle + sweepAngle * thNorm;
              const thRad = (thAngle * Math.PI) / 180;
              const x1 = center + (radius - strokeWidth / 2 - 2) * Math.cos(thRad);
              const y1 = center + (radius - strokeWidth / 2 - 2) * Math.sin(thRad);
              const x2 = center + (radius + strokeWidth / 2 + 2) * Math.cos(thRad);
              const y2 = center + (radius + strokeWidth / 2 + 2) * Math.sin(thRad);
              return (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#F5C542"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              );
            })()}

            {/* Active Foreground Arc */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={isSceneCut ? '#FF303B' : `url(#${gradientId})`}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(${startAngle} ${center} ${center})`}
              filter={`url(#${glowId})`}
              className="transition-all duration-200 ease-out"
            />

            {/* Pivot center hub */}
            <circle cx={center} cy={center} r={5} fill="#070707" stroke={activeColor} strokeWidth="2" />

            {/* Speedometer needle */}
            <line
              x1={center}
              y1={center}
              x2={needleX}
              y2={needleY}
              stroke={activeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="transition-all duration-200 ease-out"
            />
          </svg>

          {/* Value Display overlay inside gauge arc */}
          <div className="absolute bottom-0 text-center font-mono">
            <div className="text-xl font-bold tracking-tight text-[#F5F5F5] leading-none">
              {(normalizedValue * 100).toFixed(1)}
              <span className="text-[10px] text-[#A1A1AA] font-normal ml-0.5">%</span>
            </div>
            <div className="text-[8px] uppercase tracking-wider text-[#A1A1AA] mt-1 font-mono">
              {mode === 'risk' ? 'ANOMALY RISK' : 'DISPLACEMENT'}
            </div>
          </div>
        </div>

        {/* Forensic Telemetry Matrix beside gauge */}
        <div className="flex flex-col justify-center space-y-1.5 font-mono text-[11px] min-w-[130px]">
          <div className="bg-[#151515] border border-[#202020] rounded px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[#A1A1AA] text-[10px]">
              {mode === 'risk' ? 'PEAK RISK:' : 'PEAK SPIKE:'}
            </span>
            <span className="text-[#F5C542] font-bold">
              {(normalizedPeak * 100).toFixed(1)}%
            </span>
          </div>

          <div className="bg-[#151515] border border-[#202020] rounded px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[#A1A1AA] text-[10px]">
              {mode === 'risk' ? 'THREAT LEVEL:' : 'CUT BOUNDARY:'}
            </span>
            <span className={isSceneCut || (mode === 'risk' && normalizedValue >= 0.7) ? 'text-[#FF303B] font-bold' : 'text-[#24D18B]'}>
              {isSceneCut ? 'TRIGGERED' : mode === 'risk' ? (normalizedValue >= 0.7 ? 'CRITICAL' : 'NOMINAL') : 'CLEAR'}
            </span>
          </div>

          <div className="bg-[#151515] border border-[#202020] rounded px-2.5 py-1.5 flex items-center justify-between">
            <span className="text-[#A1A1AA] text-[10px]">
              {mode === 'risk' ? 'MODEL AUDIT:' : 'ACTIVE ZONES:'}
            </span>
            <span className="text-[#F5F5F5] font-semibold">
              {mode === 'risk' ? 'CALIBRATED' : `${activeBoxesCount} ${activeBoxesCount === 1 ? 'zone' : 'zones'}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
