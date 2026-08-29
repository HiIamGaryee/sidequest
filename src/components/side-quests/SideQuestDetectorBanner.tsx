import * as React from "react";
import { Sparkles, Inbox, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideQuestDetectorBannerProps {
  detectedIdea?: string;
  onPark: (title: string) => void;
  onDismiss: () => void;
}

export function SideQuestDetectorBanner({
  detectedIdea = "Detected tangent: Investigate WebSocket reconnection latency",
  onPark,
  onDismiss,
}: SideQuestDetectorBannerProps) {
  return (
    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-amber-200 font-medium truncate">{detectedIdea}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          onClick={() => onPark(detectedIdea)}
          className="h-6 px-2 text-[10px] font-mono font-bold bg-amber-400 text-black hover:bg-amber-300 shadow-2xs"
        >
          <Inbox className="w-3 h-3 mr-1" />
          Park It
        </Button>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[10px] font-mono text-amber-300/70 hover:text-amber-200 px-1 py-0.5"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}
