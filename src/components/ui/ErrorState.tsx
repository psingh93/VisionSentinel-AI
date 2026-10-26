import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Processing Notice',
  message,
  onRetry,
  retryLabel = 'Retry',
}) => {
  return (
    <div className="p-4 bg-[#101010] border border-[#FF303B]/60 rounded-xl flex items-start justify-between gap-4 text-xs shadow-[0_0_20px_rgba(255,48,59,0.12)]">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#151515] border border-[#FF303B]/40 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-4 h-4 text-[#FF303B]" />
        </div>
        <div className="space-y-0.5">
          <div className="font-bold text-[#FF303B] uppercase tracking-wider">{title}</div>
          <div className="text-[#A1A1AA] leading-relaxed">{message}</div>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#FF303B]/50 text-[#F5F5F5] font-mono transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#FF303B]" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
};
