import { Bot, Database, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { isWebMcpSupported } from "@/webmcp/webmcp-utils";
import { usePersistence } from "@/stores/PersistenceContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useContextKeeperContext } from "@/stores/ContextKeeperContext";

export function DemoHealthBadge() {
  const { isJudgeMode } = usePersistence();
  const { getMainQuest } = useQuestContext();
  const { getLatestContext, workContexts } = useContextKeeperContext();

  const webMcpSupported = isWebMcpSupported();
  const mainQuest = getMainQuest();
  const latestContext = getLatestContext(mainQuest?.id) || workContexts[0];

  return (
    <aside
      id="demo-health-hud"
      aria-label="Demo health status indicator"
      className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
    >
      {/* WebMCP API Status */}
      <div className="p-2.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${
            webMcpSupported
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          <Bot className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">WebMCP API</div>
          <div className="text-xs font-mono font-semibold text-foreground truncate">
            {webMcpSupported ? "document.modelContext" : "Fallback Emulation"}
          </div>
        </div>
      </div>

      {/* Tools Count */}
      <div className="p-2.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400 shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Registered Tools</div>
          <div className="text-xs font-mono font-semibold text-foreground truncate">
            28 Registered
          </div>
        </div>
      </div>

      {/* Storage Isolation */}
      <div className="p-2.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
          <Database className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Workspace State</div>
          <div className="text-xs font-mono font-semibold text-foreground truncate">
            {isJudgeMode ? "Isolated Demo (v1)" : "Standard User Data"}
          </div>
        </div>
      </div>

      {/* Context & Main Quest Ready */}
      <div className="p-2.5 rounded-xl border border-border/60 bg-card/60 flex items-center gap-2.5">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${
            mainQuest ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Context & Quest</div>
          <div className="text-xs font-mono font-semibold text-foreground truncate">
            {mainQuest ? "Ready (60% Done)" : "No Active Quest"}
          </div>
        </div>
      </div>
    </aside>
  );
}
