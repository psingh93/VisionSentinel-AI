/**
 * VisionSentinel AI - Overview Dashboard
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React from 'react';
import { AnalysisResult, NavigationTab } from '../types';
import {
  Video,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Activity,
  FileText,
  AlertTriangle,
  Eye,
  Crosshair,
  Search,
  Shield,
  Film,
  Cpu,
} from 'lucide-react';
import { PremiumMetricCard, GoldOutlinePanel, StatusIndicator, EmptyState } from './ui';

interface OverviewViewProps {
  analysis: AnalysisResult | null;
  onNavigate: (tab: NavigationTab) => void;
  onLoadBenchmark: () => void;
  isBenchmarkLoading: boolean;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analysis,
  onNavigate,
  onLoadBenchmark,
  isBenchmarkLoading,
}) => {
  const confirmedCount =
    analysis?.events.filter((e) => e.reviewer_status === 'confirmed').length || 0;
  const criticalCount =
    analysis?.events.filter((e) => e.event_type === 'rapid_motion' || e.event_type === 'scene_cut').length || 0;

  // Real metric values directly from application state
  const videosAnalyzedCount = analysis ? 1 : 0;
  const eventsDetectedCount = analysis ? analysis.events.length : 0;
  const evidenceFramesCount = analysis ? analysis.keyframes.length : 0;
  const investigationsCompletedCount = analysis && confirmedCount > 0 ? 1 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#070707]">
      {/* Top Command Center Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#121212] via-[#101010] to-[#0A0A0A] border border-[#202020] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {/* Subtle decorative gold edge accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#F5C542] to-transparent opacity-80" />

        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#F5C542] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] shadow-[0_0_8px_rgba(245,197,66,0.8)]" />
            <span>OPENCV AI COMPETITION 2026</span>
            <span aria-hidden="true" className="text-[#8C6A16]">·</span>
            <span>AWS POWERED COMMAND PLATFORM</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#F5F5F5] tracking-tight leading-tight">
              VisionSentinel <span className="gold-gradient-text">AI</span>
            </h1>
            <h2 className="text-sm md:text-base font-semibold text-[#D6A83E] tracking-tight">
              Agentic Video Intelligence &amp; Investigation
            </h2>
          </div>

          <p className="text-xs md:text-sm text-[#A1A1AA] leading-relaxed max-w-2xl">
            Couples verified computer vision algorithms (ITU-R BT.601 pixel differencing, 3×3 spatial filtering,
            and 24-bin Chi-Square color histogram distance) with server-side agentic reasoning (Gemini 3.8 Flash).
            Inspect forensic evidence, correlate motion telemetry, and maintain an immutable human-in-the-loop review ledger.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('analysis')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all duration-200 shadow-[0_0_16px_rgba(245,197,66,0.25)] cursor-pointer active:scale-[0.98]"
            >
              <Video className="w-4 h-4 text-[#070707]" />
              <span>Analyze Video</span>
            </button>

            <button
              onClick={() => onNavigate('evidence')}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#F5F5F5] bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542]/40 rounded transition-all duration-150 cursor-pointer shadow-sm"
            >
              <Search className="w-4 h-4 text-[#F5C542]" />
              <span>View Evidence</span>
            </button>

            <button
              onClick={onLoadBenchmark}
              disabled={isBenchmarkLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F5] bg-transparent hover:bg-[#151515] border border-[#202020] rounded transition-all duration-150 disabled:opacity-40 cursor-pointer"
            >
              <Crosshair className="w-4 h-4 text-[#D6A83E]" />
              <span>
                {isBenchmarkLoading ? 'Generating Benchmark...' : 'Load Synthetic Benchmark'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Professional Metrics Row - Actual Application State Only */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
            <span>Forensic Operations Telemetry</span>
          </h2>
          <span className="text-xs text-[#A1A1AA] font-mono">
            {analysis ? `Dataset: ${analysis.analysis_id}` : 'No dataset active'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PremiumMetricCard
            label="Videos Analyzed"
            value={videosAnalyzedCount}
            sublabel={analysis ? `${analysis.video_metadata.duration_seconds}s total duration` : 'Awaiting video input'}
            icon={Film}
            variant="gold"
            onClick={() => onNavigate('analysis')}
          />
          <PremiumMetricCard
            label="Events Detected"
            value={eventsDetectedCount}
            sublabel={
              analysis
                ? `${criticalCount} high anomaly · ${analysis.events.length - criticalCount} nominal`
                : 'Pixel differencing idle'
            }
            icon={Activity}
            variant={criticalCount > 0 ? 'red' : 'gold'}
            onClick={() => onNavigate('evidence')}
          />
          <PremiumMetricCard
            label="Evidence Frames Generated"
            value={evidenceFramesCount}
            sublabel={analysis ? `${analysis.keyframes.length} keyframes extracted` : '0 frames cached'}
            icon={Search}
            variant="gold"
            onClick={() => onNavigate('evidence')}
          />
          <PremiumMetricCard
            label="Investigations Completed"
            value={investigationsCompletedCount}
            sublabel={
              analysis
                ? `${confirmedCount} confirmed by reviewer`
                : 'Awaiting human review'
            }
            icon={CheckCircle2}
            variant={confirmedCount > 0 ? 'green' : 'neutral'}
            onClick={() => onNavigate('reports')}
          />
        </div>
      </div>

      {/* Large Central Recent-Analysis Panel */}
      <div className="bg-[#101010] border border-[#202020] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <div className="p-5 border-b border-[#202020] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Video className="w-4 h-4 text-[#F5C542]" />
            <h2 className="text-sm font-bold text-[#F5F5F5] tracking-tight">
              Recent Video Analysis Session
            </h2>
            {analysis?.sourceType === 'real_world_upload' ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#24D18B]/15 text-[#24D18B] border-[#24D18B]/40">
                REAL-WORLD USER FOOTAGE
              </span>
            ) : analysis?.sourceType === 'synthetic_benchmark' ? (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#F5C542]/15 text-[#F5C542] border-[#8C6A16]">
                SYNTHETIC BENCHMARK
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[#A1A1AA] px-2 py-0.5 rounded border border-[#202020] bg-[#151515]">
                AWAITING FOOTAGE
              </span>
            )}
          </div>

          {analysis && (
            <button
              onClick={() => onNavigate('analysis')}
              className="text-xs text-[#F5C542] hover:text-[#FDE08B] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Open Workstation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {analysis ? (
          <div className="p-6 space-y-6">
            {/* Video Metadata Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
                <div className="text-[10px] text-[#A1A1AA] uppercase">Source File</div>
                <div className="font-semibold text-[#F5F5F5] truncate mt-0.5">
                  {analysis.video_metadata.filename}
                </div>
              </div>
              <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
                <div className="text-[10px] text-[#A1A1AA] uppercase">Resolution &amp; Frames</div>
                <div className="font-semibold text-[#F5F5F5] mt-0.5">
                  {analysis.video_metadata.width}×{analysis.video_metadata.height} · {analysis.video_metadata.total_frames} frames
                </div>
              </div>
              <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
                <div className="text-[10px] text-[#A1A1AA] uppercase">Execution Speed</div>
                <div className="font-semibold text-[#F5C542] mt-0.5">
                  {analysis.effective_fps} FPS ({analysis.processing_time_ms}ms)
                </div>
              </div>
              <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
                <div className="text-[10px] text-[#A1A1AA] uppercase">Vision Engine</div>
                <div className="font-semibold text-[#24D18B] mt-0.5">
                  W3C Canvas Core (Active)
                </div>
              </div>
            </div>

            {/* Evidence Filmstrip Preview */}
            {analysis.keyframes.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider flex items-center justify-between">
                  <span>Captured Keyframes ({analysis.keyframes.length})</span>
                  <span className="text-[11px] font-mono text-[#F5C542]">Select to inspect</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {analysis.keyframes.slice(0, 6).map((kf) => (
                    <div
                      key={kf.id}
                      onClick={() => onNavigate('evidence')}
                      className="group relative aspect-video bg-[#070707] rounded-lg overflow-hidden border border-[#202020] hover:border-[#F5C542] transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(245,197,66,0.2)]"
                    >
                      <img
                        src={kf.thumbnail_data}
                        alt={`Keyframe at ${kf.timestamp_seconds}s`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                        <span className="text-[10px] font-mono text-[#F5F5F5] font-semibold">
                          {kf.timestamp_seconds.toFixed(2)}s
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Events Timeline */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Recent Detected Events ({analysis.events.length})
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin">
                {analysis.events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-[#151515] rounded-lg border border-[#202020] flex items-center justify-between gap-4 text-xs hover:border-[#F5C542]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                      <span className="font-mono text-[#F5C542] font-semibold">
                        t={evt.timestamp_seconds.toFixed(2)}s
                      </span>
                      <span className="font-medium text-[#F5F5F5] capitalize">
                        {evt.event_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[#A1A1AA] text-[11px] hidden sm:inline">
                        via {evt.method.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#A1A1AA]">
                        Displacement: {(evt.motion_energy * 100).toFixed(1)}%
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          evt.reviewer_status === 'confirmed'
                            ? 'bg-[#24D18B]/15 text-[#24D18B] border-[#24D18B]/40'
                            : evt.reviewer_status === 'rejected'
                            ? 'bg-[#FF303B]/15 text-[#FF303B] border-[#FF303B]/40'
                            : 'bg-[#101010] text-[#A1A1AA] border-[#202020]'
                        }`}
                      >
                        {evt.reviewer_status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Video}
              title="No Video Ingested Yet"
              description="Upload an MP4, WebM, or MOV video file to initiate the computer vision pipeline, or load the synthetic benchmark stream to evaluate baseline accuracy."
              actionLabel="Analyze Video Now"
              onAction={() => onNavigate('analysis')}
              secondaryActionLabel="Load Synthetic Benchmark"
              onSecondaryAction={onLoadBenchmark}
            />
          </div>
        )}
      </div>

      {/* Verified 4-Stage Computer Vision Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#101010] border border-[#202020] rounded-xl p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-[#202020] pb-3">
            <h2 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#F5C542]" />
              <span>Verified 4-Stage Computer Vision Pipeline</span>
            </h2>
            <span className="text-[10px] font-mono text-[#F5C542] uppercase tracking-wider">
              Zero Hallucinations
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            VisionSentinel AI decouples high-throughput video processing from semantic language reasoning,
            preventing hallucinated detections while maintaining auditable evidence trails.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020] space-y-1 hover:border-[#F5C542]/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#101010] border border-[#8C6A16] text-[#F5C542] font-mono text-xs flex items-center justify-center font-bold">
                  1
                </span>
                <span className="text-xs font-bold text-[#F5F5F5]">Stream Ingestion</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Decodes container streams (H.264/WebM/VP8), extracts framerate, and validates frame dimensions in client memory.
              </p>
            </div>

            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020] space-y-1 hover:border-[#F5C542]/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#101010] border border-[#8C6A16] text-[#F5C542] font-mono text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span className="text-xs font-bold text-[#F5F5F5]">Classical Vision Differencing</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Applies ITU-R BT.601 luminance conversion, 3×3 spatial smoothing, and 24-bin Chi-Square color histogram distance for scene cuts.
              </p>
            </div>

            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020] space-y-1 hover:border-[#F5C542]/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#101010] border border-[#8C6A16] text-[#F5C542] font-mono text-xs flex items-center justify-center font-bold">
                  3
                </span>
                <span className="text-xs font-bold text-[#F5F5F5]">Multimodal Agent Reasoning</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Sends extracted high-motion keyframes to server-side Gemini 3.8 Flash for structured observations and sensor limitations.
              </p>
            </div>

            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020] space-y-1 hover:border-[#F5C542]/40 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-[#101010] border border-[#8C6A16] text-[#F5C542] font-mono text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <span className="text-xs font-bold text-[#F5F5F5]">Human Audit Ledger</span>
              </div>
              <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                Forensic reviewers confirm or reject events. Outputs are cryptographically signed with SHA-256 digests.
              </p>
            </div>
          </div>
        </div>

        {/* Responsible AI & Governance */}
        <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5C542] uppercase tracking-wider border-b border-[#202020] pb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#F5C542]" />
            <span>Responsible AI Constitution</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            In accordance with OpenCV AI Competition guidelines and zero-trust security:
          </p>

          <ul className="text-xs text-[#A1A1AA] space-y-2 list-disc list-inside">
            <li>No facial recognition or identity tracking across feeds.</li>
            <li>No automated guilt inferences from visual appearance.</li>
            <li>Strict separation of objective CV metrics from AI hypotheses.</li>
            <li>Mandatory human confirmation before conclusions.</li>
          </ul>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('privacy')}
              className="text-xs text-[#F5C542] hover:text-[#FDE08B] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Review Privacy Governance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
