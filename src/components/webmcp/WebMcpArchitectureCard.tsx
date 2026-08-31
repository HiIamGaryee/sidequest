import { ArrowRight, Bot, Cpu, Layers, HardDrive, ShieldCheck } from "lucide-react";
import { useWebMcp } from "@/hooks/useWebMcp";

export function WebMcpArchitectureCard() {
  const { registeredCount } = useWebMcp();

  return (
    <section
      id="webmcp-architecture-card"
      aria-labelledby="architecture-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h3 id="architecture-heading" className="text-sm font-semibold text-foreground tracking-tight">
            WebMCP Architecture Pipeline
          </h3>
          <p className="text-xs text-muted-foreground">
            Structured, schema-governed browser agent integration without brittle DOM scraping.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-center font-mono text-xs">
        {/* Step 1: External Agent */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 text-center space-y-1">
          <div className="flex justify-center text-sky-500 dark:text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div className="font-bold text-foreground">AI Agent</div>
          <div className="text-[10px] text-muted-foreground">ChatGPT / Claude / WebMCP Client</div>
        </div>

        <div className="hidden md:flex justify-center text-muted-foreground/60">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Step 2: Browser API */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 text-center space-y-1">
          <div className="flex justify-center text-emerald-500">
            <Layers className="w-5 h-5" />
          </div>
          <div className="font-bold text-foreground">WebMCP Bridge</div>
          <div className="text-[10px] text-muted-foreground"><code className="text-sky-500 dark:text-sky-400">document.modelContext</code></div>
        </div>

        <div className="hidden md:flex justify-center text-muted-foreground/60">
          <ArrowRight className="w-4 h-4" />
        </div>

        {/* Step 3: SIDEQUEST Workspace State */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-border/60 text-center space-y-1">
          <div className="flex justify-center text-indigo-500">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="font-bold text-foreground">SIDEQUEST Engine</div>
          <div className="text-[10px] text-muted-foreground">{registeredCount} Tools • State Dispatches • LocalStorage</div>
        </div>
      </div>

      {/* Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-xl bg-background/60 border border-border/40 space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Deterministic Schemas
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All {registeredCount} tools define exact JSON input/output schemas, eliminating fuzzy DOM guessing.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-background/60 border border-border/40 space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Runtime Isolation
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Tool closures query dynamic store state safely with full exception containment.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-background/60 border border-border/40 space-y-1">
          <div className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Full Observability
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every read and mutation records execution duration, before/after diffs, and visual HUD alerts.
          </p>
        </div>
      </div>
    </section>
  );
}
