import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { springSoft } from '../../lib/motion';

export interface KpiTileProps {
  title: string;
  value: React.ReactNode;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'lavender' | 'peach' | 'mint' | 'ink' | 'rose' | 'sky' | 'amber';
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'info' | 'purple';
  };
  className?: string;
  onClick?: () => void;
}

export function KpiTile({
  title,
  value,
  unit,
  subtitle,
  icon,
  color = 'lavender',
  badge,
  className,
  onClick,
}: KpiTileProps) {
  const prefersReducedMotion = useReducedMotion();

  const colorStyles = {
    lavender: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#F7F2FF]/85 to-[#EFE6FF]/70',
      border: 'border-purple-200/70',
      iconBg: 'bg-[#E9DEFF] text-purple-900 ring-2 ring-purple-100',
      valueColor: 'text-[#432C7A] dark:text-purple-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(233,222,255,0.45)]',
    },
    peach: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#FFF5EF]/85 to-[#FFEADF]/70',
      border: 'border-orange-200/70',
      iconBg: 'bg-[#FFE5D9] text-amber-950 ring-2 ring-amber-100',
      valueColor: 'text-[#854D0E] dark:text-amber-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(255,229,217,0.45)]',
    },
    mint: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#F2FAF6]/85 to-[#E1F5EC]/70',
      border: 'border-emerald-200/70',
      iconBg: 'bg-[#D9F2E6] text-emerald-950 ring-2 ring-emerald-100',
      valueColor: 'text-[#166534] dark:text-emerald-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(217,242,230,0.45)]',
    },
    ink: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#F6F5FA]/85 to-[#ECEAF4]/70',
      border: 'border-ink-200/70',
      iconBg: 'bg-ink-100 text-ink-900 ring-2 ring-ink-50',
      valueColor: 'text-ink-900',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(45,42,74,0.08)]',
    },
    rose: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#FFF1F2]/85 to-[#FFE4E6]/70',
      border: 'border-rose-200/70',
      iconBg: 'bg-[#FFE4E6] text-rose-950 ring-2 ring-rose-100',
      valueColor: 'text-rose-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(255,228,230,0.45)]',
    },
    sky: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#F0F9FF]/85 to-[#E0F2FE]/70',
      border: 'border-sky-200/70',
      iconBg: 'bg-[#E0F2FE] text-sky-950 ring-2 ring-sky-100',
      valueColor: 'text-sky-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(224,242,254,0.45)]',
    },
    amber: {
      cardBg: 'bg-gradient-to-br from-white/90 via-[#FFFBEB]/85 to-[#FEF3C7]/70',
      border: 'border-amber-200/70',
      iconBg: 'bg-[#FEF3C7] text-amber-950 ring-2 ring-amber-100',
      valueColor: 'text-amber-950',
      accentGlow: 'hover:shadow-[0_12px_28px_rgba(254,243,199,0.45)]',
    },
  }[color];

  const badgeStyles = {
    success: 'bg-[#D9F2E6] text-emerald-900 border-emerald-300/60',
    warning: 'bg-[#FEF3C7] text-amber-900 border-amber-300/60',
    info: 'bg-[#E0F2FE] text-sky-900 border-sky-300/60',
    purple: 'bg-[#E9DEFF] text-purple-900 border-purple-300/60',
  }[badge?.variant || 'purple'];

  return (
    <motion.div
      onClick={onClick}
      whileHover={
        !prefersReducedMotion ? { scale: 1.02, y: -2 } : undefined
      }
      whileTap={!prefersReducedMotion && onClick ? { scale: 0.98 } : undefined}
      transition={springSoft}
      className={cn(
        'relative rounded-2xl p-4 border backdrop-blur-xl shadow-soft transition-all duration-300 select-none overflow-hidden',
        colorStyles.cardBg,
        colorStyles.border,
        colorStyles.accentGlow,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Decorative subtle glass shine */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-white/40 blur-xl pointer-events-none" />

      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 truncate">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform',
              colorStyles.iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span
          className={cn(
            'text-2xl font-black font-mono tracking-tight',
            colorStyles.valueColor
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-ink-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 mt-1">
        {subtitle && (
          <p className="text-[11px] text-ink-500 font-medium truncate">
            {subtitle}
          </p>
        )}
        {badge && (
          <span
            className={cn(
              'text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0',
              badgeStyles
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
    </motion.div>
  );
}

