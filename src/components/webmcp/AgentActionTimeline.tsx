import * as React from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Bot,
  Zap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AgentActivity } from "@/types/webmcp";
import { agentActivityManager } from "@/webmcp/agent-activity-store";

export function AgentActionTimeline() {
  const [filter, setFilter] = React.useState<"all" | "reads" | "changes" | "errors">("all");
  const [activities, setActivities] = React.useState<AgentActivity[]>(() =>
    agentActivityManager.getActivities("all")
  );
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    return agentActivityManager.subscribe(() => {
      setActivities(agentActivityManager.getActivities(filter));
    });
  }, [filter]);

  const handleFilterChange = (newFilter: "all" | "reads" | "changes" | "errors") => {
    setFilter(newFilter);
    setActivities(agentActivityManager.getActivities(newFilter));
  };

  const handleClear = () => {
    agentActivityManager.clearActivities();
  };

  const handleExportJson = () => {
    const allActivities = agentActivityManager.getActivities("all");
    const exportPayload = {
      app: "SIDEQUEST",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      eventCount: allActivities.length,
      activities: allActivities,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `webmcp-timeline-export-${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <section
      id="agent-action-timeline-panel"
      aria-labelledby="agent-timeline-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 id="agent-timeline-heading" className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              Agent Action Timeline
              {activities.length > 0 && (
                <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                  {activities.length} {activities.length === 1 ? "event" : "events"}
                </span>
              )}
            </h3>
            <p className="text-xs text-muted-foreground">
              Live observability of real WebMCP agent executions and state mutations.
            </p>
          </div>
        </div>

        {/* Filter Pills & Clear */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-secondary/50 p-0.5 rounded-lg border border-border/60 text-xs font-mono">
            <button
              id="timeline-filter-all"
              type="button"
              onClick={() => handleFilterChange("all")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              id="timeline-filter-reads"
              type="button"
              onClick={() => handleFilterChange("reads")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "reads"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reads
            </button>
            <button
              id="timeline-filter-changes"
              type="button"
              onClick={() => handleFilterChange("changes")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "changes"
                  ? "bg-background text-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Changes
            </button>
            <button
              id="timeline-filter-errors"
              type="button"
              onClick={() => handleFilterChange("errors")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filter === "errors"
                  ? "bg-background text-rose-500 font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Errors
            </button>
          </div>

          <div className="flex items-center gap-1">
            {activities.length > 0 && (
              <>
                <Button
                  id="export-timeline-btn"
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportJson}
                  className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Download timeline log as JSON"
                >
                  <Download className="w-3.5 h-3.5 mr-1 text-sky-500" />
                  Export JSON
                </Button>

                <Button
                  id="clear-timeline-btn"
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-rose-400 cursor-pointer"
                  title="Clear timeline view (does not undo state)"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Stream */}
      {activities.length === 0 ? (
        <div
          id="timeline-empty-state"
          className="p-8 rounded-xl border border-dashed border-border/80 bg-secondary/10 text-center space-y-2"
        >
          <Bot className="w-8 h-8 mx-auto text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">
            No agent activities recorded yet
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Execute a prompt in ChatGPT, use a WebMCP client, or run a test from the Tool Explorer to see real-time tool observability.
          </p>
        </div>
      ) : (
        <div id="timeline-events-list" className="space-y-2.5">
          {activities.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSuccess = item.status === "success";
            const isMutation = item.actionType === "mutation";

            return (
              <article
                key={item.id}
                id={`timeline-event-${item.id}`}
                aria-label={`Event: ${item.toolName}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  isSuccess
                    ? isMutation
                      ? "bg-card hover:bg-secondary/20 border-sky-500/30"
                      : "bg-card hover:bg-secondary/20 border-border/70"
                    : "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/30"
                }`}
              >
                {/* Main Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status icon */}
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}

                    {/* Tool Name */}
                    <span className="text-xs font-mono font-bold text-foreground">
                      {item.toolName}
                    </span>

                    {/* Category */}
                    {item.category && (
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border/60">
                        {item.category}
                      </span>
                    )}

                    {/* Action Type */}
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                        isMutation
                          ? "bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/30"
                          : "bg-secondary/80 text-muted-foreground border border-border/40"
                      }`}
                    >
                      {item.actionType || (isMutation ? "MUTATION" : "READ")}
                    </span>

                    {/* Duration */}
                    {item.durationMs !== undefined && (
                      <span className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {item.durationMs}ms
                      </span>
                    )}
                  </div>

                  {/* Timestamp & Toggle */}
                  <div className="flex items-center gap-2 justify-between sm:justify-end">
                    <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.timestamp)}
                    </span>

                    <button
                      id={`toggle-details-${item.id}`}
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary Headline */}
                <div className="mt-1.5 text-xs text-foreground/90 font-medium">
                  {item.summary}
                </div>

                {/* Before / After State Diff for Mutations */}
                {item.beforeState && item.afterState && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border/50 space-y-1.5 text-xs font-mono">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-sky-400" />
                      State Mutation Diff
                    </div>

                    {item.beforeState.mainQuestTitle !== item.afterState.mainQuestTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                        <span className="text-muted-foreground">Main Quest:</span>
                        <span className="line-through text-muted-foreground/80">
                          {item.beforeState.mainQuestTitle || "(None)"}
                        </span>
                        <ArrowRight className="w-3 h-3 text-sky-400" />
                        <span className="text-sky-500 dark:text-sky-300 font-semibold">
                          {item.afterState.mainQuestTitle || "(None)"}
                        </span>
                      </div>
                    )}

                    {item.beforeState.nextAction !== item.afterState.nextAction && (
                      <div className="flex items-center gap-1.5 text-[11px] flex-wrap">
                        <span className="text-muted-foreground">Next Action:</span>
                        <span className="line-through text-muted-foreground/80">
                          {item.beforeState.nextAction || "(None)"}
                        </span>
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-500 dark:text-emerald-300 font-semibold">
                          {item.afterState.nextAction || "(None)"}
                        </span>
                      </div>
                    )}

                    {item.beforeState.progress !== item.afterState.progress && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="line-through text-muted-foreground/80">
                          {item.beforeState.progress}%
                        </span>
                        <ArrowRight className="w-3 h-3 text-sky-400" />
                        <span className="text-sky-500 dark:text-sky-300 font-semibold">
                          {item.afterState.progress}%
                        </span>
                      </div>
                    )}

                    {item.beforeState.parkedSideQuestCount !== item.afterState.parkedSideQuestCount && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted-foreground">Parked Ideas:</span>
                        <span className="line-through text-muted-foreground/80">
                          {item.beforeState.parkedSideQuestCount}
                        </span>
                        <ArrowRight className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-500 dark:text-amber-300 font-semibold">
                          {item.afterState.parkedSideQuestCount}
                        </span>
                      </div>
                    )}

                    {item.beforeState.focusStatus !== item.afterState.focusStatus && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="text-muted-foreground">Focus Timer:</span>
                        <span className="line-through text-muted-foreground/80">
                          {item.beforeState.focusStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        <span className="text-indigo-500 dark:text-indigo-300 font-semibold">
                          {item.afterState.focusStatus}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Expandable JSON Inputs & Outputs */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-border/50 space-y-2 text-xs font-mono">
                    {item.input && Object.keys(item.input).length > 0 && (
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">
                          Inputs
                        </div>
                        <pre className="p-2 rounded-lg bg-background border border-border/40 text-[11px] overflow-x-auto text-sky-500 dark:text-sky-300">
                          {JSON.stringify(item.input, null, 2)}
                        </pre>
                      </div>
                    )}

                    {item.output && (
                      <div>
                        <div className="text-[10px] uppercase text-muted-foreground font-semibold mb-1">
                          Output / Result
                        </div>
                        <pre className="p-2 rounded-lg bg-background border border-border/40 text-[11px] overflow-x-auto text-emerald-500 dark:text-emerald-300">
                          {JSON.stringify(item.output, null, 2)}
                        </pre>
                      </div>
                    )}

                    {item.error && (
                      <div>
                        <div className="text-[10px] uppercase text-rose-400 font-semibold mb-1">
                          Error Details
                        </div>
                        <pre className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] overflow-x-auto text-rose-300">
                          {JSON.stringify(item.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
