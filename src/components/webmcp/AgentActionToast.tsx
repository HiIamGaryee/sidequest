import * as React from "react";
import { Bot, CheckCircle2, AlertCircle, X, Sparkles } from "lucide-react";
import type { AgentActionNotification } from "@/types/webmcp";
import { agentActivityManager } from "@/webmcp/agent-activity-store";

export function AgentActionToast() {
  const [notification, setNotification] = React.useState<AgentActionNotification | null>(null);

  React.useEffect(() => {
    return agentActivityManager.subscribeNotification((notif) => {
      setNotification(notif);
    });
  }, []);

  if (!notification) return null;

  const isSuccess = notification.status === "success";

  return (
    <aside
      id="agent-action-toast"
      aria-label="Agent action status toast"
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div
        className={`p-3.5 rounded-xl border backdrop-blur-md shadow-xl flex items-start gap-3 transition-colors ${
          isSuccess
            ? "bg-card/95 border-sky-500/40 text-foreground"
            : "bg-card/95 border-rose-500/40 text-foreground"
        }`}
      >
        <div
          className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
            isSuccess ? "bg-sky-500/10 text-sky-500 dark:text-sky-400" : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
          }`}
        >
          {notification.actionType === "mutation" ? (
            <Sparkles className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isSuccess ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
            )}
            <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
              {notification.title}
            </span>
            {notification.category && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-secondary/80 text-foreground/80 border border-border/40">
                {notification.category}
              </span>
            )}
            {notification.durationMs !== undefined && (
              <span className="text-[9px] font-mono text-muted-foreground ml-auto">
                {notification.durationMs}ms
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
            {notification.summary}
          </p>

          <div className="text-[10px] font-mono text-muted-foreground/80">
            tool: <span className="text-sky-500 dark:text-sky-400 font-semibold">{notification.toolName}</span>
          </div>
        </div>

        <button
          id="dismiss-agent-toast-btn"
          type="button"
          onClick={() => agentActivityManager.dismissNotification()}
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss agent notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
