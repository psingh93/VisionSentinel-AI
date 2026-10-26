import React from 'react';

interface StatusIndicatorProps {
  status: 'nominal' | 'alert' | 'warning' | 'idle';
  label: string;
  sublabel?: string;
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  sublabel,
  pulse = true,
}) => {
  const getColors = () => {
    switch (status) {
      case 'nominal':
        return {
          dot: 'bg-[#24D18B]',
          dotShadow: 'shadow-[0_0_8px_rgba(36,209,139,0.8)]',
          text: 'text-[#24D18B]',
          badge: 'bg-[#24D18B]/10 border-[#24D18B]/30',
        };
      case 'alert':
        return {
          dot: 'bg-[#FF303B]',
          dotShadow: 'shadow-[0_0_8px_rgba(255,48,59,0.8)]',
          text: 'text-[#FF303B]',
          badge: 'bg-[#FF303B]/10 border-[#FF303B]/30',
        };
      case 'warning':
        return {
          dot: 'bg-[#F5C542]',
          dotShadow: 'shadow-[0_0_8px_rgba(245,197,66,0.8)]',
          text: 'text-[#F5C542]',
          badge: 'bg-[#F5C542]/10 border-[#F5C542]/30',
        };
      case 'idle':
      default:
        return {
          dot: 'bg-[#A1A1AA]',
          dotShadow: 'shadow-none',
          text: 'text-[#A1A1AA]',
          badge: 'bg-[#151515] border-[#202020]',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono font-medium ${colors.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${colors.dotShadow} ${pulse && status !== 'idle' ? 'animate-pulse' : ''}`} />
      <span className={colors.text}>{label}</span>
      {sublabel && <span className="text-[#A1A1AA]">· {sublabel}</span>}
    </div>
  );
};
