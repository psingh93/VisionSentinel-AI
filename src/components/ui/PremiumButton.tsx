import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PremiumButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  onClick,
  variant = 'gold',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-[#151515] text-[#F5F5F5] hover:bg-[#202020] border border-[#202020] hover:border-[#F5C542]/40 shadow-sm';
      case 'danger':
        return 'bg-[#FF303B] text-white hover:bg-[#E02630] shadow-[0_0_15px_rgba(255,48,59,0.25)]';
      case 'ghost':
        return 'bg-transparent text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#151515] border border-transparent';
      case 'gold':
      default:
        return 'bg-[#F5C542] text-[#070707] hover:bg-[#FDE08B] font-bold shadow-[0_0_16px_rgba(245,197,66,0.25)] active:scale-[0.98]';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3 text-sm font-bold';
      case 'md':
      default:
        return 'px-4 py-2 text-xs font-semibold';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  );
};
