import * as React from "react";
import { Compass } from "lucide-react";

export function AppLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <Compass className="w-7 h-7 animate-spin-slow" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 font-mono">
          <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">
            // HYDRATING WORKSPACE
          </span>
          <span className="text-[11px] text-zinc-500">Restoring local session data...</span>
        </div>
      </div>
    </div>
  );
}
