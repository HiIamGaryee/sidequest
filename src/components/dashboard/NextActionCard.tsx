import * as React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ListTodo,
  ShieldCheck,
  Clock,
  Play,
  LifeBuoy,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UnstuckDialog } from "@/components/quests/UnstuckDialog";
import { achievementImages } from "@/config/achievementBadges";
import { useQuests } from "@/hooks/useQuests";
import { cn } from "@/lib/utils";

export interface NextActionCardProps {
  className?: string;
}

export function NextActionCard({ className }: NextActionCardProps) {
  const {
    getMainQuest,
    getQuestSteps,
    getQuestNextAction,
    createQuestStep,
    makeStepSmaller,
    skipQuestStep,
    setQuestBlocker,
  } = useQuests();

  const [showUnstuckDialog, setShowUnstuckDialog] = React.useState(false);

  const currentMainQuest = getMainQuest();
  const nextAction = currentMainQuest ? getQuestNextAction(currentMainQuest) : undefined;
  const steps = currentMainQuest ? getQuestSteps(currentMainQuest.id) : [];
  const incompleteSteps = steps.filter((s) => s.status !== "completed");
  const firstIncompleteStep = incompleteSteps.length > 0 ? incompleteSteps[0] : null;

  const currentStepIndex = firstIncompleteStep
    ? steps.findIndex((s) => s.id === firstIncompleteStep.id) + 1
    : null;

  const hasNextAction = Boolean(currentMainQuest && nextAction);

  const handleMakeSmaller = (tinyTitle: string) => {
    if (!currentMainQuest) return;
    if (firstIncompleteStep) {
      makeStepSmaller(currentMainQuest.id, firstIncompleteStep.id, tinyTitle);
    } else {
      createQuestStep({
        questId: currentMainQuest.id,
        title: tinyTitle,
        isTiny: true,
      });
    }
  };

  const handleSkipStep = () => {
    if (!currentMainQuest || !firstIncompleteStep) return;
    skipQuestStep(currentMainQuest.id, firstIncompleteStep.id);
  };

  const handleParkBlocker = (blockerText: string) => {
    if (!currentMainQuest) return;
    setQuestBlocker(currentMainQuest.id, blockerText);
  };

  return (
    <>
      <Card
        className={cn(
          "border-[#27272a] bg-[#18181b] rounded-xl select-none transition-all duration-200 hover:border-[#3f3f46] flex flex-col justify-between",
          hasNextAction && "border-white/30",
          className
        )}
      >
        <CardContent className="p-5 sm:p-6 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#09090b] border border-sky-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={achievementImages.nextActionEmblem}
                    alt="Next Action"
                    className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
                  NEXT ACTION
                </h4>
              </div>
              <span className="text-[9px] font-mono text-[#71717a] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
                {currentStepIndex && steps.length > 0
                  ? `STEP ${currentStepIndex} OF ${steps.length}`
                  : hasNextAction
                  ? "READY TO EXECUTE"
                  : "QUEUE EMPTY"}
              </span>
            </div>

            {/* Body */}
            {hasNextAction && currentMainQuest ? (
              <div className="space-y-2.5">
                <div className="p-4 bg-[#09090b] border border-white/20 rounded-lg space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-sky-500/40 p-1 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={achievementImages.nextActionEmblem}
                        alt="Action Target"
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-[#fafafa] leading-snug">
                          {nextAction}
                        </p>
                        {firstIncompleteStep?.isTiny && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] font-semibold">
                            <Zap className="w-2.5 h-2.5" />
                            TINY STEP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#a1a1aa] truncate">
                        <span className="text-[#71717a]">Main Quest: </span>
                        {currentMainQuest.title}
                      </p>
                    </div>
                  </div>

                  {currentMainQuest.estimatedMinutes && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717a] pt-1 border-t border-[#27272a]">
                      <Clock className="w-3.5 h-3.5 text-[#a1a1aa]" />
                      <span>Estimated time: {currentMainQuest.estimatedMinutes} min</span>
                    </div>
                  )}
                </div>

                {/* Blocker note alert if present */}
                {currentMainQuest.blocker && (
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] truncate">
                        <span className="text-amber-400 font-mono font-bold">Blocked: </span>
                        {currentMainQuest.blocker}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUnstuckDialog(true)}
                      className="text-[10px] font-mono text-amber-300 hover:text-amber-100 underline cursor-pointer shrink-0"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-lg space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full border border-dashed border-[#71717a] flex items-center justify-center mt-0.5 shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-[#71717a]/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-[#fafafa]">
                      Nothing queued yet.
                    </p>
                    <p className="text-xs text-[#71717a] leading-relaxed">
                      Once a Main Quest is active, your next smallest action will appear here to prevent task paralysis.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-[#27272a] flex items-center justify-between gap-2">
            {hasNextAction && currentMainQuest ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowUnstuckDialog(true)}
                className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 px-2 h-8 font-medium cursor-pointer"
              >
                <LifeBuoy className="w-3.5 h-3.5 mr-1 text-amber-400" />
                I'm Stuck
              </Button>
            ) : (
              <span className="text-[11px] text-[#71717a] font-mono">
                Queue: 0 actions
              </span>
            )}

            {hasNextAction ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="text-xs font-bold bg-white text-black hover:bg-[#e4e4e7] cursor-pointer h-8"
              >
                <Link to="/focus">
                  <Play className="mr-1 h-3 w-3 fill-black" />
                  Start
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-xs border-[#27272a] hover:bg-[#27272a] text-[#fafafa] font-medium h-8"
              >
                <Link to="/projects">
                  Open Projects
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#a1a1aa]" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unstuck Dialog */}
      {currentMainQuest && (
        <UnstuckDialog
          open={showUnstuckDialog}
          onOpenChange={setShowUnstuckDialog}
          quest={currentMainQuest}
          currentActionTitle={nextAction}
          firstIncompleteStep={firstIncompleteStep}
          onMakeSmaller={handleMakeSmaller}
          onAddTinyStep={(title) =>
            createQuestStep({
              questId: currentMainQuest.id,
              title,
              isTiny: true,
            })
          }
          onSkipStep={handleSkipStep}
          onParkBlocker={handleParkBlocker}
        />
      )}
    </>
  );
}
