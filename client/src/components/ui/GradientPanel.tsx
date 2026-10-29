import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface GradientPanelProps extends HTMLMotionProps<'div'> {
  gradient?:
    | 'lilac-peach-mint'
    | 'lavender-peach'
    | 'lavender-mint'
    | 'peach-mint'
    | 'mesh'
    | 'glass-card';
  rounded?: 'xl' | '2xl' | '3xl' | '4xl' | 'full';
  glow?: boolean;
  children?: React.ReactNode;
}

export function GradientPanel({
  className,
  gradient = 'lilac-peach-mint',
  rounded = '3xl',
  glow = true,
  children,
  ...props
}: GradientPanelProps) {
  const roundedClasses = {
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    '4xl': 'rounded-4xl',
    full: 'rounded-full',
  }[rounded];

  const gradientClasses = {
    'lilac-peach-mint':
      'bg-gradient-to-br from-[#F5EEFF]/85 via-[#FFF4ED]/80 to-[#EDFAF3]/85',
    'lavender-peach':
      'bg-gradient-to-br from-[#E9DEFF]/80 via-[#FFF0E8]/80 to-[#FFE5D9]/80',
    'lavender-mint':
      'bg-gradient-to-br from-[#E9DEFF]/80 via-[#F3EEFF]/80 to-[#D9F2E6]/80',
    'peach-mint':
      'bg-gradient-to-br from-[#FFE5D9]/80 via-[#FFF8F3]/80 to-[#D9F2E6]/80',
    mesh: 'bg-pastel-mesh bg-white/70',
    'glass-card': 'bg-white/80',
  }[gradient];

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden backdrop-blur-xl border border-white/70 shadow-glass text-ink-900',
        roundedClasses,
        gradientClasses,
        glow && 'ring-1 ring-white/60',
        className
      )}
      {...props}
    >
      {/* Soft floating gradient orbs for ambient glow */}
      {glow && (
        <>
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-[#E9DEFF]/40 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-[#D9F2E6]/40 blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#FFE5D9]/25 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

