import * as React from "react";
import { useToast } from "@/hooks/useToast";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((t) => {
        const isDestructive = t.variant === "destructive";
        const isSuccess = t.variant === "success" || t.variant === "emerald";

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              isDestructive
                ? "bg-red-950/90 border-red-500/40 text-red-100"
                : isSuccess
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-100"
                : "bg-zinc-900/90 border-zinc-700/60 text-zinc-100"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isDestructive ? (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 text-cyan-400" />
              )}
            </div>

            <div className="flex-1 space-y-0.5">
              {t.title && (
                <div className="font-mono text-xs font-bold tracking-tight">
                  {t.title}
                </div>
              )}
              {t.description && (
                <div className="text-xs opacity-90 leading-relaxed font-sans">
                  {t.description}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
