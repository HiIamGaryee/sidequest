import * as React from "react";
import { CheckCircle2, Circle, Sparkles, RotateCcw, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DemoScenarioStep } from "@/types/webmcp";
import { demoScenarioTracker } from "@/webmcp/scenario-tracker";
import { usePersistence } from "@/stores/PersistenceContext";

export function DemoScenarioTracker() {
  const [steps, setSteps] = React.useState<DemoScenarioStep[]>(() => demoScenarioTracker.getSteps());
  const [isAllCompleted, setIsAllCompleted] = React.useState<boolean>(() => demoScenarioTracker.isAllCompleted());
  const { resetJudgeDemo } = usePersistence();

  React.useEffect(() => {
    return demoScenarioTracker.subscribe((updatedSteps, allDone) => {
      setSteps(updatedSteps);
      setIsAllCompleted(allDone);
    });
  }, []);

  const completedCount = steps.filter((s) => s.isCompleted).length;
  const totalCount = steps.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <section
      id="demo-scenario-tracker"
      aria-labelledby="scenario-tracker-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 id="scenario-tracker-heading" className="text-sm font-semibold text-foreground tracking-tight">
              WebMCP Scenario Tracker
            </h3>
            <p className="text-xs text-muted-foreground">
              Automated milestone tracking as WebMCP tools execute in real-time.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-foreground">
            {completedCount} / {totalCount}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-1">
            ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary/60 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* All Complete Banner */}
      {isAllCompleted && (
        <div
          id="demo-complete-banner"
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in zoom-in-95 duration-300"
        >
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                DEMO COMPLETE
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                All 7 WebMCP interaction milestones have been successfully executed!
              </p>
            </div>
          </div>

          <Button
            id="demo-complete-reset-btn"
            variant="outline"
            size="sm"
            onClick={resetJudgeDemo}
            className="h-8 px-3 text-xs font-mono bg-background text-foreground border-emerald-500/40 hover:bg-emerald-500/10 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Demo
          </Button>
        </div>
      )}

      {/* Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            id={`scenario-step-${step.id}`}
            className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 ${
              step.isCompleted
                ? "bg-emerald-500/5 border-emerald-500/30 text-foreground"
                : "bg-secondary/20 border-border/50 text-muted-foreground"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {step.isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground/40" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs font-mono font-medium ${step.isCompleted ? "text-foreground font-semibold" : "text-foreground/80"}`}>
                  {idx + 1}. {step.title}
                </span>
              </div>
              <p className="text-[11px] leading-snug text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
