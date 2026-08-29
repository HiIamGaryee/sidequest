import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFocusContext } from "@/stores/FocusContext";
import { Play, Square, TimerReset } from "lucide-react";

export function ActiveSessionRecoveryModal() {
  const { activeSessionRecoveryInfo, resolveActiveSessionRecovery } = useFocusContext();

  if (!activeSessionRecoveryInfo) return null;

  return (
    <Dialog open={true} onOpenChange={() => resolveActiveSessionRecovery("end")}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-amber-500/30 text-zinc-100 p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs tracking-wider uppercase font-bold">
            <TimerReset className="w-4 h-4 animate-spin-slow" />
            // WELCOME BACK
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-zinc-100">
            A Focus Session was still active
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            We restored your session state from before the reload.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Quest</div>
          <div className="font-semibold text-zinc-200 text-sm">
            {activeSessionRecoveryInfo.questTitle}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
            <span className="text-zinc-500">Planned Duration:</span>
            <span className="font-mono text-zinc-300">
              {activeSessionRecoveryInfo.session.plannedMinutes} min
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Elapsed Time:</span>
            <span className="font-mono text-amber-400 font-bold">
              {activeSessionRecoveryInfo.elapsedMinutes} min
            </span>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => resolveActiveSessionRecovery("end")}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5"
          >
            <Square className="w-4 h-4 text-zinc-400" />
            End & Save Session
          </Button>
          <Button
            size="sm"
            onClick={() => resolveActiveSessionRecovery("resume")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-1.5"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume Focus
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
