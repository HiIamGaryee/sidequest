import * as React from "react";

export type HighlightTarget = "main-quest" | "parking-lot" | "focus-timer" | "recovery-center";

type HighlightListener = (target: HighlightTarget, summary: string) => void;

class AgentHighlightStore {
  private listeners: Set<HighlightListener> = new Set();

  public triggerHighlight(target: HighlightTarget, summary: string) {
    this.listeners.forEach((listener) => listener(target, summary));
  }

  public subscribe(listener: HighlightListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const agentHighlightStore = new AgentHighlightStore();

/**
 * Custom hook to detect when an agent action updates a specific UI module.
 * Provides a 3-second highlight pulse and summary label.
 */
export function useAgentHighlight(target: HighlightTarget) {
  const [isHighlighted, setIsHighlighted] = React.useState(false);
  const [lastActionSummary, setLastActionSummary] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return agentHighlightStore.subscribe((actionTarget, summary) => {
      if (actionTarget === target) {
        setIsHighlighted(true);
        setLastActionSummary(summary);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          setIsHighlighted(false);
          timeoutRef.current = null;
        }, 3200);
      }
    });
  }, [target]);

  return { isHighlighted, lastActionSummary };
}
