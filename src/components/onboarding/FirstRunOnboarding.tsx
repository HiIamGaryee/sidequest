import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePersistence } from "@/stores/PersistenceContext";
import { Target, Compass, Bot, ArrowRight, Sparkles, FolderPlus } from "lucide-react";

interface FirstRunOnboardingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FirstRunOnboarding({ open, onOpenChange }: FirstRunOnboardingProps) {
  const [step, setStep] = React.useState<number>(1);
  const { completeOnboarding, loadDemoWorkspace } = usePersistence();

  const handleFinishEmpty = () => {
    completeOnboarding();
    onOpenChange(false);
  };

  const handleFinishDemo = () => {
    loadDemoWorkspace();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden shadow-2xl">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
              // ONBOARDING
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
            <span className={step === 1 ? "text-emerald-400 font-bold" : "text-zinc-600"}>01</span>
            <span>/</span>
            <span className={step === 2 ? "text-emerald-400 font-bold" : "text-zinc-600"}>02</span>
            <span>/</span>
            <span className={step === 3 ? "text-emerald-400 font-bold" : "text-zinc-600"}>03</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">
                  Stay on the Main Quest
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  ADHD builders get derailed by secondary ideas. SIDEQUEST enforces a strict rule:{" "}
                  <strong className="text-zinc-200">only one active Main Quest</strong> at any time.
                  Everything else gets parked safely in the Side Quest lot.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">
                  Recover Context Fast
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  When you get stuck, use <strong>Unstuck Mode</strong> to make steps smaller. When
                  interrupted, <strong>Context Keeper</strong> captures your exact place so you can
                  resume in seconds without cognitive fatigue.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold tracking-tight text-zinc-100">
                  Agent-Native WebMCP
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  SIDEQUEST registers 21 native WebMCP tools directly into{" "}
                  <code className="text-xs font-mono bg-zinc-900 px-1 py-0.5 rounded text-cyan-300">
                    document.modelContext
                  </code>
                  . AI agents can inspect your progress, set your Main Quest, park distractions, and log
                  focus sessions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-900 flex items-center justify-between">
          {step < 3 ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFinishEmpty}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Skip Tour
              </Button>
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <div className="w-full flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleFinishEmpty}
                className="w-full text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                Empty Workspace
              </Button>
              <Button
                size="sm"
                onClick={handleFinishDemo}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Demo Workspace
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
