import * as React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  LifeBuoy,
  Split,
  ListTodo,
  AlertCircle,
  Check,
  Zap,
  BookmarkPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { UnstuckDialog } from "@/components/quests/UnstuckDialog";
import { BreakItDownDialog } from "@/components/quests/BreakItDownDialog";
import { SaveContextDialog } from "@/components/context/SaveContextDialog";
import { achievementImages } from "@/config/achievementBadges";
import { useQuests } from "@/hooks/useQuests";
import { cn } from "@/lib/utils";
import { useAgentHighlight } from "@/webmcp/agent-highlight-store";

export interface MainQuestCardProps {
  className?: string;
}

export function MainQuestCard({ className }: MainQuestCardProps) {
  const { isHighlighted, lastActionSummary } = useAgentHighlight("main-quest");
  const {
    getMainQuest,
    getMainQuestProject,
    getQuestSteps,
    getQuestNextAction,
    getQuestProgress,
    completeQuestStep,
    reopenQuestStep,
    createQuestStep,
    makeStepSmaller,
    skipQuestStep,
    setQuestBlocker,
    updateQuestProgress,
  } = useQuests();

  const [showUnstuckDialog, setShowUnstuckDialog] = React.useState(false);
  const [showBreakdownDialog, setShowBreakdownDialog] = React.useState(false);
  const [showSaveContextDialog, setShowSaveContextDialog] = React.useState(false);

  const currentMainQuest = getMainQuest();
  const currentProject = getMainQuestProject();

  const steps = currentMainQuest ? getQuestSteps(currentMainQuest.id) : [];
  const incompleteSteps = steps.filter((s) => s.status !== "completed");
  const completedSteps = steps.filter((s) => s.status === "completed");
  const progress = currentMainQuest ? getQuestProgress(currentMainQuest) : 0;
  const nextAction = currentMainQuest ? getQuestNextAction(currentMainQuest) : undefined;
  const firstIncompleteStep = incompleteSteps.length > 0 ? incompleteSteps[0] : null;

  const handleQuickAdd = (increment: number) => {
    if (!currentMainQuest) return;
    const nextVal = Math.min(100, Math.max(0, (currentMainQuest.progress || 0) + increment));
    updateQuestProgress(currentMainQuest.id, nextVal);
  };

  const handleAddMultipleSteps = (newSteps: { title: string; isTiny: boolean }[]) => {
    if (!currentMainQuest) return;
    newSteps.forEach((s) => {
      createQuestStep({
        questId: currentMainQuest.id,
        title: s.title,
        isTiny: s.isTiny,
      });
    });
  };

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
        id="main-quest-card"
        className={cn(
          "border-[#27272a] bg-[#18181b] rounded-xl overflow-hidden relative select-none transition-all duration-300 hover:border-[#3f3f46]",
          currentMainQuest && "border-white/40 shadow-sm shadow-white/[0.02]",
          isHighlighted && "ring-2 ring-sky-400 border-sky-400/80 shadow-md shadow-sky-500/20",
          className
        )}
      >
        {/* Agent Update Highlight Ribbon */}
        {isHighlighted && (
          <div className="bg-sky-500/20 border-b border-sky-500/40 px-4 py-1.5 text-xs font-mono text-sky-300 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold">AGENT UPDATED:</span>
            <span className="truncate">{lastActionSummary || "State modified by WebMCP"}</span>
          </div>
        )}

        {/* Subtle background ambient highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full space-y-5">
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#09090b] border border-amber-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={achievementImages.mainQuestEmblem}
                    alt="Main Quest"
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
                  MAIN QUEST
                </span>
              </div>

              {currentMainQuest ? (
                <div className="flex items-center gap-2">
                  {currentMainQuest.blocker && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-semibold">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      BLOCKED
                    </span>
                  )}
                  <StatusBadge status="focus" label="LOCKED FOCUS" size="sm" />
                </div>
              ) : (
                <StatusBadge status="idle" label="NO ACTIVE QUEST" size="sm" />
              )}
            </div>

            {currentMainQuest ? (
              <div className="space-y-4">
                {/* Quest Title & Project origin */}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold tracking-tight text-[#fafafa] leading-snug">
                    {currentMainQuest.title}
                  </h3>
                  {currentProject && (
                    <p className="text-xs text-[#a1a1aa] flex items-center gap-1.5 font-medium">
                      <span className="text-[#71717a]">Project:</span>
                      <span className="text-white/80">{currentProject.name}</span>
                    </p>
                  )}
                </div>

                {/* Blocker alert preview if present */}
                {currentMainQuest.blocker && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">
                        Active Blocker:
                      </span>
                      <p className="text-xs text-amber-100/90 truncate">{currentMainQuest.blocker}</p>
                    </div>
                  </div>
                )}

                {/* Progress Bar & Step counts */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717a]">
                      {steps.length > 0
                        ? `Step Progress (${completedSteps.length}/${steps.length} done)`
                        : "Quest Progress"}
                    </span>
                    <span className="text-[#fafafa] font-bold">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* If 0 steps, show manual progress quick adjusters */}
                  {steps.length === 0 && (
                    <div className="flex items-center justify-between pt-1 text-[10px] font-mono">
                      <div className="flex items-center gap-1">
                        {[0, 25, 50, 75, 100].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => updateQuestProgress(currentMainQuest.id, val)}
                            className={cn(
                              "px-1.5 py-0.5 rounded border transition-all cursor-pointer",
                              progress === val
                                ? "bg-white text-black font-bold border-white"
                                : "bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-white"
                            )}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(10)}
                          className="px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-white cursor-pointer"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(25)}
                          className="px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-white cursor-pointer"
                        >
                          +25%
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Action Box */}
                <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={achievementImages.nextActionEmblem}
                      alt="Action"
                      className="w-4 h-4 object-contain shrink-0 filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[#71717a] text-[11px] shrink-0">
                      {steps.length > 0 ? "Current Step:" : "Next Action:"}
                    </span>
                    <span className="text-[#fafafa] text-xs font-medium truncate">
                      {nextAction || "Define next smallest action"}
                    </span>
                  </div>

                  {currentMainQuest.estimatedMinutes && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#71717a] shrink-0">
                      <Clock className="w-3 h-3" />
                      <span>{currentMainQuest.estimatedMinutes} min</span>
                    </div>
                  )}
                </div>

                {/* Upcoming Steps Preview on HUD (Up to 3 upcoming steps) */}
                {steps.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] uppercase">
                      <span>NEXT MICRO-STEPS</span>
                      <button
                        type="button"
                        onClick={() => setShowUnstuckDialog(true)}
                        className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <LifeBuoy className="w-3 h-3" />
                        I'm Stuck
                      </button>
                    </div>

                    <div className="space-y-1">
                      {incompleteSteps.slice(0, 3).map((step, idx) => (
                        <div
                          key={step.id}
                          className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-[#09090b] border border-[#27272a] text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <button
                              type="button"
                              onClick={() => completeQuestStep(step.id)}
                              className="w-3.5 h-3.5 rounded border border-[#52525b] hover:border-white flex items-center justify-center cursor-pointer shrink-0"
                              title="Mark step completed"
                            />
                            <span className="text-[10px] font-mono text-[#71717a] shrink-0">
                              {idx + 1}.
                            </span>
                            <span className="truncate text-white/90 font-medium">
                              {step.title}
                            </span>
                            {step.isTiny && (
                              <span className="px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[9px] shrink-0">
                                TINY
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {incompleteSteps.length > 3 && (
                        <p className="text-[10px] font-mono text-[#71717a] text-center pt-0.5">
                          + {incompleteSteps.length - 3} more queued steps
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Empty state Title & Description */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold tracking-tight text-[#fafafa]">
                    No active quest
                  </h3>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-md">
                    Choose one objective to protect from side quests. When locked in, your attention is guarded.
                  </p>
                </div>

                {/* Progress Section Placeholder */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717a]">Quest Progress</span>
                    <span className="text-[#fafafa] font-semibold">0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                    <div className="w-0 h-full bg-white rounded-full transition-all duration-300" />
                  </div>
                </div>

                {/* Next Action placeholder */}
                <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#71717a] shrink-0" />
                    <span className="text-[#71717a] text-[11px]">Next action:</span>
                    <span className="text-[#a1a1aa] text-[11px] italic">None queued</span>
                  </div>
                  <span className="text-[9px] font-mono text-[#71717a] uppercase tracking-wider">
                    PROTECTED
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Button Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#27272a]">
            {currentMainQuest ? (
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUnstuckDialog(true)}
                  className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 cursor-pointer h-8 px-2.5"
                >
                  <LifeBuoy className="w-3 h-3 mr-1 text-amber-400" />
                  I'm Stuck
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveContextDialog(true)}
                  className="text-xs border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#a1a1aa] hover:text-white cursor-pointer h-8 px-2.5"
                  title="Bookmark where you are right now"
                >
                  <BookmarkPlus className="w-3 h-3 mr-1 text-[#a1a1aa]" />
                  Save Thread
                </Button>

                {steps.length === 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBreakdownDialog(true)}
                    className="text-xs border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-white cursor-pointer h-8 px-2.5"
                  >
                    <Split className="w-3 h-3 mr-1 text-white/80" />
                    Break Down
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-[#71717a] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-white/60" />
                Single-objective focus mode
              </p>
            )}

            {currentMainQuest ? (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full sm:w-auto font-bold tracking-tight cursor-pointer"
              >
                <Link to={`/projects/${currentMainQuest.projectId}`}>
                  Continue Quest
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full sm:w-auto font-bold tracking-tight cursor-pointer"
              >
                <Link to="/projects">
                  Choose Quest
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {currentMainQuest && (
        <>
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

          <BreakItDownDialog
            open={showBreakdownDialog}
            onOpenChange={setShowBreakdownDialog}
            quest={currentMainQuest}
            onAddSteps={handleAddMultipleSteps}
          />

          <SaveContextDialog
            questId={currentMainQuest.id}
            open={showSaveContextDialog}
            onOpenChange={setShowSaveContextDialog}
          />
        </>
      )}
    </>
  );
}
