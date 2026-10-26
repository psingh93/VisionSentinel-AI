/**
 * VisionSentinel AI - Agentic AI Forensic Inquiry Terminal
 * Military-grade, Zero-Trust multimodal command console for cross-examining visual frames,
 * generating timestamped pixel citations, and producing cryptographically signed forensic logs.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Keyframe, VisionEvent } from '../types';
import { askFrameForensicQuestion } from '../services/apiClient';
import {
  Terminal,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Cpu,
} from 'lucide-react';

interface ForensicInquiryTerminalProps {
  currentKeyframe: Keyframe | null;
  activeEvents: VisionEvent[];
  videoDuration: number;
}

interface TerminalLog {
  id: string;
  type: 'cmd' | 'system' | 'finding' | 'error';
  text: string;
  timestamp: string;
  metadata?: any;
}

export const ForensicInquiryTerminal: React.FC<ForensicInquiryTerminalProps> = ({
  currentKeyframe,
  activeEvents,
  videoDuration,
}) => {
  const [inquiryText, setInquiryText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: 'init-1',
      type: 'system',
      text: 'VISION_SENTINEL_AI :: AGENTIC MULTIMODAL FORENSIC CONSOLE INITIALIZED',
      timestamp: '00:00.001',
    },
    {
      id: 'init-2',
      type: 'system',
      text: 'SYSTEM PROTOCOL: ZERO-TRUST FORENSIC GROUNDING · MODEL: GEMINI 3.8 FLASH',
      timestamp: '00:00.004',
    },
    {
      id: 'init-3',
      type: 'system',
      text: 'AWAITING OPERATOR INQUIRY ON ACTIVE TEMPORAL CO-ORDINATES.',
      timestamp: '00:00.010',
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const nowStamp = () => {
    const d = new Date();
    return `${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  // Quick investigation chips
  const quickChips = [
    { label: 'Verify Perimeter Motion', query: 'Inspect motion contours at this timestamp. Is this genuine spatial movement or lighting anomaly?' },
    { label: 'Sensor Artifact Audit', query: 'Identify camera sensor artifacts, compression noise, or illumination shifts in this frame.' },
    { label: 'Scene Boundary Check', query: 'Cross-examine frame continuity. Does visual evidence support an algorithmic cut boundary?' },
    { label: 'Object & Spatial Inventory', query: 'Provide a structured objective visual inventory of all discernible objects in this frame.' },
  ];

  const handleExecuteInquiry = async (customQuery?: string) => {
    const query = (customQuery || inquiryText).trim();
    if (!query) return;

    if (!currentKeyframe) {
      setLogs((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          type: 'error',
          text: 'ERROR: NO EXTRACTED KEYFRAME LOADED AT ACTIVE TIMESTAMP. INGEST FOOTAGE FIRST.',
          timestamp: nowStamp(),
        },
      ]);
      return;
    }

    // Append command to log
    const cmdLog: TerminalLog = {
      id: `cmd_${Date.now()}`,
      type: 'cmd',
      text: `> INQUIRE [T=${currentKeyframe.timestamp_seconds.toFixed(2)}s] "${query}"`,
      timestamp: nowStamp(),
    };

    setLogs((prev) => [...prev, cmdLog]);
    setInquiryText('');
    setIsProcessing(true);

    try {
      const response = await askFrameForensicQuestion({
        frameB64: currentKeyframe.thumbnail_data,
        question: query,
        timestamp: currentKeyframe.timestamp_seconds,
        frameIndex: currentKeyframe.frame_index,
      });

      const findingLog: TerminalLog = {
        id: `find_${Date.now()}`,
        type: 'finding',
        text: response.finding,
        timestamp: nowStamp(),
        metadata: {
          timestamp: currentKeyframe.timestamp_seconds,
          frameIndex: currentKeyframe.frame_index,
          sha256: currentKeyframe.id,
        },
      };

      setLogs((prev) => [...prev, findingLog]);
    } catch (err: any) {
      const errorLog: TerminalLog = {
        id: `err_${Date.now()}`,
        type: 'error',
        text: `FAILED TO PROCESS FORENSIC QUERY: ${err.message || 'API connection failure.'}`,
        timestamp: nowStamp(),
      };
      setLogs((prev) => [...prev, errorLog]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearTerminal = () => {
    setLogs([
      {
        id: `clear_${Date.now()}`,
        type: 'system',
        text: 'TERMINAL STREAM CLEARED. SESSION BUFFER READY.',
        timestamp: nowStamp(),
      },
    ]);
  };

  return (
    <div className="bg-[#101010] border border-[#202020] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col h-[520px]">
      {/* Terminal Title Bar */}
      <div className="bg-[#151515] border-b border-[#202020] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF303B] shadow-[0_0_6px_rgba(255,48,59,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#F5C542] shadow-[0_0_6px_rgba(245,197,66,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#24D18B] shadow-[0_0_6px_rgba(36,209,139,0.6)]" />
          <span className="text-[#F5F5F5] font-bold ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#F5C542]" />
            FORENSIC AI INQUIRY TERMINAL
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#A1A1AA]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#24D18B] animate-ping" />
            LIVE LINK: GEMINI 3.8 FLASH
          </span>
          <button
            onClick={clearTerminal}
            className="text-[#A1A1AA] hover:text-[#F5C542] transition-colors cursor-pointer"
            title="Clear Terminal Buffer"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Terminal Stream Output Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs bg-[#070707] select-text scrollbar-thin">
        {logs.map((log) => {
          if (log.type === 'system') {
            return (
              <div key={log.id} className="text-[#A1A1AA] text-[11px] flex items-start gap-2 leading-relaxed">
                <span className="text-[#8C6A16] shrink-0">[{log.timestamp}]</span>
                <span className="text-[#A1A1AA]">{log.text}</span>
              </div>
            );
          }

          if (log.type === 'cmd') {
            return (
              <div key={log.id} className="text-[#F5C542] font-semibold text-xs flex items-start gap-2 pt-1">
                <span className="text-[#FDE08B] shrink-0">[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            );
          }

          if (log.type === 'error') {
            return (
              <div key={log.id} className="p-2.5 bg-[#FF303B]/10 border border-[#FF303B]/40 rounded text-[#FF303B] text-xs flex items-start gap-2 my-1">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{log.text}</span>
              </div>
            );
          }

          if (log.type === 'finding') {
            return (
              <div
                key={log.id}
                className="p-3.5 bg-[#151515] border border-[#F5C542]/40 rounded-lg space-y-2.5 shadow-[0_0_15px_rgba(245,197,66,0.08)] my-2"
              >
                <div className="flex items-center justify-between border-b border-[#202020] pb-1.5 text-[10px]">
                  <span className="text-[#F5C542] font-bold flex items-center gap-1.5 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5C542]" />
                    Forensic Multimodal Assessment
                  </span>
                  <span className="text-[#24D18B] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> VERIFIED EVIDENCE
                  </span>
                </div>

                <div className="text-[#F5F5F5] text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {log.text}
                </div>

                {log.metadata?.sha256 && (
                  <div className="pt-2 border-t border-[#202020] flex flex-wrap items-center justify-between text-[10px] text-[#A1A1AA] gap-2">
                    <span className="flex items-center gap-1">
                      <Fingerprint className="w-3 h-3 text-[#F5C542]" />
                      SHA-256: <span className="text-[#FDE08B]">{log.metadata.sha256}</span>
                    </span>
                    <span>T={log.metadata.timestamp.toFixed(2)}s</span>
                  </div>
                )}
              </div>
            );
          }

          return null;
        })}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-[#F5C542] font-mono animate-pulse">
            <span className="w-2 h-2 rounded-full bg-[#F5C542]" />
            <span>AGENT EXECUTING NEURAL CONVNET & LLM REASONING CHAIN...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Quick Inquiry Chips Ribbon */}
      <div className="px-3 py-2 bg-[#0D0D0D] border-t border-[#202020] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-[#A1A1AA] shrink-0 mr-1 flex items-center gap-1">
          <Cpu className="w-3 h-3 text-[#F5C542]" /> PROMPT_CHIPS:
        </span>
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleExecuteInquiry(chip.query)}
            disabled={isProcessing}
            className="px-2.5 py-1 rounded bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542]/50 text-[#F5F5F5] hover:text-[#F5C542] text-[10px] font-mono whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Operator Command Input */}
      <div className="p-3 bg-[#101010] border-t border-[#202020] flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inquiryText}
            onChange={(e) => setInquiryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleExecuteInquiry();
              }
            }}
            placeholder={
              currentKeyframe
                ? `Enter forensic inquiry for frame @ ${currentKeyframe.timestamp_seconds.toFixed(2)}s...`
                : 'Awaiting video keyframe selection...'
            }
            disabled={isProcessing}
            className="w-full bg-[#070707] border border-[#202020] focus:border-[#F5C542] rounded-lg px-3.5 py-2 text-xs font-mono text-[#F5F5F5] placeholder-[#A1A1AA]/60 outline-none transition-all shadow-inner"
          />
        </div>

        <button
          onClick={() => handleExecuteInquiry()}
          disabled={isProcessing || !inquiryText.trim()}
          className="px-4 py-2 bg-[#F5C542] hover:bg-[#FDE08B] text-[#070707] font-bold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(245,197,66,0.2)] active:scale-95 shrink-0"
        >
          <Send className="w-3.5 h-3.5 text-[#070707]" />
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};
