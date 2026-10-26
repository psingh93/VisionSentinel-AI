/**
 * VisionSentinel AI - Evidence Explorer & Reviewer Ledger
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React, { useState, useEffect } from 'react';
import {
  AnalysisResult,
  Keyframe,
  ReviewerStatus,
  VisionEvent,
} from '../types';
import {
  downloadEventsCsv,
  downloadJsonFile,
  askFrameForensicQuestion,
} from '../services/apiClient';
import { MotionEnergyGauge } from './MotionEnergyGauge';
import {
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Maximize2,
  Columns2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  Download,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
  Eye,
} from 'lucide-react';
import { EmptyState } from './ui';

interface EvidenceExplorerViewProps {
  analysis: AnalysisResult | null;
  onUpdateEventReviewStatus: (
    eventId: string,
    status: ReviewerStatus,
    notes?: string
  ) => void;
  onNavigateToAnalysis: () => void;
}

export const EvidenceExplorerView: React.FC<EvidenceExplorerViewProps> = ({
  analysis,
  onUpdateEventReviewStatus,
  onNavigateToAnalysis,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<VisionEvent | null>(
    analysis?.events[0] || null
  );
  const [reviewerNotesInput, setReviewerNotesInput] = useState('');
  const [frameViewMode, setFrameViewMode] = useState<'annotated' | 'raw'>('annotated');

  // Zoom / Inspection modal
  const [inspectingFrame, setInspectingFrame] = useState<Keyframe | null>(null);
  const [forensicQuestion, setForensicQuestion] = useState('');
  const [forensicAnswer, setForensicAnswer] = useState<string | null>(null);
  const [isForensicLoading, setIsForensicLoading] = useState(false);

  // Compare mode
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareFrameA, setCompareFrameA] = useState<Keyframe | null>(null);
  const [compareFrameB, setCompareFrameB] = useState<Keyframe | null>(null);

  // Sync reviewer notes input when selected event changes
  useEffect(() => {
    if (selectedEvent) {
      setReviewerNotesInput(selectedEvent.reviewer_notes || '');
    }
  }, [selectedEvent?.id]);

  if (!analysis || analysis.events.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 bg-[#070707]">
        <EmptyState
          icon={Search}
          title="No Evidence Ledger Active"
          description="Process a video stream or load the synthetic benchmark video in the Video Analysis tab to populate timestamped evidence records."
          actionLabel="Go to Video Analysis"
          onAction={onNavigateToAnalysis}
        />
      </div>
    );
  }

  // Filter events
  const filteredEvents = analysis.events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.event_type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || e.event_type === filterType;
    const matchesStatus =
      filterStatus === 'all' || e.reviewer_status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const selectedIndex = selectedEvent
    ? filteredEvents.findIndex((e) => e.id === selectedEvent.id)
    : -1;

  const handlePrevEvent = () => {
    if (selectedIndex > 0) {
      setSelectedEvent(filteredEvents[selectedIndex - 1]);
    }
  };

  const handleNextEvent = () => {
    if (selectedIndex < filteredEvents.length - 1) {
      setSelectedEvent(filteredEvents[selectedIndex + 1]);
    }
  };

  // Find supporting keyframe for selected event
  const supportingKeyframe =
    selectedEvent &&
    analysis.keyframes.find(
      (kf) =>
        Math.abs(kf.timestamp_seconds - selectedEvent.timestamp_seconds) <= 0.6
    );

  const handleAskForensic = async () => {
    if (!inspectingFrame || !inspectingFrame.thumbnail_data) return;
    setIsForensicLoading(true);
    setForensicAnswer(null);

    try {
      const res = await askFrameForensicQuestion({
        frameB64: inspectingFrame.thumbnail_data,
        question:
          forensicQuestion.trim() ||
          'Describe the visual components and any salient object bounding clusters visible in this frame.',
        timestamp: inspectingFrame.timestamp_seconds,
        frameIndex: inspectingFrame.frame_index,
      });

      setForensicAnswer(res.finding);
    } catch (err: any) {
      setForensicAnswer(`Inquiry failed: ${err.message}`);
    } finally {
      setIsForensicLoading(false);
    }
  };

  const openCompare = (kfA: Keyframe) => {
    setCompareFrameA(kfA);
    const other = analysis.keyframes.find((k) => k.id !== kfA.id) || kfA;
    setCompareFrameB(other);
    setIsCompareOpen(true);
  };

  const handleStatusChange = (status: ReviewerStatus) => {
    if (!selectedEvent) return;
    onUpdateEventReviewStatus(selectedEvent.id, status, reviewerNotesInput);
    setSelectedEvent({
      ...selectedEvent,
      reviewer_status: status,
      reviewer_notes: reviewerNotesInput,
    });
  };

  const handleSaveNotes = () => {
    if (!selectedEvent) return;
    onUpdateEventReviewStatus(selectedEvent.id, selectedEvent.reviewer_status, reviewerNotesInput);
    setSelectedEvent({
      ...selectedEvent,
      reviewer_notes: reviewerNotesInput,
    });
  };

  const downloadFrameImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#070707]">
      {/* Top Header & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202020] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C542] shadow-[0_0_8px_rgba(245,197,66,0.6)]" />
            <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
              Evidence Explorer &amp; Reviewer Ledger
            </h1>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Search, inspect, and audit extracted video events. Reviewers verify algorithmic triggers against ground evidence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() =>
              downloadEventsCsv(
                `evidence_${analysis.analysis_id}.csv`,
                analysis.events
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] hover:border-[#24D18B]/50 rounded transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#24D18B]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() =>
              downloadJsonFile(
                `evidence_${analysis.analysis_id}.json`,
                analysis
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all cursor-pointer shadow-[0_0_12px_rgba(245,197,66,0.25)]"
          >
            <FileCode className="w-3.5 h-3.5 text-[#070707]" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#101010] border border-[#202020] rounded-xl shadow-sm">
        <div className="flex items-center gap-2.5 flex-1 max-w-md bg-[#070707] border border-[#202020] rounded-lg px-3 py-2 focus-within:border-[#F5C542] transition-colors">
          <Search className="w-4 h-4 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search event ID, algorithm, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-[#F5F5F5] placeholder-[#A1A1AA]/60 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#A1A1AA] text-[11px] font-mono uppercase">Category:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#070707] border border-[#202020] text-[#F5F5F5] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#F5C542] cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="motion_burst">Motion Burst</option>
              <option value="scene_cut">Scene Cut</option>
              <option value="rapid_motion">Rapid Motion</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#A1A1AA] text-[11px] font-mono uppercase">Review:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#070707] border border-[#202020] text-[#F5F5F5] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#F5C542] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Audit</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="requires_review">Requires Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Event Ledger on Left, Detailed Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Event List (7 cols) */}
        <div className="lg:col-span-7 bg-[#101010] border border-[#202020] rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
          <div className="px-4 py-3 bg-[#151515] border-b border-[#202020] flex items-center justify-between text-xs font-semibold text-[#F5F5F5]">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
              <span>Event Stream ({filteredEvents.length})</span>
            </span>
            <span className="font-mono text-[#A1A1AA] text-[11px]">
              Total {analysis.events.length} records
            </span>
          </div>

          <div className="divide-y divide-[#202020] max-h-[640px] overflow-y-auto scrollbar-thin">
            {filteredEvents.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const isCritical = evt.event_type === 'scene_cut' || evt.motion_energy >= 0.08;
              const kf = analysis.keyframes.find(
                (k) => Math.abs(k.timestamp_seconds - evt.timestamp_seconds) <= 0.6
              );

              return (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`p-3.5 transition-all duration-150 cursor-pointer flex items-center justify-between gap-3.5 ${
                    isSelected
                      ? 'bg-[#151515] border-l-2 border-l-[#F5C542] shadow-[inset_0_0_12px_rgba(245,197,66,0.06)]'
                      : isCritical
                      ? 'hover:bg-[#151515] border-l-2 border-l-[#FF303B]/60'
                      : 'hover:bg-[#151515] border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {kf?.thumbnail_data ? (
                      <div className="relative shrink-0">
                        <img
                          src={kf.thumbnail_data}
                          alt="Event thumb"
                          className={`w-16 h-10 object-cover rounded border transition-colors ${
                            isSelected
                              ? 'border-[#F5C542]'
                              : isCritical
                              ? 'border-[#FF303B]/60'
                              : 'border-[#202020]'
                          }`}
                        />
                        {evt.event_type === 'scene_cut' && (
                          <span className="absolute bottom-0 right-0 bg-[#FF303B] text-white text-[8px] font-bold px-1 rounded-tl">
                            CUT
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded bg-[#070707] border border-[#202020] flex items-center justify-center shrink-0">
                        <Clock className="w-4 h-4 text-[#8C6A16]" />
                      </div>
                    )}

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-tight">
                          {evt.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] font-mono text-[#F5C542] font-semibold">
                          {evt.timestamp_seconds.toFixed(2)}s
                        </span>
                      </div>

                      <div className="text-[11px] text-[#A1A1AA] truncate font-sans">
                        {evt.method}
                      </div>

                      <div className="text-[10px] text-[#A1A1AA] font-mono flex items-center gap-2">
                        <span>Energy: <strong className="text-[#F5F5F5]">{evt.motion_energy}</strong></span>
                        <span>·</span>
                        <span>Clusters: <strong className="text-[#F5F5F5]">{evt.bounding_boxes.length}</strong></span>
                        {evt.reviewer_notes && (
                          <>
                            <span>·</span>
                            <span className="text-[#F5C542] flex items-center gap-0.5">
                              <MessageSquare className="w-2.5 h-2.5" /> Note
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-right space-y-1">
                    <div className="text-[11px] font-mono">
                      {evt.reviewer_status === 'confirmed' && (
                        <span className="text-[#24D18B] font-semibold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3 h-3 text-[#24D18B]" />
                          Confirmed
                        </span>
                      )}
                      {evt.reviewer_status === 'rejected' && (
                        <span className="text-[#FF303B] font-semibold flex items-center gap-1 justify-end">
                          <XCircle className="w-3 h-3 text-[#FF303B]" />
                          Rejected
                        </span>
                      )}
                      {evt.reviewer_status === 'requires_review' && (
                        <span className="text-[#F5C542] font-semibold flex items-center gap-1 justify-end">
                          <HelpCircle className="w-3 h-3 text-[#F5C542]" />
                          Flagged
                        </span>
                      )}
                      {evt.reviewer_status === 'pending' && (
                        <span className="text-[#A1A1AA] italic">Pending</span>
                      )}
                    </div>

                    <div className="text-[10px] text-[#A1A1AA] font-mono">
                      {evt.motion_energy ? `ΔE: ${evt.motion_energy}` : 'Measured'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Event Inspector & Review Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedEvent ? (
            <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono text-[#F5C542] font-semibold">
                    EVENT RECORD #{selectedEvent.id}
                  </div>
                  <h3 className="text-sm font-bold text-[#F5F5F5] capitalize">
                    {selectedEvent.event_type.replace('_', ' ')} at {selectedEvent.timestamp_seconds.toFixed(2)}s
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevEvent}
                    disabled={selectedIndex <= 0}
                    className="p-1 rounded bg-[#151515] hover:bg-[#202020] disabled:opacity-30 border border-[#202020] text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                    title="Previous Event"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextEvent}
                    disabled={selectedIndex >= filteredEvents.length - 1}
                    className="p-1 rounded bg-[#151515] hover:bg-[#202020] disabled:opacity-30 border border-[#202020] text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                    title="Next Event"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {supportingKeyframe && (
                    <button
                      onClick={() => setInspectingFrame(supportingKeyframe)}
                      className="p-1.5 rounded bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#8C6A16] text-[#F5C542] transition-colors cursor-pointer ml-1"
                      title="Zoom & Forensic Analysis"
                      aria-label="Zoom keyframe"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Supporting Frame Visual with Toggle between Annotated & Clean */}
              {supportingKeyframe ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
                    <span>Keyframe Snapshot</span>
                    <div className="inline-flex rounded border border-[#202020] p-0.5 bg-[#070707]">
                      <button
                        onClick={() => setFrameViewMode('annotated')}
                        className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                          frameViewMode === 'annotated'
                            ? 'bg-[#F5C542] text-[#070707] font-bold'
                            : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                        }`}
                      >
                        Annotated
                      </button>
                      <button
                        onClick={() => setFrameViewMode('raw')}
                        className={`px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                          frameViewMode === 'raw'
                            ? 'bg-[#F5C542] text-[#070707] font-bold'
                            : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                        }`}
                      >
                        Clean
                      </button>
                    </div>
                  </div>

                  <div className="relative rounded-lg overflow-hidden border border-[#202020] bg-[#070707] aspect-video">
                    <img
                      src={
                        frameViewMode === 'annotated'
                          ? supportingKeyframe.annotated_thumbnail_data || supportingKeyframe.thumbnail_data
                          : supportingKeyframe.thumbnail_data
                      }
                      alt="Supporting frame"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-[#070707]/90 border border-[#202020] text-[10px] font-mono text-[#A1A1AA] px-2 py-0.5 rounded">
                      t={supportingKeyframe.timestamp_seconds.toFixed(2)}s · {frameViewMode.toUpperCase()}
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          downloadFrameImage(
                            supportingKeyframe.thumbnail_data,
                            `frame_${supportingKeyframe.timestamp_seconds.toFixed(2)}s.png`
                          )
                        }
                        className="p-1 rounded bg-[#101010]/95 hover:bg-[#151515] text-[#A1A1AA] hover:text-[#F5F5F5] border border-[#202020] transition-colors cursor-pointer"
                        title="Download Frame"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => openCompare(supportingKeyframe)}
                        className="flex items-center gap-1.5 bg-[#101010]/95 hover:bg-[#151515] text-[#F5F5F5] text-[10px] font-mono px-2.5 py-1 rounded border border-[#8C6A16] transition-colors cursor-pointer shadow-md"
                      >
                        <Columns2 className="w-3 h-3 text-[#F5C542]" />
                        <span>Compare Diff</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#070707] rounded border border-[#202020] text-center text-xs text-[#A1A1AA]">
                  No direct keyframe snapshot at exact timestamp.
                </div>
              )}

              {/* Embedded Speedometer Arc Gauge */}
              <div className="pt-1">
                <MotionEnergyGauge
                  energy={selectedEvent.motion_energy}
                  threshold={0.035}
                  isSceneCut={selectedEvent.event_type === 'scene_cut'}
                  activeBoxesCount={selectedEvent.bounding_boxes.length}
                  label="Event Motion Energy"
                  size="sm"
                />
              </div>

              {/* Event Attributes Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#202020]">
                  <span className="text-[#A1A1AA]">Detection Method</span>
                  <span className="text-[#F5F5F5] font-medium text-right max-w-xs truncate">
                    {selectedEvent.method}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#202020]">
                  <span className="text-[#A1A1AA]">Contour Clusters</span>
                  <span className="text-[#F5F5F5] font-mono">
                    {selectedEvent.bounding_boxes.length} bounding regions
                  </span>
                </div>
                <div className="py-1">
                  <div className="text-[#A1A1AA] mb-1">Identified Limitations:</div>
                  <div className="p-2.5 bg-[#070707] rounded border border-[#202020] text-[#A1A1AA] text-[11px] leading-relaxed">
                    {selectedEvent.limitations}
                  </div>
                </div>
              </div>

              {/* Reviewer Audit Controls & Notes Input */}
              <div className="pt-2 border-t border-[#202020] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                    Human Reviewer Decision
                  </span>
                  <span className="text-[11px] font-mono text-[#F5C542]">
                    Current: {selectedEvent.reviewer_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className={`py-2 px-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedEvent.reviewer_status === 'confirmed'
                        ? 'bg-[#24D18B] text-[#070707] shadow-[0_0_15px_rgba(36,209,139,0.35)]'
                        : 'bg-[#151515] hover:bg-[#202020] text-[#A1A1AA] hover:text-[#24D18B] border border-[#202020]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('rejected')}
                    className={`py-2 px-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedEvent.reviewer_status === 'rejected'
                        ? 'bg-[#FF303B] text-white shadow-[0_0_15px_rgba(255,48,59,0.4)]'
                        : 'bg-[#151515] hover:bg-[#202020] text-[#A1A1AA] hover:text-[#FF303B] border border-[#202020]'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('requires_review')}
                    className={`py-2 px-2 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedEvent.reviewer_status === 'requires_review'
                        ? 'bg-[#F5C542] text-[#070707] shadow-[0_0_15px_rgba(245,197,66,0.35)]'
                        : 'bg-[#151515] hover:bg-[#202020] text-[#A1A1AA] hover:text-[#F5C542] border border-[#202020]'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Flag</span>
                  </button>
                </div>

                {/* Reviewer Audit Notes Input */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px] text-[#A1A1AA]">
                    <span>Audit Notes / Forensic Justification:</span>
                    <span className="font-mono text-[10px] text-[#8C6A16]">Reviewer Log</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Verified target entering from south camera blindspot..."
                      value={reviewerNotesInput}
                      onChange={(e) => setReviewerNotesInput(e.target.value)}
                      className="flex-1 bg-[#070707] border border-[#202020] rounded px-3 py-1.5 text-xs text-[#F5F5F5] placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#F5C542]"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 text-xs font-semibold text-[#F5F5F5] bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#8C6A16] rounded transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-[#101010] border border-[#202020] rounded-xl text-center text-xs text-[#A1A1AA]">
              Select an event from the ledger on the left to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Zoom & Forensic Inquiry */}
      {inspectingFrame && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-[#8C6A16] rounded-xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#F5C542]" />
                  <span>High-Resolution Keyframe Inspector</span>
                </h3>
                <div className="text-xs text-[#A1A1AA] font-mono">
                  Timestamp: <span className="text-[#F5C542]">{inspectingFrame.timestamp_seconds.toFixed(2)}s</span> · Frame Index: {inspectingFrame.frame_index}
                </div>
              </div>
              <button
                onClick={() => {
                  setInspectingFrame(null);
                  setForensicAnswer(null);
                }}
                className="p-1 rounded text-[#A1A1AA] hover:text-[#F5F5F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#070707] rounded-lg overflow-hidden border border-[#202020] aspect-video flex items-center justify-center">
              <img
                src={inspectingFrame.thumbnail_data}
                alt="Enlarged keyframe"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Forensic AI Question input */}
            <div className="p-4 bg-[#0D0D0D] rounded-lg border border-[#202020] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5C542]">
                <Sparkles className="w-4 h-4 text-[#F5C542]" />
                <span>Forensic Frame Inquiry (Gemini 3.8 Flash)</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about visible pixels in this frame..."
                  value={forensicQuestion}
                  onChange={(e) => setForensicQuestion(e.target.value)}
                  className="flex-1 bg-[#151515] border border-[#202020] rounded px-3 py-2 text-xs text-[#F5F5F5] placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#F5C542]"
                />
                <button
                  onClick={handleAskForensic}
                  disabled={isForensicLoading}
                  className="px-5 py-2 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded disabled:opacity-50 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                >
                  {isForensicLoading ? 'Analyzing...' : 'Inquire'}
                </button>
              </div>

              {forensicAnswer && (
                <div className="p-3.5 bg-[#151515] rounded border border-[#8C6A16] text-xs text-[#F5F5F5] leading-relaxed space-y-1">
                  <div className="font-semibold text-[#FDE08B]">Forensic Finding:</div>
                  <div className="whitespace-pre-line text-[#A1A1AA]">{forensicAnswer}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Side-by-Side Frame Comparison */}
      {isCompareOpen && compareFrameA && compareFrameB && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#101010] border border-[#8C6A16] rounded-xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                  <Columns2 className="w-4 h-4 text-[#F5C542]" />
                  <span>Side-by-Side Keyframe Temporal Comparison</span>
                </h3>
                <div className="text-xs text-[#A1A1AA]">
                  Compare visual differences across temporal coordinates to isolate scene changes or motion trajectories.
                </div>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-1 rounded text-[#A1A1AA] hover:text-[#F5F5F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Frame A */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-[#F5F5F5]">
                  <span>Frame A: <span className="text-[#F5C542]">{compareFrameA.timestamp_seconds.toFixed(2)}s</span></span>
                  <select
                    value={compareFrameA.id}
                    onChange={(e) => {
                      const found = analysis.keyframes.find(
                        (k) => k.id === e.target.value
                      );
                      if (found) setCompareFrameA(found);
                    }}
                    className="bg-[#070707] border border-[#202020] text-[11px] rounded px-2 py-0.5 text-[#F5F5F5] focus:outline-none focus:border-[#F5C542]"
                  >
                    {analysis.keyframes.map((k) => (
                      <option key={k.id} value={k.id}>
                        t={k.timestamp_seconds.toFixed(2)}s ({k.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-[#070707] rounded border border-[#202020] aspect-video overflow-hidden">
                  <img
                    src={compareFrameA.thumbnail_data}
                    alt="Frame A"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Frame B */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-[#F5F5F5]">
                  <span>Frame B: <span className="text-[#F5C542]">{compareFrameB.timestamp_seconds.toFixed(2)}s</span></span>
                  <select
                    value={compareFrameB.id}
                    onChange={(e) => {
                      const found = analysis.keyframes.find(
                        (k) => k.id === e.target.value
                      );
                      if (found) setCompareFrameB(found);
                    }}
                    className="bg-[#070707] border border-[#202020] text-[11px] rounded px-2 py-0.5 text-[#F5F5F5] focus:outline-none focus:border-[#F5C542]"
                  >
                    {analysis.keyframes.map((k) => (
                      <option key={k.id} value={k.id}>
                        t={k.timestamp_seconds.toFixed(2)}s ({k.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="bg-[#070707] rounded border border-[#202020] aspect-video overflow-hidden">
                  <img
                    src={compareFrameB.thumbnail_data}
                    alt="Frame B"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#0D0D0D] rounded border border-[#202020] text-xs text-[#A1A1AA] font-mono flex items-center justify-between">
              <span>
                Temporal Delta: Δt ={' '}
                <strong className="text-[#F5C542]">
                  {Math.abs(
                    compareFrameB.timestamp_seconds - compareFrameA.timestamp_seconds
                  ).toFixed(2)}
                  s
                </strong>
              </span>
              <span>
                Motion Score Delta: Δm ={' '}
                <strong className="text-[#F5F5F5]">
                  {Math.abs(
                    compareFrameB.motion_score - compareFrameA.motion_score
                  ).toFixed(4)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
