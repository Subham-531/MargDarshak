import React from 'react';
import { motion, useReducedMotion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { springBouncy } from '../../lib/motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?:
    | 'primary'
    | 'lavender'
    | 'peach'
    | 'mint'
    | 'glass'
    | 'subtle'
    | 'danger'
    | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon-xs' | 'icon-sm' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion();

    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-full select-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0D] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const sizeStyles = {
      xs: 'h-7 px-2.5 text-[11px] gap-1',
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-9 px-4 text-xs gap-2',
      lg: 'h-11 px-6 text-sm gap-2.5',
      'icon-xs': 'w-7 h-7 p-0 flex items-center justify-center',
      'icon-sm': 'w-8 h-8 p-0 flex items-center justify-center',
      icon: 'w-9 h-9 p-0 flex items-center justify-center',
    }[size];

    const variantStyles = {
      primary:
        'bg-[#52783B] hover:bg-[#648B43] text-[#FFFFFF] border border-[#688A45] shadow-soft active:shadow-none',
      lavender:
        'bg-[#2A3423] hover:bg-[#36422C] text-[#FFFFFF] border border-[#445438] shadow-soft dark:bg-[#222222] dark:hover:bg-[#2B2B2B] dark:text-[#DCE5CB] dark:border-[#344126]',
      peach:
        'bg-[#242424] hover:bg-[#2D2D2D] text-ink-800 border border-ink-200 shadow-soft',
      mint:
        'bg-[#20291C] hover:bg-[#293521] text-emerald-800 border border-emerald-300/40 shadow-soft',
      glass:
        'bg-[#262C22] hover:bg-[#323A2D] text-[#FFFFFF] border border-[#3E4738] shadow-pill backdrop-blur-md dark:bg-[#1C1C1C] dark:hover:bg-[#252525] dark:text-ink-800 dark:border-ink-200',
      subtle:
        'bg-white hover:bg-ink-50 text-ink-900 border border-ink-200 shadow-xs dark:bg-[#1C1C1C] dark:hover:bg-[#252525] dark:text-ink-800 dark:border-ink-200/70',
      danger:
        'bg-[#332222] hover:bg-[#402929] text-rose-800 border border-rose-300/40 shadow-soft',
      ghost:
        'bg-transparent hover:bg-ink-100 text-ink-700 active:bg-ink-200',
    }[variant];

    const motionProps =
      !disabled && !isLoading && !prefersReducedMotion
        ? {
            whileHover: { scale: 1.025, y: -1 },
            whileTap: { scale: 0.96 },
            transition: springBouncy,
          }
        : {};

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles, variantStyles, className)}
        {...motionProps}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
