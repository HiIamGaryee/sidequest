import { Target, Bot, Check, ShieldCheck, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface JudgeIntroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDemo: () => void;
  onExitJudgeMode: () => void;
}

export function JudgeIntroModal({
  open,
  onOpenChange,
  onStartDemo,
  onExitJudgeMode,
}: JudgeIntroModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="judge-intro-modal"
        aria-label="Welcome to WebMCP Challenge Judge Demo"
        className="max-w-md sm:max-w-lg bg-card border-border/80 p-6 sm:p-7 shadow-2xl"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 text-xs font-mono font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              WEBMCP CHALLENGE DEMO
            </span>
          </div>

          <DialogTitle className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground flex items-center gap-2">
            SIDEQUEST
          </DialogTitle>

          <DialogDescription className="text-sm font-medium text-foreground/90 leading-relaxed">
            Agent-native productivity for staying on the main quest.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-3.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground/90">
            This demo shows how a person and a WebMCP agent can manage interrupted work together without losing context or focus.
          </p>

          <div className="space-y-2 bg-secondary/30 rounded-xl p-3.5 border border-border/40 font-mono text-xs">
            <div className="flex items-start gap-2 text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Isolated demo workspace (<code className="text-sky-500 dark:text-sky-400">sidequest:demo:v1</code>)</span>
            </div>
            <div className="flex items-start gap-2 text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>28 registered WebMCP tools via <code className="text-sky-500 dark:text-sky-400">document.modelContext</code></span>
            </div>
            <div className="flex items-start gap-2 text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Deterministic starting project, Main Quest, recovery logs, and level state</span>
            </div>
            <div className="flex items-start gap-2 text-foreground/90">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Live Agent Action Timeline observing every execution in real-time</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
            <span>Exiting Judge Mode restores your normal workspace with 0 data loss.</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 sm:justify-end">
          <Button
            id="judge-modal-exit-btn"
            type="button"
            variant="ghost"
            onClick={onExitJudgeMode}
            className="w-full sm:w-auto text-xs font-mono text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Exit Judge Mode
          </Button>

          <Button
            id="judge-modal-start-btn"
            type="button"
            variant="default"
            onClick={onStartDemo}
            className="w-full sm:w-auto text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer shadow-sm"
          >
            <Bot className="w-4 h-4 mr-1.5" />
            Start Demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
