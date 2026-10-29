import React from 'react';
import { motion, useReducedMotion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { stagger, fadeUp, springSoft } from '../../lib/motion';

export interface MotionListProps extends HTMLMotionProps<'ul'> {
  staggerDelay?: number;
  className?: string;
  children: React.ReactNode;
}

export function MotionList({
  staggerDelay = 0.05,
  className,
  children,
  ...props
}: MotionListProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: 0.02,
      },
    },
  };

  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn('list-none p-0 m-0 space-y-2', className)}
      {...props}
    >
      <AnimatePresence mode="popLayout">{children}</AnimatePresence>
    </motion.ul>
  );
}

export interface MotionListItemProps extends HTMLMotionProps<'li'> {
  layoutId?: string;
  className?: string;
  children: React.ReactNode;
}

export function MotionListItem({
  layoutId,
  className,
  children,
  ...props
}: MotionListItemProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.li
      layout={!prefersReducedMotion}
      layoutId={layoutId}
      variants={fadeUp}
      transition={springSoft}
      className={cn('relative', className)}
      {...props}
    >
      {children}
    </motion.li>
  );
}

export interface MotionGridProps extends HTMLMotionProps<'div'> {
  staggerDelay?: number;
  className?: string;
  children: React.ReactNode;
}

export function MotionGrid({
  staggerDelay = 0.06,
  className,
  children,
  ...props
}: MotionGridProps) {
  const prefersReducedMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
        delayChildren: 0.03,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn('grid', className)}
      {...props}
    >
      <AnimatePresence>{children}</AnimatePresence>
    </motion.div>
  );
}

