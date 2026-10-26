/**
 * VisionSentinel AI - Top Navigation Bar
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React from 'react';
import { NavigationTab } from '../types';
import { Video, Shield, Eye, Bell } from 'lucide-react';

interface TopBarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  onAnalyzeNew: () => void;
  hasActiveAnalysis: boolean;
  systemOperational: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onNavigate,
  onAnalyzeNew,
  hasActiveAnalysis,
  systemOperational,
}) => {
  const getBreadcrumb = () => {
    switch (currentTab) {
      case 'overview':
        return 'System Overview';
      case 'analysis':
        return 'Video Analysis Workstation';
      case 'evidence':
        return 'Evidence Explorer & Ledger';
      case 'agent':
        return 'AI Multimodal Investigation';
      case 'evaluation':
        return 'Evaluation & Precision Benchmark';
      case 'reports':
        return 'Audit Dossiers & Compliance';
      case 'privacy':
        return 'Privacy & Responsible Governance';
      case 'settings':
        return 'Settings & AWS Cloud Architecture';
      default:
        return 'Command Console';
    }
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#070707] border-b border-[#202020] sticky top-0 z-30">
      {/* Zone 1: Wordmark with original Eye & Shield Emblem and Subtitle */}
      <div className="flex items-center gap-3.5 shrink-0">
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('overview');
          }}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          {/* Original Eye & Shield Emblem */}
          <div className="w-8 h-8 rounded-lg border border-[#8C6A16]/80 bg-gradient-to-br from-[#1A1A1A] via-[#101010] to-[#070707] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(245,197,66,0.18)] group-hover:border-[#F5C542] group-hover:shadow-[0_0_20px_rgba(245,197,66,0.28)] transition-all relative">
            <Shield className="w-4 h-4 text-[#D6A83E]" />
            <Eye className="w-2.5 h-2.5 text-[#F5C542] absolute" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#F5F5F5] group-hover:text-[#FDE08B] transition-colors whitespace-nowrap leading-none flex items-center gap-1.5">
              <span>VisionSentinel</span>
              <span className="text-[#F5C542]">AI</span>
            </div>
            <div className="text-[9px] font-mono tracking-widest text-[#A1A1AA] uppercase mt-0.5 whitespace-nowrap">
              AGENTIC COMPUTER VISION
            </div>
          </div>
        </a>
      </div>

      {/* Zone 2: Contextual Breadcrumb & Real System Engine Health */}
      <div className="hidden md:flex items-center gap-4 text-xs font-medium text-[#A1A1AA] whitespace-nowrap">
        <span className="text-[#F5F5F5] font-semibold">{getBreadcrumb()}</span>
        <span aria-hidden="true" className="text-[#202020]">·</span>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span
            className={`w-2 h-2 rounded-full ${
              systemOperational
                ? 'bg-[#24D18B] shadow-[0_0_8px_rgba(36,209,139,0.7)]'
                : 'bg-[#FF303B] shadow-[0_0_8px_rgba(255,48,59,0.7)]'
            }`}
          />
          <span className={systemOperational ? 'text-[#A1A1AA]' : 'text-[#FF303B]'}>
            Backend: {systemOperational ? 'Operational' : 'Reconnecting'}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Action & Notifications */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onAnalyzeNew}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all duration-200 shadow-[0_0_16px_rgba(245,197,66,0.25)] whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98]"
        >
          <Video className="w-3.5 h-3.5 text-[#070707]" />
          <span>Analyze Video</span>
        </button>
      </div>
    </header>
  );
};
