import type { Variants, Transition } from "motion/react";

/**
 * Standard snappy animation timings for HUD & Linear-like interface
 */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

export const defaultTransition: Transition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1], // snappy ease-out
};

export const slowTransition: Transition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Page route transition: subtle fade with slight upward slide (4px)
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/**
 * Generic fade in
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: "easeIn" },
  },
};

/**
 * Fade + slight vertical slide
 */
export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/**
 * Stagger container for list items / cards
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

/**
 * Card enter animation
 */
export const cardEnter: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Micro scale interaction for buttons and interactive items
 */
export const interactiveTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const interactiveHover = {
  scale: 1.01,
  transition: { duration: 0.15 },
};
