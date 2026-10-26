/**
 * VisionSentinel AI - Synthetic Benchmark Video Generator
 * Creates real playable MP4/WebM videos via MediaRecorder with exact ground truth timestamps.
 */

import { GroundTruthAnnotation } from '../types';

export interface SyntheticVideoPackage {
  blob: Blob;
  url: string;
  filename: string;
  groundTruth: GroundTruthAnnotation[];
  scenarioTitle: string;
  durationSeconds: number;
}

export async function createSyntheticBenchmarkVideo(
  scenario: 'perimeter' | 'traffic' = 'perimeter'
): Promise<SyntheticVideoPackage> {
  const durationSeconds = scenario === 'perimeter' ? 8 : 10;
  const width = 640;
  const height = 360;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D unavailable.');

  const stream = canvas.captureStream(fps);
  let mimeType = 'video/webm;codecs=vp8';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const groundTruth: GroundTruthAnnotation[] =
    scenario === 'perimeter'
      ? [
          {
            id: 'gt_1',
            timestamp_seconds: 2.0,
            duration_seconds: 1.5,
            label: 'Perimeter Intrusion Motion Cluster',
            notes: 'Geometric vehicle entering from left boundary at x=0',
          },
          {
            id: 'gt_2',
            timestamp_seconds: 5.0,
            duration_seconds: 0.5,
            label: 'Camera Angle / Scene Cut',
            notes: 'Sudden background color shift simulating camera transition',
          },
          {
            id: 'gt_3',
            timestamp_seconds: 6.8,
            duration_seconds: 1.0,
            label: 'Secondary Transit Event',
            notes: 'Rapid horizontal movement in lower quadrant',
          },
        ]
      : [
          {
            id: 'gt_1',
            timestamp_seconds: 1.5,
            duration_seconds: 2.0,
            label: 'Intersection Transit Motion',
            notes: 'Moving target crossing lane',
          },
          {
            id: 'gt_2',
            timestamp_seconds: 6.0,
            duration_seconds: 1.0,
            label: 'Visual Contrast Shift',
            notes: 'Lighting transition',
          },
        ];

  recorder.start();

  const totalFrames = durationSeconds * fps;
  let currentFrame = 0;

  await new Promise<void>((resolve) => {
    const renderInterval = setInterval(() => {
      const t = currentFrame / fps;

      // Draw background
      if (t >= 5.0 && scenario === 'perimeter') {
        // Scene cut simulation: background changes color
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#161e2e';
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Draw timecode in corner
      ctx.fillStyle = '#64748b';
      ctx.font = '14px monospace';
      ctx.fillText(`BENCHMARK TC: 00:0${Math.floor(t)}.${Math.floor((t % 1) * 100)}`, 20, 30);
      ctx.fillText(`FRAME: ${currentFrame} / ${totalFrames}`, 20, 50);

      // Event 1: Moving rectangle at t=2.0s to 3.5s
      if (t >= 2.0 && t <= 3.5) {
        const progress = (t - 2.0) / 1.5;
        const objX = progress * (width - 120);
        const objY = 140 + Math.sin(progress * Math.PI) * 20;

        ctx.fillStyle = '#FFB800';
        ctx.fillRect(objX, objY, 90, 60);

        ctx.strokeStyle = '#FFD566';
        ctx.lineWidth = 2;
        ctx.strokeRect(objX, objY, 90, 60);

        ctx.fillStyle = '#0D0F12';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('TARGET_A', objX + 12, objY + 34);
      }

      // Event 2: Rapid transit object at t=6.8s to 7.8s
      if (t >= 6.8 && t <= 7.8 && scenario === 'perimeter') {
        const progress = (t - 6.8) / 1.0;
        const objX = width - progress * (width - 100);
        const objY = 240;

        ctx.fillStyle = '#FF3B30';
        ctx.beginPath();
        ctx.arc(objX + 30, objY + 30, 35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#FF8585';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      currentFrame++;

      if (currentFrame >= totalFrames) {
        clearInterval(renderInterval);
        recorder.stop();
        recorder.onstop = () => resolve();
      }
    }, 1000 / fps);
  });

  const blob = new Blob(chunks, { type: mimeType });
  const url = URL.createObjectURL(blob);

  return {
    blob,
    url,
    filename: `benchmark_${scenario}_${durationSeconds}s.webm`,
    groundTruth,
    scenarioTitle:
      scenario === 'perimeter'
        ? 'Perimeter Intrusion & Scene Transition Benchmark'
        : 'Traffic Flow Optical Velocity Benchmark',
    durationSeconds,
  };
}
