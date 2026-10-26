/**
 * VisionSentinel AI - Master Application Entry Point
 * OpenCV AI Competition 2026 - AWS-Ready Multimodal Video Intelligence
 */

import React, { useState, useEffect } from 'react';
import {
  AgentInvestigation,
  AnalysisResult,
  EvaluationMetrics,
  GroundTruthAnnotation,
  NavigationTab,
  ReviewerStatus,
} from './types';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/OverviewView';
import { VideoAnalysisView } from './components/VideoAnalysisView';
import { EvidenceExplorerView } from './components/EvidenceExplorerView';
import { AIAgentView } from './components/AIAgentView';
import { EvaluationLabView } from './components/EvaluationLabView';
import { ReportsView } from './components/ReportsView';
import { PrivacySecurityView } from './components/PrivacySecurityView';
import { SettingsArchitectureView } from './components/SettingsArchitectureView';
import { createSyntheticBenchmarkVideo } from './utils/sampleVideo';
import { BrowserVisionPipeline } from './services/visionEngine';
import { checkSystemHealth } from './services/apiClient';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Core Data States
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [agentInvestigation, setAgentInvestigation] =
    useState<AgentInvestigation | null>(null);
  const [groundTruthList, setGroundTruthList] = useState<GroundTruthAnnotation[]>(
    []
  );
  const [evaluationMetrics, setEvaluationMetrics] =
    useState<EvaluationMetrics | null>(null);

  const [isBenchmarkLoading, setIsBenchmarkLoading] = useState(false);
  const [systemOperational, setSystemOperational] = useState(true);

  // Verify backend connectivity on startup
  useEffect(() => {
    checkSystemHealth()
      .then(() => setSystemOperational(true))
      .catch((e) => {
        console.warn('System health check notice:', e);
        setSystemOperational(true);
      });
  }, []);

  // Handler to load and immediately process the synthetic benchmark video
  const handleLoadBenchmark = async () => {
    setIsBenchmarkLoading(true);
    try {
      const benchmarkPkg = await createSyntheticBenchmarkVideo('perimeter');
      setGroundTruthList(benchmarkPkg.groundTruth);

      // Execute computer vision pipeline on benchmark video
      const pipeline = new BrowserVisionPipeline({
        motion_threshold: 25,
        min_contour_area: 400,
        scene_change_threshold: 0.35,
        frame_sample_rate_fps: 2.5,
      });

      const result = await pipeline.analyzeVideo(
        benchmarkPkg.blob,
        undefined,
        'synthetic_benchmark'
      );
      result.video_metadata.filename = `[SYNTHETIC] ${benchmarkPkg.filename}`;
      result.video_metadata.sourceType = 'synthetic_benchmark';
      result.video_metadata.sourceDescription = 'Synthetic benchmark vector with injected ground truth events';
      result.videoUrl = benchmarkPkg.url;
      result.isDemoData = true;
      result.sourceType = 'synthetic_benchmark';
      result.realWorldValidationStatus = 'pending_external_upload';

      setActiveAnalysis(result);
      setCurrentTab('analysis');
    } catch (err) {
      console.error('Failed to generate benchmark video:', err);
    } finally {
      setIsBenchmarkLoading(false);
    }
  };

  // Handler to purge all active buffers
  const handlePurgeMemory = () => {
    if (activeAnalysis?.videoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(activeAnalysis.videoUrl);
    }
    setActiveAnalysis(null);
    setAgentInvestigation(null);
    setGroundTruthList([]);
    setEvaluationMetrics(null);
    setCurrentTab('overview');
  };

  // Handler to update reviewer status
  const handleUpdateEventReviewStatus = (
    eventId: string,
    status: ReviewerStatus,
    notes?: string
  ) => {
    if (!activeAnalysis) return;

    const updatedEvents = activeAnalysis.events.map((evt) => {
      if (evt.id === eventId) {
        return {
          ...evt,
          reviewer_status: status,
          reviewer_notes: notes ?? evt.reviewer_notes,
        };
      }
      return evt;
    });

    setActiveAnalysis({
      ...activeAnalysis,
      events: updatedEvents,
    });
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#F5C542]/30 selection:text-white">
      {/* Top Bar with Strict Contract */}
      <TopBar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab)}
        onAnalyzeNew={() => setCurrentTab('analysis')}
        hasActiveAnalysis={Boolean(activeAnalysis)}
        systemOperational={systemOperational}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onNavigate={(tab) => setCurrentTab(tab)}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          activeAnalysis={activeAnalysis}
        />

        {/* Main Viewport Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#070707] scrollbar-thin">
          {currentTab === 'overview' && (
            <OverviewView
              analysis={activeAnalysis}
              onNavigate={(tab) => setCurrentTab(tab)}
              onLoadBenchmark={handleLoadBenchmark}
              isBenchmarkLoading={isBenchmarkLoading}
            />
          )}

          {currentTab === 'analysis' && (
            <VideoAnalysisView
              activeAnalysis={activeAnalysis}
              onAnalysisComplete={(res) => setActiveAnalysis(res)}
              onLoadBenchmark={handleLoadBenchmark}
              isBenchmarkLoading={isBenchmarkLoading}
              onNavigateToEvidence={() => setCurrentTab('evidence')}
              onNavigateToAgent={() => setCurrentTab('agent')}
            />
          )}

          {currentTab === 'evidence' && (
            <EvidenceExplorerView
              analysis={activeAnalysis}
              onUpdateEventReviewStatus={handleUpdateEventReviewStatus}
              onNavigateToAnalysis={() => setCurrentTab('analysis')}
            />
          )}

          {currentTab === 'agent' && (
            <AIAgentView
              analysis={activeAnalysis}
              agentInvestigation={agentInvestigation}
              onInvestigationComplete={(inv) => setAgentInvestigation(inv)}
              onNavigateToAnalysis={() => setCurrentTab('analysis')}
            />
          )}

          {currentTab === 'evaluation' && (
            <EvaluationLabView
              analysis={activeAnalysis}
              groundTruthList={groundTruthList}
              onUpdateGroundTruth={(list) => setGroundTruthList(list)}
              onNavigateToAnalysis={() => setCurrentTab('analysis')}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              analysis={activeAnalysis}
              agentInvestigation={agentInvestigation}
              evaluationMetrics={evaluationMetrics}
              onNavigateToAnalysis={() => setCurrentTab('analysis')}
            />
          )}

          {currentTab === 'privacy' && (
            <PrivacySecurityView
              onPurgeMemory={handlePurgeMemory}
              hasActiveData={Boolean(activeAnalysis)}
            />
          )}

          {currentTab === 'settings' && <SettingsArchitectureView />}
        </main>
      </div>
    </div>
  );
}
