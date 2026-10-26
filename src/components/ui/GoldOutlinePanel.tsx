import React from 'react';

interface GoldOutlinePanelProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  highlightAlert?: boolean;
}

export const GoldOutlinePanel: React.FC<GoldOutlinePanelProps> = ({
  children,
  className = '',
  glow = false,
  highlightAlert = false,
}) => {
  return (
    <div
      className={`relative bg-[#101010] border rounded-xl overflow-hidden transition-all duration-200 ${
        highlightAlert
          ? 'border-[#FF303B]/50 shadow-[0_0_20px_rgba(255,48,59,0.12)]'
          : glow
          ? 'border-[#F5C542]/40 shadow-[0_0_20px_rgba(245,197,66,0.12)]'
          : 'border-[#202020] hover:border-[#F5C542]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
      } ${className}`}
    >
      {children}
    </div>
  );
};
