/**
 * VisionSentinel AI - Evaluation & Precision Benchmark Lab
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React, { useState } from 'react';
import {
  AnalysisResult,
  EvaluationMetrics,
  GroundTruthAnnotation,
} from '../types';
import { computeEvaluationMetrics, downloadJsonFile } from '../services/apiClient';
import {
  BarChart3,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Sliders,
  Scale,
} from 'lucide-react';

interface EvaluationLabViewProps {
  analysis: AnalysisResult | null;
  groundTruthList: GroundTruthAnnotation[];
  onUpdateGroundTruth: (list: GroundTruthAnnotation[]) => void;
  onNavigateToAnalysis: () => void;
}

export const EvaluationLabView: React.FC<EvaluationLabViewProps> = ({
  analysis,
  groundTruthList,
  onUpdateGroundTruth,
  onNavigateToAnalysis,
}) => {
  const [toleranceSeconds, setToleranceSeconds] = useState(1.0);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // New GT form
  const [newTimestamp, setNewTimestamp] = useState('2.0');
  const [newLabel, setNewLabel] = useState('Perimeter Intrusion');
  const [newNotes, setNewNotes] = useState('');

  const handleAddGroundTruth = () => {
    const ts = parseFloat(newTimestamp);
    if (isNaN(ts) || ts < 0) return;

    const newAnnotation: GroundTruthAnnotation = {
      id: `gt_${Date.now()}`,
      timestamp_seconds: ts,
      duration_seconds: 1.0,
      label: newLabel.trim() || 'Custom Anomaly',
      notes: newNotes.trim() || undefined,
    };

    onUpdateGroundTruth([...groundTruthList, newAnnotation]);
    setNewNotes('');
  };

  const handleRemoveGroundTruth = (id: string) => {
    onUpdateGroundTruth(groundTruthList.filter((g) => g.id !== id));
  };

  const handleRunEvaluation = async () => {
    if (!analysis) {
      setEvaluationError('Please ingest and analyze a video first.');
      return;
    }

    setEvaluationError(null);
    setIsEvaluating(true);

    try {
      const res = await computeEvaluationMetrics({
        detectedEvents: analysis.events,
        groundTruth: groundTruthList,
        toleranceSeconds,
      });

      setMetrics(res);
    } catch (err: any) {
      setEvaluationError(err.message || 'Evaluation computation failed.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#070707]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202020] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#F5C542]" />
              <span>Evaluation &amp; Precision Benchmark Lab</span>
            </h1>
            {analysis?.sourceType === 'real_world_upload' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#24D18B]/15 text-[#24D18B] border border-[#24D18B]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#24D18B] animate-pulse" />
                REAL-WORLD FOOTAGE
              </span>
            ) : analysis?.sourceType === 'synthetic_benchmark' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#F5C542]/15 text-[#F5C542] border border-[#8C6A16]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                SYNTHETIC BENCHMARK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#151515] text-[#A1A1AA] border border-[#202020]">
                NO ACTIVE DATASET
              </span>
            )}
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Reproducible validation for OpenCV AI Competition 2026. Computes verified TP, FP, FN, Precision, Recall, and F1.
          </p>
        </div>

        {metrics && (
          <button
            onClick={() =>
              downloadJsonFile(
                `evaluation_metrics_${analysis?.analysis_id || 'test'}.json`,
                {
                  metrics,
                  analysisConfig: analysis?.config,
                  opencvVersion: analysis?.opencv_version,
                  groundTruth: groundTruthList,
                  datasetProvenance: analysis?.sourceType || 'unknown',
                  evaluatedAt: new Date().toISOString(),
                }
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all cursor-pointer shadow-[0_0_12px_rgba(245,197,66,0.25)]"
          >
            <Download className="w-3.5 h-3.5 text-[#070707]" />
            <span>Export Evaluation JSON</span>
          </button>
        )}
      </div>

      {evaluationError && (
        <div className="p-4 bg-[#101010] border border-[#FF303B]/60 rounded-xl text-xs text-[#F5F5F5] flex items-start gap-2.5 shadow-[0_0_15px_rgba(255,48,59,0.12)]">
          <AlertCircle className="w-4 h-4 text-[#FF303B] shrink-0 mt-0.5" />
          <div>{evaluationError}</div>
        </div>
      )}

      {/* Honest Scientific Notice with Gold & Carbon styling */}
      <div className="p-4 bg-[#101010] border border-[#8C6A16]/50 rounded-xl flex items-start gap-3 text-xs text-[#A1A1AA] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <Scale className="w-4 h-4 text-[#F5C542] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-semibold text-[#F5F5F5]">
            Mathematical Evaluation Protocol &amp; Dataset Provenance
          </div>
          <div className="text-[11px] leading-relaxed">
            Metrics are calculated strictly against entered Ground Truth records using a temporal match window (±{toleranceSeconds}s).
            Zero simulated or fabricated numbers.
            {analysis?.sourceType === 'synthetic_benchmark' ? (
              <span className="text-[#F5C542] block mt-0.5">
                Currently evaluating against the Synthetic Benchmark stream. For complete competition verification, also ingest real-world camera footage to test against physical optical noise.
              </span>
            ) : analysis?.sourceType === 'real_world_upload' ? (
              <span className="text-[#24D18B] block mt-0.5">
                Currently evaluating against live user-uploaded real-world footage. Enter observed timestamps in the Ground Truth manager below to compute physical sensor accuracy.
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Grid: Ground Truth Manager & Benchmarking Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ground Truth Manager (6 cols) */}
        <div className="lg:col-span-6 bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-[#202020] pb-3">
            <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
              <span>Ground Truth Annotations ({groundTruthList.length})</span>
            </span>
            <span className="text-[11px] font-mono text-[#F5C542]">
              Gold Standard Events
            </span>
          </div>

          {/* Add annotation row */}
          <div className="p-3 bg-[#0D0D0D] rounded-lg border border-[#202020] space-y-3">
            <div className="text-xs font-semibold text-[#F5F5F5]">
              Add Ground Truth Marker:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">
                  Timestamp (seconds):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newTimestamp}
                  onChange={(e) => setNewTimestamp(e.target.value)}
                  className="w-full bg-[#151515] border border-[#202020] rounded p-2 text-xs text-[#F5F5F5] font-mono focus:outline-none focus:border-[#F5C542]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#A1A1AA] block mb-1">
                  Event Label:
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full bg-[#151515] border border-[#202020] rounded p-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-[#F5C542]"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAddGroundTruth}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#070707]" />
                <span>Add Ground Truth</span>
              </button>
            </div>
          </div>

          {/* Ground truth list */}
          <div className="divide-y divide-[#202020] max-h-64 overflow-y-auto scrollbar-thin">
            {groundTruthList.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#A1A1AA] italic">
                No ground truth markers added yet. Add markers above or load the synthetic benchmark video.
              </div>
            ) : (
              groundTruthList.map((gt) => (
                <div
                  key={gt.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#F5F5F5] flex items-center gap-2">
                      <span>{gt.label}</span>
                      <span className="font-mono text-[#F5C542] text-[10px] bg-[#070707] px-1.5 py-0.5 rounded border border-[#202020]">
                        @{gt.timestamp_seconds.toFixed(2)}s
                      </span>
                    </div>
                    {gt.notes && (
                      <div className="text-[11px] text-[#A1A1AA]">{gt.notes}</div>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveGroundTruth(gt.id)}
                    className="p-1 text-[#A1A1AA] hover:text-[#FF303B] transition-colors cursor-pointer"
                    title="Delete marker"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Execution & Mathematical Scoring (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between border-b border-[#202020] pb-3">
              <span>Benchmark Execution</span>
              <Sliders className="w-4 h-4 text-[#F5C542]" />
            </div>

            {/* Tolerance window control */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#F5F5F5]">
                <span>Temporal Tolerance Window (±Δt):</span>
                <span className="font-mono text-[#F5C542] font-bold">
                  ±{toleranceSeconds.toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={toleranceSeconds}
                onChange={(e) => setToleranceSeconds(parseFloat(e.target.value))}
                className="w-full accent-[#F5C542] bg-[#202020] h-1.5 rounded cursor-pointer"
              />
              <p className="text-[10px] text-[#A1A1AA]">
                A detection at timestamp t_det is deemed a True Positive if an unmatched ground truth exists within [t_det - Δt, t_det + Δt].
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunEvaluation}
                disabled={isEvaluating || !analysis}
                className="w-full py-2.5 px-4 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] disabled:bg-[#151515] disabled:text-[#A1A1AA] rounded transition-all cursor-pointer shadow-[0_0_16px_rgba(245,197,66,0.25)]"
              >
                {isEvaluating ? 'Evaluating Metrics...' : 'Compute Evaluation Metrics'}
              </button>
            </div>
          </div>

          {/* Mathematical Metric Cards with Gold & Deep Red Accents */}
          {metrics && (
            <div className="bg-[#101010] border border-[#202020] border-t-2 border-t-[#F5C542] rounded-xl p-5 space-y-4 shadow-lg">
              <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2 flex items-center justify-between">
                <span>Confusion Matrix &amp; Verification Scores</span>
                <span className="font-mono text-[#24D18B] text-[10px] font-bold">VERIFIED</span>
              </div>

              {/* Confusion Matrix: Green for TP, Deep Red for FP, Gold for FN */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-[#0D0D0D] border border-[#24D18B]/50 rounded-lg">
                  <div className="text-[10px] text-[#24D18B] font-mono uppercase font-semibold">
                    True Positives (TP)
                  </div>
                  <div className="text-xl font-bold font-mono text-[#24D18B]">
                    {metrics.true_positives ?? (metrics as any).truePositives ?? 0}
                  </div>
                </div>

                <div className="p-3 bg-[#0D0D0D] border border-[#FF303B]/50 rounded-lg">
                  <div className="text-[10px] text-[#FF303B] font-mono uppercase font-semibold">
                    False Positives (FP)
                  </div>
                  <div className="text-xl font-bold font-mono text-[#FF303B]">
                    {metrics.false_positives ?? (metrics as any).falsePositives ?? 0}
                  </div>
                </div>

                <div className="p-3 bg-[#0D0D0D] border border-[#8C6A16]/50 rounded-lg">
                  <div className="text-[10px] text-[#F5C542] font-mono uppercase font-semibold">
                    False Negatives (FN)
                  </div>
                  <div className="text-xl font-bold font-mono text-[#FDE08B]">
                    {metrics.false_negatives ?? (metrics as any).falseNegatives ?? 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded-lg">
                  <div className="text-[10px] text-[#A1A1AA] font-mono">Precision</div>
                  <div className="text-lg font-bold font-mono text-[#F5F5F5]">
                    {metrics.precision !== null && metrics.precision !== undefined
                      ? `${(metrics.precision * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-[9px] text-[#8C6A16] mt-0.5 font-mono">TP / (TP + FP)</div>
                </div>

                <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded-lg">
                  <div className="text-[10px] text-[#A1A1AA] font-mono">Recall</div>
                  <div className="text-lg font-bold font-mono text-[#F5F5F5]">
                    {metrics.recall !== null && metrics.recall !== undefined
                      ? `${(metrics.recall * 100).toFixed(1)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-[9px] text-[#8C6A16] mt-0.5 font-mono">TP / (TP + FN)</div>
                </div>

                <div className="p-3 bg-[#0D0D0D] border border-[#202020] rounded-lg">
                  <div className="text-[10px] text-[#A1A1AA] font-mono">F1-Score</div>
                  <div className="text-lg font-bold font-mono text-[#F5C542]">
                    {(metrics.f1_score !== null && metrics.f1_score !== undefined)
                      ? metrics.f1_score.toFixed(3)
                      : (metrics as any).f1Score !== null && (metrics as any).f1Score !== undefined
                      ? (metrics as any).f1Score.toFixed(3)
                      : 'N/A'}
                  </div>
                  <div className="text-[9px] text-[#8C6A16] mt-0.5 font-mono">Harmonic Mean</div>
                </div>
              </div>

              <div className="text-[11px] text-[#A1A1AA] font-mono p-2.5 bg-[#0D0D0D] rounded border border-[#202020]">
                {metrics.mathematical_notes || (metrics as any).mathematicalNotes}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
