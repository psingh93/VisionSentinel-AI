import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumMetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  variant?: 'gold' | 'green' | 'red' | 'neutral';
  onClick?: () => void;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  label,
  value,
  sublabel,
  icon: Icon,
  variant = 'gold',
  onClick,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'green':
        return {
          iconColor: 'text-[#24D18B]',
          valueColor: 'text-[#24D18B]',
          borderHover: 'hover:border-[#24D18B]/40',
          shadow: 'hover:shadow-[0_0_16px_rgba(36,209,139,0.12)]',
        };
      case 'red':
        return {
          iconColor: 'text-[#FF303B]',
          valueColor: 'text-[#FF303B]',
          borderHover: 'hover:border-[#FF303B]/40',
          shadow: 'hover:shadow-[0_0_16px_rgba(255,48,59,0.14)]',
        };
      case 'neutral':
        return {
          iconColor: 'text-[#A1A1AA]',
          valueColor: 'text-[#F5F5F5]',
          borderHover: 'hover:border-[#F5C542]/30',
          shadow: 'hover:shadow-[0_0_16px_rgba(245,197,66,0.08)]',
        };
      case 'gold':
      default:
        return {
          iconColor: 'text-[#F5C542]',
          valueColor: 'text-[#F5C542]',
          borderHover: 'hover:border-[#F5C542]/50',
          shadow: 'hover:shadow-[0_0_16px_rgba(245,197,66,0.12)]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      onClick={onClick}
      className={`bg-[#101010] border border-[#202020] rounded-xl p-5 transition-all duration-200 ${styles.borderHover} ${styles.shadow} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between text-xs text-[#A1A1AA] font-medium mb-2">
        <span>{label}</span>
        <div className="w-7 h-7 rounded-lg bg-[#151515] border border-[#202020] flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${styles.iconColor}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${styles.valueColor}`}>
        {value}
      </div>
      {sublabel && (
        <div className="text-[11px] text-[#A1A1AA] mt-1.5 font-mono">
          {sublabel}
        </div>
      )}
    </div>
  );
};
