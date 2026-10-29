import React from 'react';
import { motion, useReducedMotion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { springSoft } from '../../lib/motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'glass' | 'lavender' | 'peach' | 'mint' | 'outline';
  hoverLift?: boolean;
  rounded?: 'xl' | '2xl' | '3xl';
  children?: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hoverLift = false,
      rounded = '2xl',
      children,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const roundedClass = {
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
    }[rounded];

    const variantClasses = {
      default:
        'bg-white/75 backdrop-blur-md border border-white/70 shadow-soft text-ink-900',
      glass:
        'bg-white/85 backdrop-blur-xl border border-white/80 shadow-glass text-ink-900',
      lavender:
        'bg-gradient-to-br from-[#F6F0FF]/95 to-[#E9DEFF]/75 backdrop-blur-md border border-purple-200/60 shadow-soft text-ink-900',
      peach:
        'bg-gradient-to-br from-[#FFF5EF]/95 to-[#FFE5D9]/75 backdrop-blur-md border border-orange-200/60 shadow-soft text-ink-900',
      mint:
        'bg-gradient-to-br from-[#F0FAF4]/95 to-[#D9F2E6]/75 backdrop-blur-md border border-emerald-200/60 shadow-soft text-ink-900',
      outline:
        'bg-transparent border border-white/60 text-ink-900',
    }[variant];

    const motionProps =
      hoverLift && !prefersReducedMotion
        ? {
            whileHover: { scale: 1.015, y: -2 },
            whileTap: { scale: 0.99 },
            transition: springSoft,
          }
        : {};

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden transition-colors',
          roundedClass,
          variantClasses,
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1 p-4 sm:p-5', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-bold text-base md:text-lg text-ink-900 tracking-tight flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-ink-500 font-medium', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 sm:p-5 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-4 sm:p-5 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  );
}

