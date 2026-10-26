/**
 * VisionSentinel AI - Client API & Export Utilities
 */

import {
  AgentInvestigation,
  AnalysisResult,
  EvaluationMetrics,
  GroundTruthAnnotation,
  SystemHealthInfo,
  VisionEvent,
} from '../types';

export async function checkSystemHealth(): Promise<SystemHealthInfo> {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function runAgenticInvestigation(params: {
  analysisId: string;
  videoMetadata: any;
  events: VisionEvent[];
  selectedKeyframes: any[];
  investigationFocus?: string;
  userHypothesis?: string;
}): Promise<{ status: string; investigation: AgentInvestigation; warning?: string }> {
  const res = await fetch('/api/investigate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Agentic investigation failed.');
  }
  return data;
}

export async function askFrameForensicQuestion(params: {
  frameB64: string;
  question: string;
  timestamp?: number;
  frameIndex?: number;
}): Promise<{ success: boolean; finding: string; model: string }> {
  const res = await fetch('/api/analyze-frame', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Frame forensic question failed.');
  }
  return data;
}

export async function computeEvaluationMetrics(params: {
  detectedEvents: VisionEvent[];
  groundTruth: GroundTruthAnnotation[];
  toleranceSeconds: number;
}): Promise<EvaluationMetrics> {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error('Evaluation computation request failed.');
  }
  return res.json();
}

export async function exportSignedReportBundle(reportData: any) {
  const res = await fetch('/api/export-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });

  return res.json();
}

/**
 * Downloads JSON object as a file
 */
export function downloadJsonFile(filename: string, data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converts events to CSV and initiates download
 */
export function downloadEventsCsv(filename: string, events: VisionEvent[]) {
  const headers = [
    'Event ID',
    'Timestamp (s)',
    'Frame Index',
    'Event Type',
    'Motion Intensity',
    'Method',
    'Motion Energy',
    'Bounding Boxes Count',
    'Reviewer Status',
    'Limitations',
  ];

  const rows = events.map((e) => [
    `"${e.id}"`,
    e.timestamp_seconds.toFixed(3),
    e.frame_index,
    `"${e.event_type}"`,
    e.motion_intensity !== undefined
      ? `${(e.motion_intensity * 100).toFixed(1)}%`
      : e.confidence !== undefined
      ? `${(e.confidence * 100).toFixed(1)}%`
      : 'Measured',
    `"${e.method.replace(/"/g, '""')}"`,
    e.motion_energy.toFixed(4),
    e.bounding_boxes.length,
    `"${e.reviewer_status}"`,
    `"${e.limitations.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
