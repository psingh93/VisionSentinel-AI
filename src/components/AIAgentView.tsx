/**
 * VisionSentinel AI - Agentic AI Multimodal Investigation
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React, { useState, useEffect } from 'react';
import {
  AgentInvestigation,
  AnalysisResult,
  SystemHealthInfo,
} from '../types';
import { runAgenticInvestigation, checkSystemHealth } from '../services/apiClient';
import {
  Sparkles,
  ShieldAlert,
  Clock,
  AlertCircle,
  Cpu,
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { EmptyState } from './ui';

interface AIAgentViewProps {
  analysis: AnalysisResult | null;
  agentInvestigation: AgentInvestigation | null;
  onInvestigationComplete: (investigation: AgentInvestigation) => void;
  onNavigateToAnalysis: () => void;
}

export const AIAgentView: React.FC<AIAgentViewProps> = ({
  analysis,
  agentInvestigation,
  onInvestigationComplete,
  onNavigateToAnalysis,
}) => {
  const [investigationFocus, setInvestigationFocus] = useState(
    'Identify and cross-examine visual events, inspect motion clusters, verify whether scene boundaries correspond to genuine cuts, and document physical sensor limitations.'
  );
  const [userHypothesis, setUserHypothesis] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiHealth, setAiHealth] = useState<{ configured: boolean; model: string } | null>(null);

  useEffect(() => {
    checkSystemHealth()
      .then((h) => {
        setAiHealth({
          configured: h.ai_engine.configured,
          model: h.ai_engine.model,
        });
      })
      .catch((e) => {
        console.warn('AI health probe notice:', e);
      });
  }, []);

  if (!analysis) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 bg-[#070707]">
        <EmptyState
          icon={Brain}
          title="No Footage Pipeline Data"
          description="Run the computer vision pipeline on a video file first. The Agentic Investigation engine requires extracted frames and algorithmic event telemetry to reason upon."
          actionLabel="Go to Video Analysis"
          onAction={onNavigateToAnalysis}
        />
      </div>
    );
  }

  const handleRunInvestigation = async () => {
    setIsRunning(true);
    setErrorMessage(null);

    try {
      if (!analysis.keyframes || analysis.keyframes.length === 0) {
        throw new Error('No extracted keyframes available. Please re-run video analysis to capture evidence frames.');
      }

      const topKeyframes = [...analysis.keyframes]
        .sort((a, b) => b.motion_score - a.motion_score)
        .slice(0, 4);

      const res = await runAgenticInvestigation({
        analysisId: analysis.analysis_id,
        videoMetadata: analysis.video_metadata,
        events: analysis.events,
        selectedKeyframes: topKeyframes,
        investigationFocus,
        userHypothesis: userHypothesis.trim() || undefined,
      });

      onInvestigationComplete(res.investigation);
    } catch (err: any) {
      console.error('Investigation error:', err);
      setErrorMessage(err.message || 'Agentic investigation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 bg-[#070707]">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#202020] pb-5">
        <div>
          <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#F5C542]" />
            <span>Agentic AI Multimodal Investigation</span>
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Controlled vision-language agent using Gemini 3.8 Flash. Analyzes keyframes, correlates events, and enforces ethical evidence boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="text-[#F5F5F5] bg-[#101010] border border-[#202020] px-3.5 py-1.5 rounded flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[#F5C542]" />
            <span>
              Engine: <strong className="text-[#F5C542]">{aiHealth?.model || 'gemini-3.8-flash'}</strong>
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                aiHealth?.configured ? 'bg-[#24D18B]' : 'bg-[#F5C542]'
              }`}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-[#101010] border border-[#FF303B]/60 rounded-xl text-xs text-[#F5F5F5] flex items-start justify-between gap-3 shadow-[0_0_15px_rgba(255,48,59,0.1)]">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-[#FF303B] shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-[#FF303B]">Investigation Engine Notice</div>
              <div className="text-[#A1A1AA] mt-0.5 leading-relaxed">{errorMessage}</div>
            </div>
          </div>
          <button
            onClick={handleRunInvestigation}
            disabled={isRunning}
            className="shrink-0 px-3 py-1 bg-[#151515] hover:bg-[#202020] text-[#F5C542] border border-[#202020] hover:border-[#F5C542]/50 rounded text-xs font-mono transition-all cursor-pointer"
          >
            Retry Check
          </button>
        </div>
      )}

      {/* Investigation Config & Dispatch Panel */}
      <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
        <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2 border-b border-[#202020] pb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
          <span>Investigation Parameters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-[#F5F5F5] font-medium">
              Investigation Mandate / Focus Prompt:
            </label>
            <textarea
              rows={3}
              value={investigationFocus}
              onChange={(e) => setInvestigationFocus(e.target.value)}
              className="w-full bg-[#070707] border border-[#202020] rounded-lg p-2.5 text-xs text-[#F5F5F5] placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#F5C542] font-mono leading-relaxed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#F5F5F5] font-medium">
              Reviewer Hypothesis to Test (Optional):
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Does the motion event at t=2.0s correspond to an authorized perimeter crossing or sensor vibration?"
              value={userHypothesis}
              onChange={(e) => setUserHypothesis(e.target.value)}
              className="w-full bg-[#070707] border border-[#202020] rounded-lg p-2.5 text-xs text-[#F5F5F5] placeholder-[#A1A1AA]/60 focus:outline-none focus:border-[#F5C542] font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Responsible AI Boundary banner */}
        <div className="p-3.5 bg-[#0D0D0D] border border-[#8C6A16]/50 rounded-lg flex items-start gap-3 text-[11px] text-[#A1A1AA] leading-relaxed">
          <ShieldAlert className="w-4 h-4 text-[#F5C542] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#FDE08B]">Strict Evidence Separation: </strong>
            VisionSentinel AI strictly distinguishes between verified sensor observations, AI interpretive hypotheses, and recommended human review steps. No face biometrics or automated guilt determinations are permitted.
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunInvestigation}
            disabled={isRunning}
            className="px-6 py-2.5 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] disabled:bg-[#151515] disabled:text-[#A1A1AA] rounded transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_16px_rgba(245,197,66,0.25)]"
          >
            <Sparkles className="w-4 h-4 text-[#070707]" />
            <span>
              {isRunning
                ? 'Reasoning across keyframes (Gemini 3.8 Flash)...'
                : 'Execute Agentic Investigation'}
            </span>
          </button>
        </div>
      </div>

      {/* Investigation Results Display */}
      {agentInvestigation && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="bg-[#101010] border border-[#8C6A16]/60 rounded-xl p-6 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202020] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider">
                  Agent Executive Synthesis
                </span>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Model: <span className="text-[#F5C542] font-semibold">{agentInvestigation.modelUsed || 'gemini-3.8-flash'}</span> · {agentInvestigation.executionTimeMs}ms
                </span>
              </div>

              <div className="text-xs font-mono">
                <span className="text-[#A1A1AA] mr-1.5">Certainty:</span>
                <span className="font-bold text-[#FDE08B] bg-[#070707] px-2.5 py-0.5 rounded border border-[#8C6A16]/60">
                  {agentInvestigation.confidenceRating}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#F5F5F5] leading-relaxed font-sans">
              {agentInvestigation.summary}
            </p>
          </div>

          {/* Tri-Partite Evidence Architecture: OBSERVED vs AI INTERPRETATION vs RECOMMENDATION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: OBSERVED FACTS (Directly Grounded in CV Output) */}
            <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between border-b border-[#202020] pb-3">
                <span className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#24D18B]/10 border border-[#24D18B]/30 text-[#24D18B] font-mono text-[10px]">
                    OBSERVED
                  </span>
                  <span>Frame-Level Sensor Facts</span>
                </span>
                <span className="text-[11px] font-mono text-[#F5C542]">
                  {agentInvestigation.observations.length} points
                </span>
              </div>

              <div className="space-y-3">
                {agentInvestigation.observations.map((obs, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#070707] border border-[#202020] rounded-lg space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[#F5C542] font-semibold">
                        t={obs.timestamp}s ({obs.frameId})
                      </span>
                      <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#151515] px-2 py-0.5 rounded border border-[#202020]">
                        {obs.certaintyLevel} Certainty
                      </span>
                    </div>

                    <div className="text-[#F5F5F5] leading-relaxed">
                      {obs.visualFinding}
                    </div>

                    {obs.limitations && (
                      <div className="text-[11px] text-[#A1A1AA] italic">
                        Constraint: {obs.limitations}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: AI INTERPRETATION & Event Correlations */}
            <div className="space-y-6">
              <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4">
                <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between border-b border-[#202020] pb-3">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#F5C542]/10 border border-[#F5C542]/30 text-[#F5C542] font-mono text-[10px]">
                      AI INTERPRETATION
                    </span>
                    <span>Correlated Hypotheses</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {agentInvestigation.hypotheses.map((hyp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#070707] border border-[#202020] rounded-lg space-y-2 text-xs"
                    >
                      <div className="font-semibold text-[#F5F5F5]">
                        {hyp.hypothesis}
                      </div>
                      <div className="text-[11px] text-[#A1A1AA] space-y-1">
                        <div>
                          <strong className="text-[#24D18B]">Supporting Evidence: </strong>
                          {hyp.supportingEvidence}
                        </div>
                        <div>
                          <strong className="text-[#F5C542]">Uncertainty Factors: </strong>
                          {hyp.counterEvidence}
                        </div>
                        <div className="p-2.5 bg-[#151515] rounded border border-[#8C6A16]/50 mt-1.5 space-y-0.5">
                          <div className="text-[10px] font-mono text-[#FDE08B] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                            <span>RECOMMENDATION (Human Action)</span>
                          </div>
                          <div className="text-[#F5F5F5]">
                            {hyp.requiredHumanAction}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Correlations */}
              <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-3 shadow-sm">
                <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-3">
                  Algorithmic Event Correlation
                </div>

                <div className="space-y-2.5">
                  {agentInvestigation.eventCorrelations.map((ec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#070707] border border-[#202020] rounded text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[#F5F5F5] font-semibold">
                          Event {ec.eventId}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            ec.verified
                              ? 'bg-[#101010] text-[#24D18B] border-[#24D18B]/50'
                              : 'bg-[#101010] text-[#F5C542] border-[#8C6A16]/60'
                          }`}
                        >
                          {ec.verified ? 'Verified Correlation' : 'Uncorrelated'}
                        </span>
                      </div>
                      <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
                        {ec.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audit Trail: Agent Execution Steps with Gold Indicators */}
          {agentInvestigation.agentExecutionSteps && (
            <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-3 shadow-md">
              <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between border-b border-[#202020] pb-3">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F5C542]" />
                  <span>Agent Execution Audit Trail</span>
                </span>
                <span className="text-[11px] font-mono text-[#A1A1AA]">
                  Deterministic Step Log
                </span>
              </div>

              <div className="divide-y divide-[#202020]">
                {agentInvestigation.agentExecutionSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="py-2.5 flex items-start justify-between gap-4 text-xs font-mono"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-[#F5C542] font-bold">
                        [Step {step.stepNumber}]
                      </span>
                      <div>
                        <div className="text-[#F5F5F5] font-semibold font-sans">
                          {step.stepName}
                        </div>
                        <div className="text-[#A1A1AA] text-[11px] font-sans">
                          {step.actionTaken}
                        </div>
                      </div>
                    </div>
                    <span className="text-[#FDE08B] shrink-0 font-bold">
                      +{step.timestampMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
