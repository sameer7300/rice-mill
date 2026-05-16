import type { Variants, Transition } from 'framer-motion';

// ─── Transitions ───────────────────────────────────────────────
export const smoothTween: Transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.4,
};

export const springBounce: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springSmooth: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 35,
};

export const fastTween: Transition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.2,
};

// ─── Page Transitions ──────────────────────────────────────────
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTween,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { ...smoothTween, duration: 0.25 },
  },
};

export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: fastTween },
  exit: { opacity: 0, transition: fastTween },
};

export const slideRightVariants: Variants = {
  initial: { x: '100%', opacity: 0 },
  animate: { x: 0, opacity: 1, transition: springSmooth },
  exit: { x: '100%', opacity: 0, transition: smoothTween },
};

export const slideLeftVariants: Variants = {
  initial: { x: '-100%' },
  animate: { x: 0, transition: springSmooth },
  exit: { x: '-100%', transition: smoothTween },
};

export const dropdownVariants: Variants = {
  initial: { opacity: 0, y: -8, scaleY: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: fastTween,
  },
  exit: {
    opacity: 0,
    y: -8,
    scaleY: 0.95,
    transition: { ...fastTween, duration: 0.15 },
  },
};

export const bottomSheetVariants: Variants = {
  initial: { y: '100%' },
  animate: { y: 0, transition: springSmooth },
  exit: { y: '100%', transition: smoothTween },
};

// ─── List / Stagger ────────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

export const staggerFast: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTween,
  },
};

export const staggerItemX: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTween,
  },
};

// ─── Scroll Reveal ─────────────────────────────────────────────
export const scrollReveal: Variants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: smoothTween,
  },
};

export const scrollRevealLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTween,
  },
};

export const scrollRevealRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: smoothTween,
  },
};

export const scrollRevealScale: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: smoothTween,
  },
};

export const viewportOnce = { once: true, margin: '-60px' };

// ─── Interactive Elements ──────────────────────────────────────
export const cardHover = {
  whileHover: {
    y: -6,
    boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
    transition: fastTween,
  },
  whileTap: { scale: 0.98, transition: fastTween },
};

export const buttonTap = {
  whileTap: { scale: 0.96, transition: fastTween },
  whileHover: { scale: 1.02, transition: fastTween },
};

export const buttonPress = {
  whileTap: { scale: 0.94, transition: fastTween },
};

export const iconSpin: Variants = {
  initial: { rotate: 0 },
  animate: { rotate: 360, transition: { duration: 0.5 } },
};

export const shimmerVariants: Variants = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear',
    },
  },
};
