import { Sparkles, RotateCcw, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePersistence } from "@/stores/PersistenceContext";

interface JudgeBannerProps {
  onResetDemo?: () => void;
  onExitDemo?: () => void;
}

export function JudgeBanner({ onResetDemo, onExitDemo }: JudgeBannerProps) {
  const { isJudgeMode, resetJudgeDemo, exitJudgeMode } = usePersistence();

  if (!isJudgeMode) return null;

  const handleReset = () => {
    if (onResetDemo) {
      onResetDemo();
    } else {
      resetJudgeDemo();
    }
  };

  const handleExit = () => {
    if (onExitDemo) {
      onExitDemo();
    } else {
      exitJudgeMode();
    }
  };

  return (
    <header
      id="judge-mode-banner"
      aria-label="Judge Demo workspace active banner"
      className="sticky top-0 z-40 w-full border-b border-sky-500/30 bg-sky-950/90 text-sky-100 px-4 py-2.5 backdrop-blur-md transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Badge & Notice */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-mono font-semibold uppercase tracking-wider shrink-0">
            <Sparkles className="w-3 h-3 text-sky-400" />
            JUDGE DEMO
          </span>
          <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
            Prepared workspace is active. Your normal data is safe in isolation.
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            id="judge-reset-demo-btn"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2.5 text-xs font-mono bg-sky-900/60 hover:bg-sky-800/80 text-sky-100 border-sky-500/40 hover:border-sky-400 cursor-pointer"
            title="Reload initial deterministic demo workspace"
          >
            <RotateCcw className="w-3 h-3 mr-1.5" />
            Reset Demo
          </Button>

          <Button
            id="judge-exit-demo-btn"
            variant="ghost"
            size="sm"
            onClick={handleExit}
            className="h-7 px-2.5 text-xs font-mono text-sky-200/80 hover:text-white hover:bg-sky-800/50 cursor-pointer"
            title="Exit Judge Mode and return to your workspace"
          >
            <LogOut className="w-3 h-3 mr-1.5" />
            Exit
          </Button>
        </div>
      </div>
    </header>
  );
}
