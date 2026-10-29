import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { scaleIn, springBouncy } from '../../lib/motion';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  palette?: 'lavender' | 'peach' | 'mint';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  palette = 'lavender',
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  const paletteStyles = {
    lavender: {
      outerCircle: 'bg-[#F4EEFF] border-purple-200/80 text-purple-900',
      middleCircle: 'bg-[#E9DEFF] text-purple-950',
      tag: 'text-purple-700',
    },
    peach: {
      outerCircle: 'bg-[#FFF3EB] border-orange-200/80 text-amber-900',
      middleCircle: 'bg-[#FFE5D9] text-amber-950',
      tag: 'text-amber-700',
    },
    mint: {
      outerCircle: 'bg-[#EDFAF3] border-emerald-200/80 text-emerald-900',
      middleCircle: 'bg-[#D9F2E6] text-emerald-950',
      tag: 'text-emerald-700',
    },
  }[palette];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-8 rounded-3xl bg-white/60 border border-white/70 shadow-soft backdrop-blur-md',
        className
      )}
    >
      {/* Friendly layered pastel circle container */}
      <motion.div
        animate={
          !prefersReducedMotion
            ? {
                y: [0, -4, 0],
              }
            : undefined
        }
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: 'easeInOut',
        }}
        className={cn(
          'relative w-20 h-20 rounded-full flex items-center justify-center p-2 mb-4 border shadow-soft',
          paletteStyles.outerCircle
        )}
      >
        <div
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center shadow-inner',
            paletteStyles.middleCircle
          )}
        >
          {icon}
        </div>
      </motion.div>

      <h4 className="font-bold text-base text-ink-900 mb-1 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-ink-500 max-w-xs mb-4 leading-relaxed font-medium">
        {description}
      </p>

      {action && <div className="mt-1">{action}</div>}
    </motion.div>
  );
}

