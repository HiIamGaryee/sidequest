import { Users, Lock, Sparkles, CheckCircle2, ShieldAlert, HeartHandshake } from "lucide-react";

export function WebMcpCollaborationCard() {
  return (
    <section
      id="webmcp-collaboration-card"
      aria-labelledby="collab-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
          <HeartHandshake className="w-4 h-4" />
        </div>
        <div>
          <h3 id="collab-heading" className="text-sm font-semibold text-foreground tracking-tight">
            Human + Agent Collaboration Boundaries
          </h3>
          <p className="text-xs text-muted-foreground">
            Clear role separation for distraction-prone builders: AI executes assistive micro-actions; humans maintain strategic agency.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Human Role */}
        <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/60 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-foreground">
            <Users className="w-4 h-4 text-emerald-500" />
            HUMAN ROLE (High-Level Intent)
          </div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Decides overarching project vision and priorities.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Works during focus sessions without micro-management.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Retains exclusive control over destructive data exports & clears.</span>
            </li>
          </ul>
        </div>

        {/* Agent Role */}
        <div className="p-3.5 rounded-xl bg-secondary/20 border border-border/60 space-y-2">
          <div className="flex items-center gap-2 font-mono font-bold text-foreground">
            <Sparkles className="w-4 h-4 text-sky-500 dark:text-sky-400" />
            AGENT ROLE (Cognitive Load Reducer)
          </div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              <span>Breaks intimidating tasks into 2-minute frictionless micro-steps.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              <span>Parks incoming tangent ideas immediately into the Parking Lot.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
              <span>Restores interrupted working context to eliminate restart inertia.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety & Human-Only Guardrails */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-mono font-bold text-amber-600 dark:text-amber-400">
          <Lock className="w-3.5 h-3.5" />
          PROTECTED HUMAN-ONLY ACTIONS (Not Exposed to WebMCP)
        </div>
        <p className="text-muted-foreground text-[11px] leading-relaxed">
          To protect user data integrity, dangerous actions such as <code className="text-foreground font-semibold">Clear Local Data</code>, <code className="text-foreground font-semibold">Import Backup File</code>, and <code className="text-foreground font-semibold">Storage Namespace Reset</code> are strictly excluded from the WebMCP tool registry and can only be triggered via manual user UI interaction.
        </p>
      </div>
    </section>
  );
}
