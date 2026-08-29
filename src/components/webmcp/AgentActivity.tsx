import * as React from "react";
import { Bot, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import { useWebMcp } from "@/hooks/useWebMcp";
import { Button } from "@/components/ui/button";

interface AgentActivityProps {
  maxItems?: number;
  showClear?: boolean;
  className?: string;
}

export function AgentActivity({ maxItems = 5, showClear = false, className = "" }: AgentActivityProps) {
  const { agentActivities, clearActivities } = useWebMcp();
  const displayedActivities = agentActivities.slice(0, maxItems);

  if (displayedActivities.length === 0) {
    return (
      <div className={`p-4 rounded-lg border border-[#27272a] bg-[#09090b] text-center space-y-1.5 ${className}`}>
        <div className="flex justify-center text-[#71717a]">
          <Bot className="w-5 h-5 opacity-40" />
        </div>
        <p className="text-xs text-[#a1a1aa] font-medium">No agent activity yet</p>
        <p className="text-[10px] text-[#71717a]">
          When a WebMCP agent invokes tools, actions will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#a1a1aa]">
          <Bot className="w-3.5 h-3.5 text-sky-400" />
          <span>AGENT ACTIVITY ({displayedActivities.length})</span>
        </div>
        {showClear && displayedActivities.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearActivities}
            className="h-6 px-2 text-[10px] font-mono text-[#71717a] hover:text-[#fafafa]"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        {displayedActivities.map((act) => {
          const isSuccess = act.status === "success";
          const formattedTime = new Date(act.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={act.id}
              className="p-2.5 rounded-lg border border-[#27272a] bg-[#09090b] flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2 min-w-0">
                {isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-[#fafafa]">
                      {act.toolName}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        isSuccess
                          ? "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#a1a1aa] line-clamp-2">
                    {act.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-mono text-[#71717a] shrink-0">
                <Clock className="w-2.5 h-2.5" />
                <span>{formattedTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
