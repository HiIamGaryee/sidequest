import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { pageVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface AnimatedPageProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className, ...props }: AnimatedPageProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn("w-full flex-1", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

