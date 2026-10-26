import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="p-10 md:p-14 bg-[#101010] border border-[#202020] rounded-xl text-center space-y-4 max-w-2xl mx-auto shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div className="w-12 h-12 rounded-xl bg-[#151515] border border-[#8C6A16]/60 text-[#F5C542] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,197,66,0.15)]">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-[#F5F5F5] tracking-tight">{title}</h3>
        <p className="text-xs text-[#A1A1AA] max-w-md mx-auto leading-relaxed">{description}</p>
      </div>
      {(actionLabel || secondaryActionLabel) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2 text-xs font-bold text-[#070707] bg-[#F5C542] hover:bg-[#FDE08B] rounded transition-all duration-200 shadow-[0_0_15px_rgba(245,197,66,0.25)] cursor-pointer active:scale-[0.98]"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2 text-xs font-semibold text-[#F5F5F5] bg-[#151515] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542]/40 rounded transition-all cursor-pointer"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
