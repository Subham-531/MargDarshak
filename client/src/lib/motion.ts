import { Transition, Variants } from 'framer-motion';

/**
 * Standard spring configs for soft, bouncy, tactile feel.
 */
export const springSoft: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
  mass: 0.9,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 18,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 30,
};

/**
 * Fade up transition variant
 */
export const fadeUp: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
};

/**
 * Fade in variant
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Scale and fade in (ideal for modals, dialogs, floating dropdowns)
 */
export const scaleIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.94,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSoft,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/**
 * Stagger container variants
 */
export const stagger: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
};

/**
 * Interactive micro-interactions
 */
export const hoverLift = {
  whileHover: { scale: 1.02, y: -2 },
  whileTap: { scale: 0.96 },
  transition: springSoft,
};

export const hoverGlow = {
  whileHover: { scale: 1.015, y: -1 },
  whileTap: { scale: 0.97 },
  transition: springSoft,
};

/**
 * Helper to produce safe transition respecting reduced motion preference
 */
export function getReducedSafeTransition(shouldReduce: boolean | null, defaultTransition: Transition = springSoft): Transition {
  if (shouldReduce) {
    return { duration: 0.01 };
  }
  return defaultTransition;
}

