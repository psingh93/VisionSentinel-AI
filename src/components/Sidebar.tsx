/**
 * VisionSentinel AI - Collapsible Navigation Sidebar
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React from 'react';
import {
  NavigationTab,
  AnalysisResult,
} from '../types';
import {
  LayoutDashboard,
  Video,
  Search,
  Sparkles,
  BarChart3,
  FileText,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  Eye,
} from 'lucide-react';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  activeAnalysis: AnalysisResult | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  activeAnalysis,
}) => {
  const navItems = [
    { id: 'overview' as NavigationTab, label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'analysis' as NavigationTab, label: 'Video Analysis', icon: Video },
    { id: 'evidence' as NavigationTab, label: 'Evidence Explorer', icon: Search },
    { id: 'agent' as NavigationTab, label: 'AI Investigation', icon: Sparkles },
    { id: 'evaluation' as NavigationTab, label: 'Evaluation Lab', icon: BarChart3 },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileText },
    { id: 'privacy' as NavigationTab, label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'settings' as NavigationTab, label: 'Settings & Cloud', icon: Settings },
  ];

  return (
    <aside
      className={`bg-[#0A0A0A] border-r border-[#202020] flex flex-col justify-between transition-all duration-200 z-20 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div>
        {/* Header / Brand in Sidebar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#202020]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-6 h-6 rounded border border-[#8C6A16]/80 bg-gradient-to-tr from-[#151515] to-[#101010] flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,197,66,0.18)] relative">
                <Shield className="w-3.5 h-3.5 text-[#D6A83E]" />
                <Eye className="w-2 h-2 text-[#F5C542] absolute" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-[#F5F5F5] tracking-tight truncate leading-none">
                  VisionSentinel <span className="text-[#F5C542]">AI</span>
                </div>
                <div className="text-[9px] text-[#A1A1AA] font-mono tracking-widest uppercase mt-0.5">
                  COMMAND CONSOLE
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-7 h-7 rounded border border-[#8C6A16] bg-[#101010] flex items-center justify-center relative">
                <Shield className="w-4 h-4 text-[#D6A83E]" />
                <Eye className="w-2.5 h-2.5 text-[#F5C542] absolute" />
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="p-1 rounded text-[#A1A1AA] hover:text-[#F5C542] hover:bg-[#151515] transition-colors ml-auto cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 text-left relative cursor-pointer ${
                  isActive
                    ? 'bg-[#151515] text-[#F5F5F5] font-semibold border border-[#F5C542]/40 shadow-[0_0_16px_rgba(245,197,66,0.12)]'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#101010] border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#F5C542]' : 'text-[#A1A1AA]'
                  }`}
                />
                {!isCollapsed && (
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                )}
                {isActive && !isCollapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F5C542] shadow-[0_0_8px_rgba(245,197,66,0.9)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info: active footage & cloud status */}
      <div className="p-3 border-t border-[#202020]">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="bg-[#101010] rounded-lg border border-[#202020] p-2.5">
              <div className="text-[11px] font-semibold text-[#F5C542] flex items-center gap-1.5 mb-1">
                <Database className="w-3 h-3 text-[#F5C542]" />
                <span>Active Video Data</span>
              </div>
              {activeAnalysis ? (
                <div className="text-[11px] text-[#A1A1AA] font-mono space-y-0.5 truncate">
                  <div className="truncate text-[#F5F5F5] font-medium">
                    {activeAnalysis.video_metadata.filename}
                  </div>
                  <div className="text-[10px]">
                    {activeAnalysis.video_metadata.duration_seconds}s · <span className="text-[#F5C542]">{activeAnalysis.events.length} events</span>
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-[#A1A1AA] italic">
                  No video ingested yet
                </div>
              )}
            </div>

            <div className="text-[10px] text-[#A1A1AA] px-1 flex items-center justify-between font-mono">
              <span>AWS ECS READY</span>
              <span className="text-[#24D18B] font-semibold">STANDBY</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="AWS Architecture Ready">
            <Database className="w-4 h-4 text-[#8C6A16]" />
          </div>
        )}
      </div>
    </aside>
  );
};
