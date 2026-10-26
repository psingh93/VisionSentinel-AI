/**
 * VisionSentinel AI - Audit & Compliance Report Engine
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React, { useState } from 'react';
import {
  AgentInvestigation,
  AnalysisResult,
  EvaluationMetrics,
} from '../types';
import {
  downloadEventsCsv,
  downloadJsonFile,
  exportSignedReportBundle,
} from '../services/apiClient';
import {
  FileText,
  Download,
  Printer,
  FileCheck,
  Award,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { EmptyState } from './ui';

interface ReportsViewProps {
  analysis: AnalysisResult | null;
  agentInvestigation: AgentInvestigation | null;
  evaluationMetrics: EvaluationMetrics | null;
  onNavigateToAnalysis: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  analysis,
  agentInvestigation,
  evaluationMetrics,
  onNavigateToAnalysis,
}) => {
  const [signedReportId, setSignedReportId] = useState<string | null>(null);
  const [integrityHash, setIntegrityHash] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);

  if (!analysis) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 bg-[#070707]">
        <EmptyState
          icon={FileText}
          title="No Analysis Dataset to Report"
          description="Process a video first to generate an audit report. Reports compile sensor telemetry, agent findings, and reviewer audit actions into a verified dossier."
          actionLabel="Go to Video Analysis"
          onAction={onNavigateToAnalysis}
        />
      </div>
    );
  }

  const handleSignReport = async () => {
    setIsSigning(true);
    try {
      const payload = {
        analysisId: analysis.analysis_id,
        metadata: analysis.video_metadata,
        config: analysis.config,
        eventsCount: analysis.events.length,
        confirmedCount: analysis.events.filter((e) => e.reviewer_status === 'confirmed').length,
        evaluation: evaluationMetrics,
        agentSummary: agentInvestigation?.summary,
        timestamp: new Date().toISOString(),
      };

      const res = await exportSignedReportBundle(payload);
      setSignedReportId(res.reportId);
      setIntegrityHash(res.integrityHashSha256);
    } catch (e: any) {
      console.error('Failed to sign report:', e);
    } finally {
      setIsSigning(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const confirmedEvents = analysis.events.filter((e) => e.reviewer_status === 'confirmed');
  const rejectedEvents = analysis.events.filter((e) => e.reviewer_status === 'rejected');
  const pendingEvents = analysis.events.filter((e) => e.reviewer_status === 'pending');

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 bg-[#070707]">
      {/* Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202020] pb-5 no-print">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F5C542]" />
            <span>Forensic Audit &amp; Evaluation Report</span>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Standardized evidentiary report formatted for competition review and human oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSignReport}
            disabled={isSigning}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_16px_rgba(245,197,66,0.25)]"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#070707]" />
            <span>{isSigning ? 'Hashing...' : signedReportId ? 'Re-Sign Bundle' : 'Sign Audit Report'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] hover:border-[#F5C542]/40 rounded transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={() =>
              downloadEventsCsv(
                `report_${analysis.analysis_id}_events.csv`,
                analysis.events
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] hover:border-[#24D18B]/50 rounded transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#24D18B]" />
            <span>CSV</span>
          </button>

          <button
            onClick={() =>
              downloadJsonFile(
                `report_${analysis.analysis_id}.json`,
                {
                  reportId: signedReportId || `REP-${analysis.analysis_id}`,
                  sha256Hash: integrityHash,
                  analysis,
                  agentInvestigation,
                  evaluationMetrics,
                  exportedAt: new Date().toISOString(),
                }
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] hover:border-[#8C6A16] rounded transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Signing Seal (if generated) */}
      {signedReportId && (
        <div className="p-4 bg-[#101010] border border-[#8C6A16] rounded-xl flex items-center justify-between gap-4 text-xs font-mono shadow-[0_0_20px_rgba(245,197,66,0.15)]">
          <div className="space-y-0.5 min-w-0">
            <div className="text-[#F5C542] font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F5C542]" />
              <span>CRYPTOGRAPHICALLY SEALED DOSSIER: {signedReportId}</span>
            </div>
            <div className="text-[#A1A1AA] text-[11px] truncate">
              SHA-256 Digest: {integrityHash}
            </div>
          </div>
          <div className="text-[#FDE08B] text-[10px] shrink-0 text-right uppercase tracking-wider font-bold">
            OpenCV AI 2026 Audit Standard
          </div>
        </div>
      )}

      {/* Printable Report Document */}
      <div className="bg-[#101010] border border-[#202020] rounded-2xl p-8 space-y-8 print:bg-white print:text-black print:border-none print:p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
        {/* Document Header */}
        <div className="border-b border-[#202020] pb-6 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#F5C542] tracking-widest uppercase font-semibold">
              VisionSentinel AI · Forensic Verification Dossier
            </div>
            <h2 className="text-2xl font-extrabold text-[#F5F5F5] tracking-tight">
              Video Analytics &amp; Evidence Report
            </h2>
            <div className="text-xs text-[#A1A1AA]">
              Evaluation for OpenCV AI Competition 2026 · AWS-Ready Architecture
            </div>
          </div>

          <div className="text-right text-xs font-mono text-[#A1A1AA] space-y-1">
            <div>Analysis ID: <span className="text-[#F5C542] font-bold">{analysis.analysis_id}</span></div>
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Engine: {analysis.opencv_version}</div>
          </div>
        </div>

        {/* Section 1: Video Metadata & Processing Parameters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
              <span>1. Input Video Stream Specifications &amp; Dataset Provenance</span>
            </span>
            <span className="text-[10px] font-mono">
              {analysis.sourceType === 'real_world_upload' ? (
                <span className="text-[#24D18B] font-bold">PROVENANCE: REAL-WORLD CAMERA FOOTAGE</span>
              ) : (
                <span className="text-[#F5C542] font-bold">PROVENANCE: SYNTHETIC BENCHMARK VECTOR</span>
              )}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] block text-[11px]">Filename</span>
              <span className="font-semibold text-[#F5F5F5] truncate block font-mono text-[11px]">
                {analysis.video_metadata.filename}
              </span>
            </div>
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] block text-[11px]">Duration / Frames</span>
              <span className="font-semibold font-mono text-[#F5C542]">
                {analysis.video_metadata.duration_seconds}s ({analysis.video_metadata.total_frames} frames)
              </span>
            </div>
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] block text-[11px]">Frame Geometry</span>
              <span className="font-semibold font-mono text-[#F5F5F5]">
                {analysis.video_metadata.width} × {analysis.video_metadata.height} px
              </span>
            </div>
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] block text-[11px]">Processing Speed</span>
              <span className="font-semibold font-mono text-[#FDE08B]">
                {analysis.effective_fps} fps ({analysis.processing_time_ms}ms)
              </span>
            </div>
            <div className="p-3 bg-[#151515] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] block text-[11px]">Validation Mode</span>
              <span className={`font-semibold font-mono text-[11px] block ${analysis.sourceType === 'real_world_upload' ? 'text-[#24D18B]' : 'text-[#F5C542]'}`}>
                {analysis.sourceType === 'real_world_upload' ? 'Real-World Camera' : 'Synthetic Baseline'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Sensor Measurements (Objective) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
              <span>2. Measured Computer Vision Detections (Physical Telemetry)</span>
            </span>
            <span className="text-[10px] font-mono text-[#F5C542]">
              Total {analysis.events.length} Events Detected
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#202020] text-[#A1A1AA] font-mono text-[11px]">
                  <th className="py-2 pr-4">Event ID</th>
                  <th className="py-2 px-4">Timestamp</th>
                  <th className="py-2 px-4">Type</th>
                  <th className="py-2 px-4">Methodology</th>
                  <th className="py-2 px-4">Displacement</th>
                  <th className="py-2 pl-4">Reviewer Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#202020] font-mono">
                {analysis.events.slice(0, 8).map((e) => (
                  <tr key={e.id} className="text-[#A1A1AA] hover:bg-[#151515]">
                    <td className="py-2.5 pr-4 text-[#F5C542]">{e.id}</td>
                    <td className="py-2.5 px-4 font-bold text-[#F5F5F5]">{e.timestamp_seconds.toFixed(2)}s</td>
                    <td className="py-2.5 px-4 uppercase text-[11px] font-sans font-medium text-[#F5F5F5]">
                      {e.event_type.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-[#A1A1AA] truncate max-w-xs">
                      {e.method}
                    </td>
                    <td className="py-2.5 px-4 text-[#F5C542]">{e.motion_energy}</td>
                    <td className="py-2.5 pl-4 font-sans">
                      {e.reviewer_status === 'confirmed' ? (
                        <span className="text-[#24D18B] font-semibold">Confirmed</span>
                      ) : e.reviewer_status === 'rejected' ? (
                        <span className="text-[#FF303B] font-semibold">Rejected</span>
                      ) : (
                        <span className="text-[#A1A1AA] italic">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Model-Generated Interpretations (Probabilistic AI) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
            <span>3. Multimodal Agent Reasoning &amp; Uncertainty Ledger (Gemini 3.8 Flash)</span>
          </h3>

          {agentInvestigation ? (
            <div className="p-4 bg-[#070707] rounded-xl border border-[#202020] space-y-3 text-xs">
              <div className="flex items-center justify-between text-[#F5F5F5]">
                <span className="font-semibold">Executive Synthesis</span>
                <span className="font-mono text-[#F5C542]">
                  Certainty: {agentInvestigation.confidenceRating}
                </span>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed font-sans">
                {agentInvestigation.summary}
              </p>

              {agentInvestigation.hypotheses.length > 0 && (
                <div className="pt-2 border-t border-[#202020] space-y-2">
                  <div className="font-semibold text-[#F5F5F5]">
                    Plausible Hypotheses &amp; Human Action Required:
                  </div>
                  {agentInvestigation.hypotheses.map((h, i) => (
                    <div key={i} className="text-[#A1A1AA] text-[11px] space-y-0.5">
                      <div>• {h.hypothesis}</div>
                      <div className="text-[#F5C542] italic ml-3">
                        Required Audit: {h.requiredHumanAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-[#070707] rounded-lg border border-[#202020] text-xs text-[#A1A1AA] italic">
              No multimodal investigation executed for this dataset yet. Run AI Investigation in the tab above to append structured semantic reasoning.
            </div>
          )}
        </div>

        {/* Section 4: Human Reviewer Audit Summary (Authoritative) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
            <span>4. Human-in-the-Loop Review Summary &amp; Attestation</span>
          </h3>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#070707] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] text-[11px] block">Confirmed Events</span>
              <span className="text-lg font-bold font-mono text-[#24D18B]">
                {confirmedEvents.length}
              </span>
            </div>
            <div className="p-3 bg-[#070707] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] text-[11px] block">Rejected False Alarms</span>
              <span className="text-lg font-bold font-mono text-[#FF303B]">
                {rejectedEvents.length}
              </span>
            </div>
            <div className="p-3 bg-[#070707] rounded-lg border border-[#202020]">
              <span className="text-[#A1A1AA] text-[11px] block">Pending Verification</span>
              <span className="text-lg font-bold font-mono text-[#A1A1AA]">
                {pendingEvents.length}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Responsible AI & Governance Note */}
        <div className="pt-4 border-t border-[#202020] text-[11px] text-[#A1A1AA] space-y-1">
          <div className="font-semibold text-[#F5F5F5]">Responsible AI Compliance Declaration:</div>
          <div>
            VisionSentinel AI prohibits automated punitive actions, biometric facial identification, or inferences of guilt from appearance.
            All findings in this dossier represent machine-assisted perceptual triage and require licensed human oversight prior to consequential action.
          </div>
        </div>
      </div>
    </div>
  );
};
