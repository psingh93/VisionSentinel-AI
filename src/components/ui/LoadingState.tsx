import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  stage?: string;
  progress?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing video stream...',
  stage,
  progress,
}) => {
  return (
    <div className="p-8 bg-[#101010] border border-[#202020] rounded-xl text-center space-y-4 max-w-lg mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="w-12 h-12 rounded-xl bg-[#151515] border border-[#8C6A16]/50 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,197,66,0.12)]">
        <RefreshCw className="w-6 h-6 text-[#F5C542] animate-spin" />
      </div>
      <div className="space-y-1">
        <div className="text-sm font-bold text-[#F5F5F5]">{message}</div>
        {stage && <div className="text-xs text-[#F5C542] font-mono">{stage}</div>}
      </div>
      {progress !== undefined && (
        <div className="space-y-1 max-w-xs mx-auto">
          <div className="h-1.5 w-full bg-[#151515] rounded-full overflow-hidden border border-[#202020]">
            <div
              className="h-full bg-gradient-to-r from-[#D6A83E] to-[#F5C542] transition-all duration-200"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="text-[10px] text-[#A1A1AA] font-mono text-right">{progress.toFixed(0)}%</div>
        </div>
      )}
    </div>
  );
};
