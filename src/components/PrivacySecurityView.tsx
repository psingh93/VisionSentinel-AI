/**
 * VisionSentinel AI - Privacy & Security Governance
 * Ultra-Premium Obsidian Black + Metallic Gold + Deep Red Identity
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Trash2,
  AlertOctagon,
  Key,
  CheckCircle2,
} from 'lucide-react';

interface PrivacySecurityViewProps {
  onPurgeMemory: () => void;
  hasActiveData: boolean;
}

export const PrivacySecurityView: React.FC<PrivacySecurityViewProps> = ({
  onPurgeMemory,
  hasActiveData,
}) => {
  const [explicitConsent, setExplicitConsent] = useState(true);
  const [localOnlyMode, setLocalOnlyMode] = useState(true);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const handlePurge = () => {
    onPurgeMemory();
    setPurgeSuccess(true);
    setTimeout(() => setPurgeSuccess(false), 4000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 bg-[#070707]">
      {/* Header */}
      <div className="border-b border-[#202020] pb-5">
        <h1 className="text-xl font-bold text-[#F5F5F5] tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#F5C542]" />
          <span>Privacy &amp; Responsible AI Governance</span>
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          OpenCV AI Competition 2026 Privacy Framework: Local buffer processing, ethical guardrails, and cryptographic auditability.
        </p>
      </div>

      {purgeSuccess && (
        <div className="p-4 bg-[#101010] border border-[#24D18B] rounded-xl text-xs text-[#24D18B] flex items-center gap-2 shadow-[0_0_16px_rgba(36,209,139,0.15)]">
          <CheckCircle2 className="w-4 h-4 text-[#24D18B]" />
          <span>Active video memory buffers and cached evidence frames have been purged.</span>
        </div>
      )}

      {/* Governance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Data Retention & Local Buffer Control */}
        <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-3">
            <Lock className="w-4 h-4 text-[#F5C542]" />
            <span>Zero-Retention Video Buffer</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Uploaded video files are decoded directly in browser client memory buffers and temporary container sandboxes. No raw footage is persisted to cloud storage without explicit cryptographic instruction.
          </p>

          <div className="p-3 bg-[#070707] rounded-lg border border-[#202020] space-y-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={explicitConsent}
                onChange={(e) => setExplicitConsent(e.target.checked)}
                className="accent-[#F5C542] rounded"
              />
              <span className="text-[#F5F5F5]">
                Explicit upload &amp; computational inspection consent
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localOnlyMode}
                onChange={(e) => setLocalOnlyMode(e.target.checked)}
                className="accent-[#F5C542] rounded"
              />
              <span className="text-[#F5F5F5]">
                Ephemeral memory mode (auto-discard upon tab close)
              </span>
            </label>
          </div>

          <div className="pt-1">
            <button
              onClick={handlePurge}
              disabled={!hasActiveData}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#FF303B] hover:bg-[#E02630] rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_15px_rgba(255,48,59,0.3)]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Active Session Data Now</span>
            </button>
          </div>
        </div>

        {/* Card 2: Banned Capabilities & Ethical Red Lines */}
        <div className="bg-[#101010] border border-[#202020] rounded-xl p-5 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-3">
            <EyeOff className="w-4 h-4 text-[#FF303B]" />
            <span>Prohibited AI Capabilities</span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            In strict compliance with responsible AI research standards, VisionSentinel AI excludes intrusive or unverified biometric mechanisms:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-[#070707] rounded-lg border border-[#202020] flex items-start gap-2">
              <span className="text-[#FF303B] font-bold shrink-0">✕</span>
              <div className="text-[#A1A1AA]">
                <strong className="text-[#F5F5F5]">No Facial Recognition:</strong> Does not extract facial embeddings, identify individuals, or match faces to external databases.
              </div>
            </div>

            <div className="p-2.5 bg-[#070707] rounded-lg border border-[#202020] flex items-start gap-2">
              <span className="text-[#FF303B] font-bold shrink-0">✕</span>
              <div className="text-[#A1A1AA]">
                <strong className="text-[#F5F5F5]">No Subject Cross-Footage Stalking:</strong> No identity re-identification across independent or untrusted video feeds.
              </div>
            </div>

            <div className="p-2.5 bg-[#070707] rounded-lg border border-[#202020] flex items-start gap-2">
              <span className="text-[#FF303B] font-bold shrink-0">✕</span>
              <div className="text-[#A1A1AA]">
                <strong className="text-[#F5F5F5]">No Guilt or Intent Attribution:</strong> Motion clusters and pixel velocities are never described as criminal or suspicious activity without human review.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor Limitations & Transparency */}
      <div className="bg-[#101010] border border-[#202020] rounded-xl p-6 space-y-4 shadow-md">
        <div className="text-xs font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2 border-b border-[#202020] pb-3">
          <AlertOctagon className="w-4 h-4 text-[#F5C542]" />
          <span>Computer Vision &amp; Sensor Limitations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#070707] rounded-lg border border-[#202020] space-y-1">
            <div className="font-semibold text-[#F5F5F5]">Optical Distortion</div>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              Camera shake, rolling shutter artifacts, and wide-angle barrel distortion can produce false motion differentials.
            </p>
          </div>

          <div className="p-3.5 bg-[#070707] rounded-lg border border-[#202020] space-y-1">
            <div className="font-semibold text-[#F5F5F5]">Global Illumination Shifts</div>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              Sudden sunlight transitions, vehicle headlights, or fluorescent flicker may trigger histogram cuts.
            </p>
          </div>

          <div className="p-3.5 bg-[#070707] rounded-lg border border-[#202020] space-y-1">
            <div className="font-semibold text-[#F5F5F5]">Adversarial Text &amp; Audio</div>
            <p className="text-[#A1A1AA] text-[11px] leading-relaxed">
              Text or instructions embedded within uploaded footage are treated as untrusted input and ignored by the agent.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Security */}
      <div className="bg-[#101010] border border-[#202020] rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#F5F5F5] uppercase tracking-wider border-b border-[#202020] pb-2">
          <Key className="w-4 h-4 text-[#F5C542]" />
          <span>Server-Side Credential Protection</span>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          Google GenAI credentials are maintained strictly on the server-side process (<code className="text-[#F5C542] font-mono">process.env.GEMINI_API_KEY</code>) and are never dispatched to client browsers or bundled in frontend JavaScript. All multimodal reasoning calls route through authenticated <code className="text-[#F5C542] font-mono">/api/*</code> endpoints.
        </p>
      </div>
    </div>
  );
};
