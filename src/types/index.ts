/**
 * VisionSentinel AI - Core TypeScript Types
 * OpenCV AI Competition 2026
 */

export type NavigationTab =
  | 'overview'
  | 'analysis'
  | 'evidence'
  | 'agent'
  | 'evaluation'
  | 'reports'
  | 'privacy'
  | 'settings';

export type ReviewerStatus = 'pending' | 'confirmed' | 'rejected' | 'requires_review';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence?: number;
  motion_intensity?: number;
  area_pixels?: number;
  label?: string;
}

export interface VisionEvent {
  id: string;
  timestamp_seconds: number;
  frame_index: number;
  event_type: 'motion_burst' | 'scene_cut' | 'illumination_shift' | 'rapid_motion';
  confidence?: number;
  motion_intensity?: number;
  method: string;
  bounding_boxes: BoundingBox[];
  motion_energy: number;
  limitations: string;
  reviewer_status: ReviewerStatus;
  reviewer_notes?: string;
}

export interface Keyframe {
  id: string;
  frame_index: number;
  timestamp_seconds: number;
  thumbnail_data: string; // Clean original frame JPEG data URL
  annotated_thumbnail_data?: string; // Annotated frame with bounding boxes
  motion_score: number;
  is_scene_boundary: boolean;
  associated_event_id?: string;
  width?: number;
  height?: number;
}

export type VideoSourceType = 'real_world_upload' | 'synthetic_benchmark';

export interface VideoMetadata {
  filename: string;
  sourceType?: VideoSourceType;
  sourceDescription?: string;
  width: number;
  height: number;
  fps: number;
  total_frames: number;
  duration_seconds: number;
  codec: string;
  file_size_bytes: number;
}

export interface ProcessingConfig {
  motion_threshold: number; // e.g. 25
  min_contour_area: number; // e.g. 400 px
  scene_change_threshold: number; // e.g. 0.40
  frame_sample_rate_fps: number; // e.g. 2
  enable_optical_flow?: boolean;
}

export interface AnalysisResult {
  analysis_id: string;
  video_metadata: VideoMetadata;
  config: ProcessingConfig;
  events: VisionEvent[];
  keyframes: Keyframe[];
  processing_time_ms: number;
  effective_fps: number;
  opencv_version: string;
  environment_notes: string;
  isDemoData?: boolean;
  sourceType?: VideoSourceType;
  realWorldValidationStatus?: 'validated' | 'pending_external_upload';
  videoUrl?: string; // Blob URL or stream
}

export interface GroundTruthAnnotation {
  id: string;
  timestamp_seconds: number;
  duration_seconds: number;
  label: string;
  notes?: string;
}

export interface EvaluationMetrics {
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  tolerance_window_seconds: number;
  total_ground_truth_events: number;
  total_detected_events: number;
  mathematical_notes: string;
}

export interface AgentObservation {
  timestamp: number;
  frameId: string;
  visualFinding: string;
  certaintyLevel: 'High' | 'Moderate' | 'Tentative' | string;
  limitations: string;
}

export interface EventCorrelation {
  eventId: string;
  verified: boolean;
  reasoning: string;
}

export interface InvestigationHypothesis {
  hypothesis: string;
  supportingEvidence: string;
  counterEvidence: string;
  requiredHumanAction: string;
}

export interface AgentExecutionStep {
  stepNumber: number;
  stepName: string;
  actionTaken: string;
  timestampMs: number;
}

export interface AgentInvestigation {
  summary: string;
  confidenceRating: 'High' | 'Medium' | 'Low' | 'Inconclusive';
  observations: AgentObservation[];
  eventCorrelations: EventCorrelation[];
  hypotheses: InvestigationHypothesis[];
  unresolvedQuestions: string[];
  agentExecutionSteps: AgentExecutionStep[];
  executionTimeMs: number;
  modelUsed?: string;
}

export interface SystemHealthInfo {
  status: string;
  service: string;
  competition: string;
  platform: string;
  ai_engine: {
    provider: string;
    model: string;
    configured: boolean;
    status: string;
  };
  vision_engine: {
    browser_canvas_pipeline: string;
    python_opencv_microservice_target: string;
    opencv_5_status: string;
  };
  privacy_mode: string;
  server_time: string;
}
