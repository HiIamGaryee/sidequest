import * as React from "react";
import { Bot, CheckCircle2, AlertTriangle, Cpu, Terminal, ExternalLink } from "lucide-react";
import { useWebMcp } from "@/hooks/useWebMcp";
import { AgentActivity } from "./AgentActivity";
import { Badge } from "@/components/ui/badge";

export function WebMcpStatusCard() {
  const { isSupported, registeredCount, lastActivity } = useWebMcp();

  return (
    <div className="space-y-4">
      {/* Top Status Banner */}
      <div className="p-4 rounded-lg border border-[#27272a] bg-[#09090b] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${
                isSupported
                  ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <Bot className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[#fafafa]">
                  WebMCP Agent Tools
                </h4>
                <Badge
                  variant={isSupported ? "default" : "secondary"}
                  className={`text-[10px] font-mono uppercase ${
                    isSupported
                      ? "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30"
                      : "bg-[#27272a] text-[#a1a1aa]"
                  }`}
                >
                  {isSupported ? "Connected" : "Fallback Mode"}
                </Badge>
              </div>
              <p className="text-xs text-[#71717a]">
                Standard imperative browser tool integration via{" "}
                <code className="text-[11px] font-mono text-[#a1a1aa] bg-[#18181b] px-1 py-0.5 rounded">
                  document.modelContext
                </code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-[#18181b] border border-[#27272a] text-[#fafafa]">
              <span className="text-sky-400 font-bold">{registeredCount}</span> tools registered
            </span>
          </div>
        </div>

        {/* Informational callout if not supported */}
        {!isSupported && (
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-[11px] leading-relaxed">
              <p className="font-semibold text-amber-200">
                WebMCP runtime is not active in this browser.
              </p>
              <p className="text-amber-300/90">
                SIDEQUEST itself continues working normally. To test external WebMCP agent interactions, open in an agent browser (like ChatGPT with WebMCP enabled) or Chrome with the WebMCP testing flag.
              </p>
            </div>
          </div>
        )}

        {/* Technical Architecture Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono">
          <div className="p-2 rounded bg-[#18181b] border border-[#27272a]/60 space-y-0.5">
            <span className="text-[#71717a] text-[10px]">API PROTOCOL</span>
            <p className="text-[#fafafa] font-medium">document.modelContext</p>
          </div>
          <div className="p-2 rounded bg-[#18181b] border border-[#27272a]/60 space-y-0.5">
            <span className="text-[#71717a] text-[10px]">STATE SYNC</span>
            <p className="text-[#22c55e] font-medium">Direct Store Bridge (1-Way)</p>
          </div>
          <div className="p-2 rounded bg-[#18181b] border border-[#27272a]/60 space-y-0.5">
            <span className="text-[#71717a] text-[10px]">LAST AGENT ACTION</span>
            <p className="text-sky-400 font-medium truncate">
              {lastActivity ? lastActivity.toolName : "None yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Live Agent Activity Log */}
      <AgentActivity maxItems={5} showClear={true} />
    </div>
  );
}
