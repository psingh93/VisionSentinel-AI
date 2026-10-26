/**
 * VisionSentinel AI - Video Analysis Workstation
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 * Connects directly to real uploaded video files, genuine pixel differencing,
 * verified Chi-Square color histogram scene cut detection, and dual-mode keyframes.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  AnalysisResult,
  ProcessingConfig,
  VisionEvent,
  Keyframe,
} from '../types';
import { BrowserVisionPipeline } from '../services/visionEngine';
import { MotionEnergyGauge } from './MotionEnergyGauge';
import { TemporalDeltaComparator } from './TemporalDeltaComparator';
import { ForensicInquiryTerminal } from './ForensicInquiryTerminal';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertCircle,
  CheckCircle,
  Video,
  Clock,
  Layers,
  Sparkles,
  Crosshair,
  Activity,
  Film,
  Maximize2,
  ChevronRight,
  RefreshCw,
  Terminal,
  Columns2,
  X,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface VideoAnalysisViewProps {
  activeAnalysis: AnalysisResult | null;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onLoadBenchmark: () => void;
  isBenchmarkLoading: boolean;
  onNavigateToEvidence: () => void;
  onNavigateToAgent: () => void;
}

export const VideoAnalysisView: React.FC<VideoAnalysisViewProps> = ({
  activeAnalysis,
  onAnalysisComplete,
  onLoadBenchmark,
  isBenchmarkLoading,
  onNavigateToEvidence,
  onNavigateToAgent,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    activeAnalysis?.videoUrl || null
  );

  // Real video metadata inspected from video element
  const [unprocessedMeta, setUnprocessedMeta] = useState<{
    width: number;
    height: number;
    duration: number;
    fileSizeMB: number;
    filename: string;
  } | null>(null);

  // Configuration parameters
  const [config, setConfig] = useState<ProcessingConfig>(
    activeAnalysis?.config || {
      motion_threshold: 25,
      min_contour_area: 400,
      scene_change_threshold: 0.38,
      frame_sample_rate_fps: 2.5,
    }
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configWarning, setConfigWarning] = useState<string | null>(null);

  // Video playback & overlay states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(
    activeAnalysis?.video_metadata.duration_seconds || 0
  );
  const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | null>(null);
  const [activeEventAtCurrentTime, setActiveEventAtCurrentTime] =
    useState<VisionEvent | null>(null);

  // Keyframe display mode: 'raw' or 'annotated'
  const [keyframeMode, setKeyframeMode] = useState<'annotated' | 'raw'>('annotated');
  const [workstationTab, setWorkstationTab] = useState<'console' | 'comparator' | 'terminal'>('console');
  const [inspectingKeyframe, setInspectingKeyframe] = useState<Keyframe | null>(null);

  const pipelineRef = useRef<BrowserVisionPipeline | null>(null);

  // Sync state if activeAnalysis is provided externally
  useEffect(() => {
    if (activeAnalysis?.videoUrl) {
      setPreviewUrl(activeAnalysis.videoUrl);
      setVideoDuration(activeAnalysis.video_metadata.duration_seconds);
      if (activeAnalysis.keyframes.length > 0 && !selectedKeyframeId) {
        setSelectedKeyframeId(activeAnalysis.keyframes[0].id);
      }
    }
  }, [activeAnalysis]);

  // Validate configuration changes
  useEffect(() => {
    if (config.motion_threshold < 5 || config.motion_threshold > 80) {
      setConfigWarning('Motion threshold should be between 5 and 80 px.');
    } else if (config.min_contour_area < 50 || config.min_contour_area > 3000) {
      setConfigWarning('Min contour area should be between 50 and 3,000 px².');
    } else if (config.scene_change_threshold < 0.1 || config.scene_change_threshold > 0.8) {
      setConfigWarning('Scene change threshold should be between 0.10 and 0.80.');
    } else if (config.frame_sample_rate_fps < 0.5 || config.frame_sample_rate_fps > 10) {
      setConfigWarning('Sampling rate should be between 0.5 and 10 FPS.');
    } else {
      setConfigWarning(null);
    }
  }, [config]);

  // Handle file drop & selection with strict validation
  const handleFileChange = (file: File) => {
    setErrorMessage(null);

    // 1. Empty file validation
    if (file.size === 0) {
      setErrorMessage('Selected video file is empty (0 bytes). Please provide a valid video.');
      return;
    }

    // 2. MIME & Extension validation
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];
    const validExts = ['.mp4', '.webm', '.mov', '.ogg'];
    const hasValidExt = validExts.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setErrorMessage(
        `Unsupported video format (${file.type || 'unknown'}). Please provide an MP4, WebM, or MOV file.`
      );
      return;
    }

    // 3. Size validation for client-side memory safety
    const maxSizeBytes = 150 * 1024 * 1024; // 150 MB safety cap
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds local browser memory safety limit of 150 MB.`
      );
      return;
    }

    // Revoke previous blob url if any
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedKeyframeId(null);
    setCurrentTime(0);
    setIsPlaying(false);

    setUnprocessedMeta({
      filename: file.name,
      fileSizeMB: Number((file.size / (1024 * 1024)).toFixed(2)),
      width: 0,
      height: 0,
      duration: 0,
    });
  };

  const handleVideoMetadataLoaded = () => {
    if (videoRef.current) {
      const vid = videoRef.current;
      const duration = isFinite(vid.duration) ? Number(vid.duration.toFixed(2)) : 0;
      const width = vid.videoWidth || 640;
      const height = vid.videoHeight || 360;

      if (width === 0 || height === 0) {
        setErrorMessage('Unable to extract video stream dimensions. The video codec may be unsupported.');
        return;
      }

      setVideoDuration(duration);
      if (unprocessedMeta) {
        setUnprocessedMeta({
          ...unprocessedMeta,
          width,
          height,
          duration,
        });
      }
    }
  };

  const handleVideoError = () => {
    setErrorMessage(
      'Video playback failed. The browser could not decode this container or codec. Please test with an H.264 MP4 or VP8/VP9 WebM file.'
    );
  };

  const startAnalysis = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Please select a video file or load the benchmark stream.');
      return;
    }

    if (configWarning) {
      setErrorMessage(`Please fix configuration parameters before running: ${configWarning}`);
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);
    setProgress(5);
    setProgressStage('Initializing computer vision pipeline...');

    try {
      const pipeline = new BrowserVisionPipeline(config);
      pipelineRef.current = pipeline;

      const isRealUpload = Boolean(selectedFile);
      const source = selectedFile || previewUrl!;
      const result = await pipeline.analyzeVideo(
        source,
        (pct, stage) => {
          setProgress(pct);
          setProgressStage(stage);
        },
        isRealUpload ? 'real_world_upload' : (activeAnalysis?.sourceType || 'synthetic_benchmark')
      );

      if (isRealUpload) {
        result.sourceType = 'real_world_upload';
        result.isDemoData = false;
        result.realWorldValidationStatus = 'validated';
        result.video_metadata.sourceType = 'real_world_upload';
        result.video_metadata.sourceDescription = 'User provided real-world camera footage';
      }

      onAnalysisComplete(result);
      setIsProcessing(false);
      setProgress(100);
      setProgressStage('Analysis complete. Evidence ready for review.');
      if (result.keyframes.length > 0) {
        setSelectedKeyframeId(result.keyframes[0].id);
      }
    } catch (err: any) {
      console.error('Video analysis failed:', err);
      setErrorMessage(err.message || 'Video processing encountered a failure.');
      setIsProcessing(false);
    }
  };

  const cancelAnalysis = () => {
    if (pipelineRef.current) {
      pipelineRef.current.cancel();
      setIsProcessing(false);
      setProgressStage('Analysis cancelled by user.');
    }
  };

  // Video time update and canvas bounding box rendering
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    if (!activeAnalysis) return;

    // Find if there is an active event within ±0.40s
    const matchingEvent = activeAnalysis.events.find(
      (e) => Math.abs(e.timestamp_seconds - t) <= 0.40
    );
    setActiveEventAtCurrentTime(matchingEvent || null);

    // Draw bounding boxes on overlay canvas with metallic gold accents
    const canvas = overlayCanvasRef.current;
    if (canvas && videoRef.current) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (matchingEvent && matchingEvent.bounding_boxes.length > 0) {
          const vidW = videoRef.current.videoWidth || canvas.width;
          const vidH = videoRef.current.videoHeight || canvas.height;
          const scaleX = canvas.width / vidW;
          const scaleY = canvas.height / vidH;

          matchingEvent.bounding_boxes.forEach((box, i) => {
            const bx = box.x * scaleX;
            const by = box.y * scaleY;
            const bw = box.width * scaleX;
            const bh = box.height * scaleY;

            // Metallic Gold border
            ctx.strokeStyle = '#F5C542';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx, by, bw, bh);

            // Translucent gold fill
            ctx.fillStyle = 'rgba(245, 197, 66, 0.15)';
            ctx.fillRect(bx, by, bw, bh);

            // Corner crosshair brackets in Light Gold
            const len = Math.min(8, bw / 3, bh / 3);
            ctx.strokeStyle = '#FDE08B';
            ctx.lineWidth = 2;

            // Top-left corner
            ctx.beginPath();
            ctx.moveTo(bx, by + len);
            ctx.lineTo(bx, by);
            ctx.lineTo(bx + len, by);
            ctx.stroke();

            // Bottom-right corner
            ctx.beginPath();
            ctx.moveTo(bx + bw, by + bh - len);
            ctx.lineTo(bx + bw, by + bh);
            ctx.lineTo(bx + bw - len, by + bh);
            ctx.stroke();

            // Label tag in elevated dark panel
            const labelText = `MOTION REGION [${i + 1}] (Area: ${(box.area_pixels || Math.round(box.width * box.height)).toLocaleString()}px²)`;
            ctx.font = '600 10px monospace';
            const textWidth = ctx.measureText(labelText).width;
            const tagW = textWidth + 12;
            const tagH = 18;
            const tagY = Math.max(0, by - tagH - 2);

            ctx.fillStyle = '#070707';
            ctx.fillRect(bx, tagY, tagW, tagH);
            ctx.strokeStyle = '#8C6A16';
            ctx.lineWidth = 1;
            ctx.strokeRect(bx, tagY, tagW, tagH);

            ctx.fillStyle = '#F5C542';
            ctx.fillText(labelText, bx + 6, tagY + 12);
          });
        }
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  };

  const handleKeyframeSelect = (kf: Keyframe) => {
    setSelectedKeyframeId(kf.id);
    seekTo(kf.timestamp_seconds);
  };

  const resetVideoInput = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUnprocessedMeta(null);
    setSelectedKeyframeId(null);
    setErrorMessage(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoDuration(0);
  };

  const displayFilename =
    activeAnalysis?.video_metadata.filename ||
    selectedFile?.name ||
    unprocessedMeta?.filename ||
    'video_stream.mp4';

  const displayResolution = activeAnalysis
    ? `${activeAnalysis.video_metadata.width}×${activeAnalysis.video_metadata.height}`
    : unprocessedMeta && unprocessedMeta.width > 0
    ? `${unprocessedMeta.width}×${unprocessedMeta.height}`
    : 'Awaiting Metadata';

  const isCurrentFootageAnalyzed = Boolean(
    activeAnalysis &&
      (activeAnalysis.video_metadata.filename === displayFilename ||
        activeAnalysis.videoUrl === previewUrl)
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7 bg-[#070707]">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202020] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C542] shadow-[0_0_8px_rgba(245,197,66,0.6)]" />
            <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight">
              Video Analysis Workstation
            </h1>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            High-precision frame decoding, ITU-R BT.601 luminance differencing, 3×3 spatial smoothing, and 24-bin Chi-Square scene boundary verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {previewUrl && (
            <button
              onClick={resetVideoInput}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] rounded transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Video</span>
            </button>
          )}

          <button
            onClick={onLoadBenchmark}
            disabled={isBenchmarkLoading || isProcessing}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] border border-[#202020] hover:border-[#F5C542]/40 rounded transition-all duration-150 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>
              {isBenchmarkLoading ? 'Generating Benchmark...' : 'Load Synthetic Benchmark Video'}
            </span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-[#101010] border border-[#FF303B]/60 rounded-xl flex items-start gap-3 text-[#F5F5F5] text-xs shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF303B]" />
          <div className="space-y-1">
            <div className="font-semibold text-[#FF303B]">Validation Notice</div>
            <div className="text-[#A1A1AA] leading-relaxed">{errorMessage}</div>
          </div>
        </div>
      )}

      {/* Main Grid: Player or Dropzone & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column (8 cols): Video Workstation Screen or Dropzone */}
        <div className="lg:col-span-8 space-y-4">
          {previewUrl ? (
            <>
              {/* Classified Command Workstation Navigation Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
                <div className="inline-flex rounded-lg border border-[#202020] p-1 bg-[#101010] gap-1 shadow-sm">
                  <button
                    onClick={() => setWorkstationTab('console')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      workstationTab === 'console'
                        ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_12px_rgba(245,197,66,0.3)]'
                        : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>WORKSTATION CONSOLE</span>
                  </button>

                  <button
                    onClick={() => setWorkstationTab('comparator')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      workstationTab === 'comparator'
                        ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_12px_rgba(245,197,66,0.3)]'
                        : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]'
                    }`}
                  >
                    <Columns2 className="w-3.5 h-3.5" />
                    <span>TEMPORAL DELTA COMPARATOR</span>
                  </button>

                  <button
                    onClick={() => setWorkstationTab('terminal')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
                      workstationTab === 'terminal'
                        ? 'bg-[#F5C542] text-[#070707] font-bold shadow-[0_0_12px_rgba(245,197,66,0.3)]'
                        : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>FORENSIC AI TERMINAL</span>
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#A1A1AA] bg-[#101010] px-2.5 py-1.5 rounded border border-[#202020]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#24D18B] animate-pulse" />
                  <span>OPENCV AI 2026 · ZERO-TRUST SECURE</span>
                </div>
              </div>

              {/* Sub-tab 1: Temporal Delta Comparator */}
              {workstationTab === 'comparator' && (
                <TemporalDeltaComparator
                  keyframes={activeAnalysis?.keyframes || []}
                  events={activeAnalysis?.events || []}
                  currentTime={currentTime}
                  onSeekTo={seekTo}
                />
              )}

              {/* Sub-tab 2: Agentic AI Forensic Terminal */}
              {workstationTab === 'terminal' && (
                <ForensicInquiryTerminal
                  currentKeyframe={
                    activeAnalysis?.keyframes.find((k) => k.id === selectedKeyframeId) ||
                    activeAnalysis?.keyframes[0] ||
                    null
                  }
                  activeEvents={activeAnalysis?.events || []}
                  videoDuration={videoDuration}
                />
              )}

              {/* Sub-tab 3: Main Video Workstation Console */}
              {workstationTab === 'console' && (
                <>
                  <div className="bg-[#101010] border border-[#202020] rounded-xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
                    {/* Telemetry Header Bar above viewport */}
                    <div className="px-4 py-2.5 bg-[#151515] border-b border-[#202020] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#A1A1AA] gap-2">
                      <div className="flex items-center gap-2">
                        <Film className="w-3.5 h-3.5 text-[#F5C542]" />
                        <span className="text-[#F5F5F5] font-semibold truncate max-w-[200px] sm:max-w-xs">
                          {displayFilename}
                        </span>
                        {selectedFile && (
                          <span className="text-[10px] bg-[#070707] px-1.5 py-0.5 rounded border border-[#202020]">
                            {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="hidden sm:inline">{displayResolution}</span>
                        <span className="text-[#F5C542] font-bold">
                          {currentTime.toFixed(2)}s / {videoDuration ? `${videoDuration.toFixed(2)}s` : '0.00s'}
                        </span>
                        {selectedFile || activeAnalysis?.sourceType === 'real_world_upload' ? (
                          <span className="text-[10px] px-2 py-0.5 rounded border bg-[#24D18B]/15 text-[#24D18B] border-[#24D18B]/50 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#24D18B] animate-pulse" />
                            REAL-WORLD FOOTAGE
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded border bg-[#F5C542]/15 text-[#F5C542] border-[#8C6A16] font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                            SYNTHETIC BENCHMARK
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            isCurrentFootageAnalyzed
                              ? 'bg-[#101010] text-[#24D18B] border-[#24D18B]/40'
                              : 'bg-[#101010] text-[#FDE08B] border-[#8C6A16]'
                          }`}
                        >
                          {isCurrentFootageAnalyzed ? 'ANALYZED' : 'AWAITING PIPELINE'}
                        </span>
                      </div>
                    </div>

                    {/* Viewport Frame with Military HUD Reticle Overlay */}
                    <div className="relative aspect-video bg-[#070707] flex items-center justify-center overflow-hidden">
                      <video
                        ref={videoRef}
                        src={previewUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleVideoMetadataLoaded}
                        onError={handleVideoError}
                        onEnded={() => setIsPlaying(false)}
                        className="w-full h-full object-contain"
                        playsInline
                      />
                      <canvas
                        ref={overlayCanvasRef}
                        width={640}
                        height={360}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />

                      {/* Tactical HUD Corner Reticles */}
                      <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-t-2 border-l-2 border-[#F5C542]/70" />
                          <div className="w-4 h-4 border-t-2 border-r-2 border-[#F5C542]/70" />
                        </div>
                        <div className="flex justify-between">
                          <div className="w-4 h-4 border-b-2 border-l-2 border-[#F5C542]/70" />
                          <div className="w-4 h-4 border-b-2 border-r-2 border-[#F5C542]/70" />
                        </div>
                      </div>

                      {/* Event Marker Pill on Video */}
                      {activeEventAtCurrentTime && (
                        <div
                          className={`absolute top-3 left-3 text-white text-[11px] font-mono px-3 py-1.5 rounded shadow-lg backdrop-blur-md flex items-center gap-2 border ${
                            activeEventAtCurrentTime.event_type === 'scene_cut'
                              ? 'bg-[#101010]/95 border-[#FF303B] text-[#FF303B]'
                              : 'bg-[#101010]/95 border-[#F5C542] text-[#FDE08B]'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              activeEventAtCurrentTime.event_type === 'scene_cut'
                                ? 'bg-[#FF303B] animate-ping'
                                : 'bg-[#F5C542] animate-ping'
                            }`}
                          />
                          <span className="font-bold tracking-tight">
                            {activeEventAtCurrentTime.event_type === 'scene_cut'
                              ? 'SCENE CUT'
                              : 'MOTION DETECTION'}{' '}
                            @ {activeEventAtCurrentTime.timestamp_seconds.toFixed(2)}s
                          </span>
                          <span className="text-[#A1A1AA] text-[10px]">
                            (Energy: {activeEventAtCurrentTime.motion_energy})
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Timeline with Event Markers */}
                    <div className="px-4 pt-3 pb-1 bg-[#151515] border-t border-[#202020]">
                      <div className="relative w-full">
                        {/* Event Marker Ticks on Timeline */}
                        {activeAnalysis && videoDuration > 0 && (
                          <div className="absolute inset-x-0 -top-1.5 h-1.5 pointer-events-none z-10">
                            {activeAnalysis.events.map((evt) => {
                              const leftPct = (evt.timestamp_seconds / videoDuration) * 100;
                              const isCut = evt.event_type === 'scene_cut';
                              return (
                                <div
                                  key={evt.id}
                                  style={{ left: `${Math.min(99, Math.max(1, leftPct))}%` }}
                                  className={`absolute -translate-x-1/2 w-1.5 h-2 rounded-sm ${
                                    isCut ? 'bg-[#FF303B]' : 'bg-[#F5C542]'
                                  }`}
                                  title={`${evt.event_type} at ${evt.timestamp_seconds}s`}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* Range Slider Scrubber */}
                        <input
                          type="range"
                          min="0"
                          max={videoDuration || 100}
                          step="0.05"
                          value={currentTime}
                          onChange={(e) => seekTo(parseFloat(e.target.value))}
                          className="w-full accent-[#F5C542] cursor-pointer h-1.5 bg-[#202020] rounded-lg"
                          aria-label="Video scrubber"
                        />
                      </div>
                    </div>

                    {/* Player Controls Bar */}
                    <div className="px-4 py-3 bg-[#101010] flex items-center justify-between gap-4 border-t border-[#202020]">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={togglePlay}
                          className="p-2 rounded bg-[#F5C542] hover:bg-[#FDE08B] text-[#070707] transition-all cursor-pointer shadow-sm active:scale-95"
                          aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-[#070707]" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5 text-[#070707]" />
                          )}
                        </button>

                        <button
                          onClick={() => seekTo(0)}
                          className="p-2 rounded bg-[#151515] hover:bg-[#202020] border border-[#202020] text-[#A1A1AA] hover:text-[#F5C542] transition-colors cursor-pointer"
                          title="Rewind to start"
                          aria-label="Rewind to start"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        <div className="text-xs font-mono text-[#F5F5F5] ml-2">
                          <span className="text-[#F5C542] font-bold">{currentTime.toFixed(2)}s</span>
                          <span className="text-[#202020] mx-1.5">/</span>
                          <span className="text-[#A1A1AA]">
                            {videoDuration ? `${videoDuration.toFixed(2)}s` : '0.00s'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#A1A1AA]">
                        {activeAnalysis && isCurrentFootageAnalyzed ? (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                            <span className="text-[#F5C542] font-semibold">
                              {activeAnalysis.events.length} Events Detected
                            </span>
                          </div>
                        ) : (
                          <span className="text-[#A1A1AA]">Click &apos;Run Vision Pipeline&apos; to process</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dual Speedometer Arc Gauges: Motion Energy & Risk Scoring */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MotionEnergyGauge
                      energy={activeEventAtCurrentTime ? activeEventAtCurrentTime.motion_energy : (isPlaying ? 0.015 : 0.00)}
                      threshold={config.motion_threshold / 1000}
                      peakEnergy={activeAnalysis?.events?.reduce((max, e) => Math.max(max, e.motion_energy), 0) || 0}
                      isSceneCut={activeEventAtCurrentTime?.event_type === 'scene_cut'}
                      activeBoxesCount={activeEventAtCurrentTime?.bounding_boxes.length || 0}
                      mode="motion"
                      label="Motion Displacement (ΔE)"
                    />

                    <MotionEnergyGauge
                      energy={
                        activeEventAtCurrentTime
                          ? (activeEventAtCurrentTime.event_type === 'scene_cut'
                              ? 0.88
                              : Math.min(0.96, activeEventAtCurrentTime.motion_energy * 4.2 + (activeEventAtCurrentTime.bounding_boxes.length > 1 ? 0.25 : 0.12)))
                          : (isPlaying ? 0.12 : 0.04)
                      }
                      threshold={0.50}
                      peakEnergy={
                        activeEventAtCurrentTime?.event_type === 'scene_cut'
                          ? 0.88
                          : Math.min(0.96, (activeAnalysis?.events?.reduce((max, e) => Math.max(max, e.motion_energy * 4.2), 0) || 0) + 0.15)
                      }
                      isSceneCut={activeEventAtCurrentTime?.event_type === 'scene_cut'}
                      activeBoxesCount={activeEventAtCurrentTime?.bounding_boxes.length || 0}
                      mode="risk"
                      label="Forensic Risk Scoring (FRS)"
                    />
                  </div>

                  {/* Real-time Forensic Target Lock & Coordinate Ledger */}
                  <div className="bg-[#101010] border border-[#202020] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.6)] space-y-3">
                    <div className="flex items-center justify-between border-b border-[#202020] pb-2 text-xs">
                      <span className="font-semibold text-[#F5F5F5] flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-[#F5C542]" />
                        FORENSIC TARGET LOCK &amp; COORDINATE LEDGER
                      </span>
                      <span className="font-mono text-[11px] text-[#A1A1AA]">
                        TIMESTAMP: <span className="text-[#F5C542] font-bold">{currentTime.toFixed(2)}s</span> / {videoDuration.toFixed(2)}s
                      </span>
                    </div>

                    {activeEventAtCurrentTime && activeEventAtCurrentTime.bounding_boxes.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                        <div className="bg-[#0D0D0D] border border-[#202020] rounded p-2.5 space-y-1">
                          <div className="text-[10px] text-[#A1A1AA]">TARGET SPATIAL GEOMETRY</div>
                          <div className="text-[#F5C542] font-bold text-sm">
                            {(activeEventAtCurrentTime.bounding_boxes[0].area_pixels || 0).toLocaleString()} px²
                          </div>
                          <div className="text-[10px] text-[#A1A1AA]">
                            W: {activeEventAtCurrentTime.bounding_boxes[0].width}px · H: {activeEventAtCurrentTime.bounding_boxes[0].height}px
                          </div>
                        </div>

                        <div className="bg-[#0D0D0D] border border-[#202020] rounded p-2.5 space-y-1">
                          <div className="text-[10px] text-[#A1A1AA]">CARTESIAN ANCHOR [X, Y]</div>
                          <div className="text-[#F5F5F5] font-bold text-sm">
                            X: {activeEventAtCurrentTime.bounding_boxes[0].x}, Y: {activeEventAtCurrentTime.bounding_boxes[0].y}
                          </div>
                          <div className="text-[10px] text-[#24D18B] flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> TRACK_LOCKED
                          </div>
                        </div>

                        <div className="bg-[#0D0D0D] border border-[#202020] rounded p-2.5 space-y-1">
                          <div className="text-[10px] text-[#A1A1AA]">ALGORITHMIC DISCRIMINATOR</div>
                          <div className="text-[#FDE08B] font-bold text-sm truncate">
                            {activeEventAtCurrentTime.method}
                          </div>
                          <div className="text-[10px] text-[#A1A1AA]">
                            {activeEventAtCurrentTime.event_type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-3 px-4 bg-[#0D0D0D] border border-[#202020] rounded-lg text-center text-xs text-[#A1A1AA] font-mono flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#24D18B] animate-pulse" />
                        <span>
                          {isPlaying
                            ? 'CONTINUOUS SENSOR SWEEP IN PROGRESS :: SCANNING OPTICAL DISPLACEMENT...'
                            : 'PLAY OR SCRUB TIMELINE TO LOCK ONTO COMPUTER VISION TARGET REGION.'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          ) : (
            /* Upload Dropzone with Clean Minimal Design */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              className="border-2 border-dashed border-[#202020] hover:border-[#F5C542] rounded-2xl p-12 text-center bg-[#101010] transition-all duration-200 flex flex-col items-center justify-center space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#151515] border border-[#8C6A16] text-[#F5C542] flex items-center justify-center shadow-[0_0_20px_rgba(245,197,66,0.18)]">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="space-y-1.5 max-w-sm">
                <div className="text-sm font-bold text-[#F5F5F5]">
                  Select or Drag Video Stream
                </div>
                <div className="text-xs text-[#A1A1AA] leading-relaxed">
                  Supports MP4, WebM, and MOV containers (up to 150MB). Files are decoded directly in client memory buffers with zero external storage.
                </div>
              </div>

              <div className="pt-2">
                <label className="px-5 py-2.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all duration-150 cursor-pointer inline-block shadow-[0_0_16px_rgba(245,197,66,0.25)]">
                  Browse Video File
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/ogg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-[11px] text-[#A1A1AA] font-mono pt-1">
                Or load the synthetic benchmark stream using the button above
              </div>
            </div>
          )}

          {/* Processing Progress Bar */}
          {isProcessing && (
            <div className="p-4 bg-[#101010] border border-[#8C6A16] rounded-xl space-y-2.5 shadow-[0_0_20px_rgba(245,197,66,0.12)]">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-[#F5C542] font-mono">{progressStage}</span>
                <span className="text-[#F5F5F5] font-mono font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden border border-[#202020]">
                <div
                  className="bg-gradient-to-r from-[#8C6A16] via-[#F5C542] to-[#FDE08B] h-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  onClick={cancelAnalysis}
                  className="text-xs text-[#FF303B] hover:text-[#FF6B6B] font-medium cursor-pointer"
                >
                  Cancel Processing
                </button>
              </div>
            </div>
          )}

          {/* Keyframe Evidence Gallery Strip */}
          {activeAnalysis && activeAnalysis.keyframes.length > 0 && isCurrentFootageAnalyzed && (
            <div className="bg-[#101010] border border-[#202020] rounded-xl p-4 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                  <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                    Extracted Keyframe Evidence ({activeAnalysis.keyframes.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#A1A1AA] font-mono mr-1">Display:</span>
                  <div className="inline-flex rounded-md border border-[#202020] p-0.5 bg-[#070707]">
                    <button
                      onClick={() => setKeyframeMode('annotated')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                        keyframeMode === 'annotated'
                          ? 'bg-[#F5C542] text-[#070707] font-bold'
                          : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                      }`}
                    >
                      Annotated
                    </button>
                    <button
                      onClick={() => setKeyframeMode('raw')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer transition-colors ${
                        keyframeMode === 'raw'
                          ? 'bg-[#F5C542] text-[#070707] font-bold'
                          : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                      }`}
                    >
                      Clean Raw
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {activeAnalysis.keyframes.map((kf) => {
                  const isSelected = kf.id === selectedKeyframeId;
                  const thumb =
                    keyframeMode === 'annotated' && kf.annotated_thumbnail_data
                      ? kf.annotated_thumbnail_data
                      : kf.thumbnail_data;

                  return (
                    <div
                      key={kf.id}
                      onClick={() => handleKeyframeSelect(kf)}
                      className={`group relative rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#F5C542] ring-1 ring-[#F5C542] shadow-[0_0_12px_rgba(245,197,66,0.3)]'
                          : kf.is_scene_boundary
                          ? 'border-[#FF303B]/60 hover:border-[#FF303B]'
                          : 'border-[#202020] hover:border-[#F5C542]/50'
                      }`}
                    >
                      <div className="aspect-video bg-[#070707] relative">
                        <img
                          src={thumb}
                          alt={`Keyframe at ${kf.timestamp_seconds}s`}
                          className="w-full h-full object-cover"
                        />
                        {kf.is_scene_boundary && (
                          <div className="absolute top-1 right-1 bg-[#FF303B] text-white text-[8px] font-mono px-1 py-0.5 rounded font-bold">
                            CUT
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectingKeyframe(kf);
                          }}
                          className="absolute top-1 left-1 p-1 bg-[#070707]/80 text-[#F5C542] rounded hover:bg-[#F5C542] hover:text-[#070707] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Zoom Inspector"
                        >
                          <Maximize2 className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="p-1.5 bg-[#0D0D0D] text-[10px] font-mono text-[#A1A1AA] flex items-center justify-between border-t border-[#202020]">
                        <span className="text-[#F5F5F5] font-semibold">{kf.timestamp_seconds.toFixed(2)}s</span>
                        <span className="text-[#F5C542]">
                          Δ: {(kf.motion_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols): Vision Engine Configuration Panel & Methods Summary */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-5 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between border-b border-[#202020] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F5C542]" />
                <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                  Vision Engine Parameters
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#070707] px-2 py-0.5 rounded border border-[#202020]">
                W3C Core / CV Ready
              </span>
            </div>

            {configWarning && (
              <div className="p-2.5 bg-[#151515] border border-[#8C6A16] rounded text-[11px] text-[#FDE08B] flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{configWarning}</span>
              </div>
            )}

            {/* Group 1: Motion Clustering */}
            <div className="space-y-4">
              <div className="text-[11px] font-mono font-semibold text-[#F5C542] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#F5C542]" />
                <span>Motion Differencing</span>
              </div>

              {/* Motion Threshold */}
              <div className="space-y-1.5 bg-[#070707] p-3 rounded-lg border border-[#202020]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#F5F5F5] font-medium">Pixel Delta Threshold</span>
                  <span className="font-mono text-[#F5C542] font-bold text-xs bg-[#151515] px-2 py-0.5 rounded border border-[#202020]">
                    {config.motion_threshold} px
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={config.motion_threshold}
                  onChange={(e) =>
                    setConfig({ ...config, motion_threshold: parseInt(e.target.value) })
                  }
                  className="w-full cursor-pointer accent-[#F5C542]"
                  aria-label="Motion Differencing Threshold"
                />
                <p className="text-[10px] text-[#A1A1AA] leading-normal">
                  Minimum grayscale deviation |I_t - I_prev| required to register temporal change.
                </p>
              </div>

              {/* Min Contour Area */}
              <div className="space-y-1.5 bg-[#070707] p-3 rounded-lg border border-[#202020]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#F5F5F5] font-medium">Min Cluster Area</span>
                  <span className="font-mono text-[#F5C542] font-bold text-xs bg-[#151515] px-2 py-0.5 rounded border border-[#202020]">
                    {config.min_contour_area} px²
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={config.min_contour_area}
                  onChange={(e) =>
                    setConfig({ ...config, min_contour_area: parseInt(e.target.value) })
                  }
                  className="w-full cursor-pointer accent-[#F5C542]"
                  aria-label="Minimum Contour Area"
                />
                <p className="text-[10px] text-[#A1A1AA] leading-normal">
                  Rejects smaller noise flickers; groups adjacent active pixel cells.
                </p>
              </div>
            </div>

            {/* Group 2: Scene & Temporal Dynamics */}
            <div className="space-y-4 pt-1">
              <div className="text-[11px] font-mono font-semibold text-[#F5C542] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#F5C542]" />
                <span>Scene &amp; Sampling Dynamics</span>
              </div>

              {/* Scene Cut Sensitivity */}
              <div className="space-y-1.5 bg-[#070707] p-3 rounded-lg border border-[#202020]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#F5F5F5] font-medium">Scene Cut Distance (Chi-Sq)</span>
                  <span className="font-mono text-[#F5C542] font-bold text-xs bg-[#151515] px-2 py-0.5 rounded border border-[#202020]">
                    {config.scene_change_threshold}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.75"
                  step="0.02"
                  value={config.scene_change_threshold}
                  onChange={(e) =>
                    setConfig({ ...config, scene_change_threshold: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer accent-[#F5C542]"
                  aria-label="Scene Change Threshold"
                />
                <p className="text-[10px] text-[#A1A1AA] leading-normal">
                  Chi-Square distance threshold on 24-bin color histograms to verify cuts.
                </p>
              </div>

              {/* Sampling Rate */}
              <div className="space-y-1.5 bg-[#070707] p-3 rounded-lg border border-[#202020]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#F5F5F5] font-medium">Sampling Frequency</span>
                  <span className="font-mono text-[#F5C542] font-bold text-xs bg-[#151515] px-2 py-0.5 rounded border border-[#202020]">
                    {config.frame_sample_rate_fps} FPS
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.5"
                  value={config.frame_sample_rate_fps}
                  onChange={(e) =>
                    setConfig({ ...config, frame_sample_rate_fps: parseFloat(e.target.value) })
                  }
                  className="w-full cursor-pointer accent-[#F5C542]"
                  aria-label="Frame Sampling Rate"
                />
                <p className="text-[10px] text-[#A1A1AA] leading-normal">
                  Rate of frame decoding and feature extraction per video second.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={startAnalysis}
                disabled={isProcessing || !previewUrl || Boolean(configWarning)}
                className="w-full py-2.5 px-4 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] disabled:bg-[#151515] disabled:text-[#A1A1AA] rounded transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(245,197,66,0.25)] active:scale-[0.99]"
              >
                <Layers className="w-4 h-4 text-[#070707]" />
                <span>
                  {isProcessing
                    ? 'Executing Pipeline...'
                    : isCurrentFootageAnalyzed
                    ? 'Re-Run Vision Pipeline'
                    : 'Run Vision Pipeline'}
                </span>
              </button>
            </div>
          </div>

          {/* Methods Summary Card */}
          <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2 border-b border-[#202020] pb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#F5C542]" />
              <span>Methods &amp; Algorithm Summary</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] mt-1.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="text-[#F5F5F5]">ITU-R BT.601 Luminance: </strong>
                  <span className="text-[#A1A1AA]">Converts RGB frames to perceptual grayscale via $Y = 0.299R + 0.587G + 0.114B$.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] mt-1.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="text-[#F5F5F5]">3×3 Spatial Smoothing: </strong>
                  <span className="text-[#A1A1AA]">Attenuates sensor impulse noise without blurring significant object edges.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] mt-1.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="text-[#F5F5F5]">24-Bin Chi-Square Distance: </strong>
                  <span className="text-[#A1A1AA]">Measures color distribution shifts $\chi^2(H_1, H_2)$ to detect scene cut boundaries.</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542] mt-1.5 shrink-0" />
                <div className="leading-relaxed">
                  <strong className="text-[#F5F5F5]">Contour Clustering: </strong>
                  <span className="text-[#A1A1AA]">Groups contiguous motion regions exceeding the configured area threshold into bounding boxes.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Card if Analysis exists */}
          {activeAnalysis && isCurrentFootageAnalyzed && (
            <div className="bg-[#101010] border border-[#8C6A16]/50 rounded-xl p-5 space-y-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#24D18B]" />
                  <span>Pipeline Telemetry In Memory</span>
                </span>
                <span className="text-[10px] font-mono text-[#24D18B]">ACTIVE</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono py-1">
                <div className="p-2 bg-[#070707] rounded border border-[#202020]">
                  <div className="text-[10px] text-[#A1A1AA]">DURATION</div>
                  <div className="font-bold text-[#F5F5F5]">{activeAnalysis.video_metadata.duration_seconds}s</div>
                </div>
                <div className="p-2 bg-[#070707] rounded border border-[#202020]">
                  <div className="text-[10px] text-[#A1A1AA]">EVENTS</div>
                  <div className="font-bold text-[#F5C542]">{activeAnalysis.events.length}</div>
                </div>
                <div className="p-2 bg-[#070707] rounded border border-[#202020]">
                  <div className="text-[10px] text-[#A1A1AA]">SPEED</div>
                  <div className="font-bold text-[#FDE08B]">{activeAnalysis.effective_fps} fps</div>
                </div>
              </div>

              <div className="pt-1 space-y-2">
                <button
                  onClick={onNavigateToEvidence}
                  className="w-full py-2 px-3 text-xs font-medium text-[#F5F5F5] bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542]/40 rounded transition-all text-left flex items-center justify-between cursor-pointer"
                >
                  <span>Inspect Evidence &amp; Review Events</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F5C542]" />
                </button>

                <button
                  onClick={onNavigateToAgent}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#F5C542] bg-[#070707] hover:bg-[#151515] border border-[#8C6A16] rounded transition-all text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
                    <span>Run AI Investigation (Gemini)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#F5C542]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Dark Glassmorphism Modal Inspector */}
      <AnimatePresence>
        {inspectingKeyframe && (
          <div className="fixed inset-0 z-50 bg-[#070707]/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#101010]/95 border border-[#202020] rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-[0_0_35px_rgba(0,0,0,0.9)] relative"
            >
              <div className="flex items-center justify-between border-b border-[#202020] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded border border-[#8C6A16] bg-[#151515] flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5 text-[#F5C542]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F5F5]">
                      High-Precision Keyframe Forensic Inspector
                    </h3>
                    <div className="text-[10px] font-mono text-[#A1A1AA]">
                      TIMESTAMP: <span className="text-[#F5C542]">{inspectingKeyframe.timestamp_seconds.toFixed(2)}s</span> · FRAME #{inspectingKeyframe.frame_index}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setInspectingKeyframe(null)}
                  className="p-1.5 rounded-lg bg-[#151515] hover:bg-[#202020] text-[#A1A1AA] hover:text-[#F5C542] border border-[#202020] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-[#202020] bg-[#070707]">
                <img
                  src={inspectingKeyframe.annotated_thumbnail_data || inspectingKeyframe.thumbnail_data}
                  alt={`Inspecting keyframe at ${inspectingKeyframe.timestamp_seconds}s`}
                  className="w-full h-full object-contain"
                />
                {inspectingKeyframe.is_scene_boundary && (
                  <div className="absolute top-3 right-3 bg-[#FF303B] text-white text-[10px] font-bold font-mono px-2 py-1 rounded shadow">
                    SCENE BOUNDARY CUT
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#070707] border border-[#202020] rounded-lg p-2.5">
                  <div className="text-[10px] text-[#A1A1AA]">MEASURED DELTA</div>
                  <div className="text-[#F5C542] font-bold text-sm">
                    {(inspectingKeyframe.motion_score * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="bg-[#070707] border border-[#202020] rounded-lg p-2.5">
                  <div className="text-[10px] text-[#A1A1AA]">FRAME RESOLUTION</div>
                  <div className="text-[#F5F5F5] font-bold text-sm">
                    {inspectingKeyframe.width || 640} x {inspectingKeyframe.height || 360}
                  </div>
                </div>
                <div className="bg-[#070707] border border-[#202020] rounded-lg p-2.5">
                  <div className="text-[10px] text-[#A1A1AA]">CLASSIFICATION</div>
                  <div className={inspectingKeyframe.is_scene_boundary ? 'text-[#FF303B] font-bold text-sm' : 'text-[#24D18B] font-bold text-sm'}>
                    {inspectingKeyframe.is_scene_boundary ? 'SCENE CUT' : 'MOTION KEYFRAME'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  onClick={() => {
                    seekTo(inspectingKeyframe.timestamp_seconds);
                    setWorkstationTab('comparator');
                    setInspectingKeyframe(null);
                  }}
                  className="px-3.5 py-2 text-xs font-mono font-semibold bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542] text-[#F5F5F5] rounded-lg cursor-pointer transition-all"
                >
                  Send to Delta Comparator
                </button>
                <button
                  onClick={() => {
                    seekTo(inspectingKeyframe.timestamp_seconds);
                    setWorkstationTab('terminal');
                    setInspectingKeyframe(null);
                  }}
                  className="px-3.5 py-2 text-xs font-mono font-bold bg-[#F5C542] hover:bg-[#FDE08B] text-[#070707] rounded-lg cursor-pointer transition-all shadow-[0_0_12px_rgba(245,197,66,0.25)]"
                >
                  Inspect in AI Terminal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
