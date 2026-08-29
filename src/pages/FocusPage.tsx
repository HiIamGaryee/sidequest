import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Timer,
  Play,
  ArrowRight,
  ShieldAlert,
  Zap,
  Target,
  Sparkles,
  ChevronLeft,
  Inbox,
  BookmarkPlus,
  RotateCcw,
  ShieldCheck,
  Bookmark,
  HeartPulse,
} from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuests } from "@/hooks/useQuests";
import { useFocus } from "@/hooks/useFocus";
import { useSideQuests } from "@/hooks/useSideQuests";
import { useContextKeeper } from "@/hooks/useContextKeeper";
import { useRecovery } from "@/hooks/useRecovery";
import { QuickCaptureSideQuest } from "@/components/side-quests/QuickCaptureSideQuest";
import { SaveContextDialog } from "@/components/context/SaveContextDialog";
import { InterruptionDialog } from "@/components/context/InterruptionDialog";
import { formatContextTimeAgo } from "@/lib/context-utils";
import {
  FocusSetup,
  FocusTimer,
  FocusActionCard,
  FocusSessionSummary,
  FocusStatusBadge,
} from "@/components/focus";

export function FocusPage() {
  const navigate = useNavigate();
  const {
    getMainQuest,
    getMainQuestProject,
    getQuestSteps,
    getQuestNextAction,
    getQuestProgress,
    completeQuestStep,
    createQuestStep,
    makeStepSmaller,
    skipQuestStep,
    setQuestBlocker,
    updateQuestProgress,
  } = useQuests();

  const {
    status,
    plannedMinutes,
    elapsedSeconds,
    isOvertime,
    isTimesUpPromptVisible,
    formattedTimer,
    formattedOvertime,
    lastCompletedSession,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    endFocusSession,
    resetFocusSession,
    continueOvertime,
  } = useFocus();

  const { captureSideQuest, parkedCount } = useSideQuests();
  const { saveWorkContext, getLatestContext } = useContextKeeper();
  const { openRecoveryCenter, isDueAny, preferences: recoveryPreferences } = useRecovery();

  const [showQuickCapture, setShowQuickCapture] = React.useState(false);
  const [showSaveContext, setShowSaveContext] = React.useState(false);
  const [showInterruption, setShowInterruption] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const mainQuest = getMainQuest();
  const mainProject = getMainQuestProject();

  const steps = mainQuest ? getQuestSteps(mainQuest.id) : [];
  const progress = mainQuest ? getQuestProgress(mainQuest) : 0;
  const nextAction = mainQuest ? getQuestNextAction(mainQuest) : undefined;
  const latestContext = mainQuest ? getLatestContext(mainQuest.id) : undefined;

  // Calculate visual Focus Energy
  const totalPlannedSeconds = plannedMinutes * 60;
  const energyPercent =
    status === "running" || status === "paused"
      ? Math.max(10, Math.round(100 - (elapsedSeconds / Math.max(1, totalPlannedSeconds * 1.5)) * 90))
      : 100;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartSession = (durationMinutes: number) => {
    if (!mainQuest) return;
    startFocusSession(mainQuest.id, durationMinutes);
  };

  const handleEndSession = () => {
    // Auto-save snapshot when ending session if quest is not complete
    if (mainQuest && progress < 100) {
      const incomplete = steps.filter((s) => s.status !== "completed");
      saveWorkContext({
        questId: mainQuest.id,
        reason: "session-end",
        currentStepId: incomplete[0]?.id,
        nextAction,
        blocker: mainQuest.blocker,
        progress,
      });
    }
    endFocusSession();
  };

  const handleStartAnother = () => {
    resetFocusSession();
  };

  const handleInterruptionClick = () => {
    pauseFocusSession();
    if (mainQuest) {
      const incomplete = steps.filter((s) => s.status !== "completed");
      saveWorkContext({
        questId: mainQuest.id,
        reason: "interruption",
        currentStepId: incomplete[0]?.id,
        nextAction,
        blocker: mainQuest.blocker,
        progress,
      });
    }
    setShowInterruption(true);
  };

  // Case 1: No Main Quest Active
  if (!mainQuest && status === "idle" && !lastCompletedSession) {
    return (
      <AnimatedPage>
        <PageContainer maxWidth="2xl">
          <PageHeader
            title="Focus"
            description="A distraction-reduced workspace for the task that matters now."
            badge={<StatusBadge status="idle" label="NO OBJECTIVE" />}
          />

          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#3f3f46] flex items-center justify-center">
              <Target className="w-7 h-7 text-[#71717a]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#71717a] uppercase">
                NO MAIN QUEST
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa]">
                Pick one quest before entering Focus Mode.
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1aa] max-w-sm mx-auto leading-relaxed">
                Focus mode guards a single objective from interruptions. Choose a quest to lock in your attention.
              </p>
            </div>

            <Button
              asChild
              variant="default"
              size="lg"
              className="bg-white text-black hover:bg-[#e4e4e7] font-bold text-sm cursor-pointer shadow-sm px-6"
            >
              <Link to="/projects">
                Choose Quest
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </PageContainer>
      </AnimatedPage>
    );
  }

  // Case 2: Session Completed -> Show Summary
  if (lastCompletedSession && (status === "completed" || status === "idle")) {
    return (
      <AnimatedPage>
        <PageContainer maxWidth="2xl">
          <PageHeader
            title="Focus"
            description="Session complete. Review your progress."
            badge={<FocusStatusBadge status="COMPLETE" size="sm" />}
          />

          <FocusSessionSummary
            session={lastCompletedSession}
            nextAction={nextAction}
            onStartAnother={handleStartAnother}
          />
        </PageContainer>
      </AnimatedPage>
    );
  }

  // Case 3: Session Setup (Ready to start)
  if (status === "idle" && mainQuest) {
    return (
      <AnimatedPage>
        <PageContainer maxWidth="2xl">
          <PageHeader
            title="Focus"
            description="Configure sprint duration and prepare your workspace."
            badge={<FocusStatusBadge status="READY" size="sm" />}
          />

          {/* If there is a saved context note, show thread reminder */}
          {latestContext?.note && (
            <div className="mb-4 p-3 rounded-lg bg-[#18181b] border border-white/20 flex items-start gap-2.5 text-xs text-[#fafafa]">
              <Bookmark className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-[#a1a1aa] uppercase">
                  Last Saved Thread ({formatContextTimeAgo(latestContext.savedAt)}):
                </span>
                <p className="italic text-white/90">“{latestContext.note}”</p>
              </div>
            </div>
          )}

          <FocusSetup
            quest={mainQuest}
            project={mainProject}
            nextAction={nextAction}
            onStart={handleStartSession}
          />
        </PageContainer>
      </AnimatedPage>
    );
  }

  // Case 4: Active Sprint (Running or Paused)
  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="Focus Mode"
          description="Single objective locked. Everything else can wait."
          badge={
            <FocusStatusBadge
              status={isOvertime ? "OVERTIME" : status === "paused" ? "PAUSED" : "FOCUSING"}
              size="sm"
            />
          }
        />

        {/* Global Floating Feedback Toast */}
        {toastMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
            <Inbox className="w-3.5 h-3.5" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Distraction & Context Toolbar */}
        <div className="mb-6 p-3 rounded-xl bg-[#18181b] border border-[#27272a] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#71717a] uppercase">
              ATTENTION TOOLS:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Park Side Quest Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQuickCapture(true)}
              className="h-8 px-3 text-xs font-mono border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Park a distracting idea without pausing timer"
            >
              <Inbox className="w-3.5 h-3.5 text-amber-400" />
              <span>Park Side Quest</span>
            </Button>

            {/* Save Context Snapshot */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowSaveContext(true)}
              className="h-8 px-3 text-xs font-mono border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Bookmark current quest state"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-[#a1a1aa]" />
              <span>Save Thread</span>
            </Button>

            {/* Recovery Hub Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openRecoveryCenter}
              className="h-8 px-3 text-xs font-mono border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] flex items-center gap-1.5 cursor-pointer shadow-xs relative"
              title="Open Recovery Center"
            >
              <HeartPulse className="w-3.5 h-3.5 text-white" />
              <span>Recovery</span>
              {recoveryPreferences.enabled && isDueAny && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Button>

            {/* I Got Interrupted Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleInterruptionClick}
              className="h-8 px-3 text-xs font-mono border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Pause timer & save place safely"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>I Got Interrupted</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Quest Action Column */}
          <div className="lg:col-span-7 space-y-6">
            {mainQuest && (
              <FocusActionCard
                quest={mainQuest}
                project={mainProject}
                steps={steps}
                progress={progress}
                nextAction={nextAction}
                onCompleteStep={completeQuestStep}
                onCreateStep={createQuestStep}
                onMakeStepSmaller={makeStepSmaller}
                onSkipStep={skipQuestStep}
                onSetBlocker={setQuestBlocker}
                onUpdateProgress={updateQuestProgress}
              />
            )}
          </div>

          {/* Timer & Side HUD Column */}
          <div className="lg:col-span-5 space-y-6">
            <FocusTimer
              status={status}
              formattedTimer={formattedTimer}
              formattedOvertime={formattedOvertime}
              isOvertime={isOvertime}
              isTimesUpPromptVisible={isTimesUpPromptVisible}
              plannedMinutes={plannedMinutes}
              elapsedSeconds={elapsedSeconds}
              onPause={pauseFocusSession}
              onResume={resumeFocusSession}
              onEndSession={handleEndSession}
              onContinueOvertime={continueOvertime}
            />

            {/* Focus Energy Card */}
            <SectionCard
              title="Focus Energy"
              description="Visual sprint capacity indicator."
              headerAction={
                <span className="text-[10px] font-mono text-[#71717a]">
                  GAME UI
                </span>
              }
            >
              <div className="space-y-3 pt-1">
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-2xl font-bold text-[#fafafa]">
                    {energyPercent}%
                  </span>
                  <span className="text-[10px] text-[#71717a]">
                    {energyPercent > 60
                      ? "OPTIMAL SPRINT"
                      : energyPercent > 30
                      ? "STEADY MOMENTUM"
                      : "SUSTAINED EFFORT"}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#71717a] leading-tight">
                  Single-tasking mode active. Distractions safely parked in the parking lot.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </PageContainer>

      {/* Side Quest Quick Capture */}
      <QuickCaptureSideQuest
        open={showQuickCapture}
        onOpenChange={setShowQuickCapture}
        onSuccess={(title) => showToast(`Parked side quest: "${title}"`)}
      />

      {/* Save Context Modal */}
      <SaveContextDialog
        open={showSaveContext}
        onOpenChange={setShowSaveContext}
        onSuccess={(note) => showToast(note ? `Thread saved: "${note}"` : "Thread saved successfully")}
      />

      {/* Interruption Modal */}
      <InterruptionDialog
        open={showInterruption}
        onOpenChange={setShowInterruption}
        onEndSession={handleEndSession}
      />
    </AnimatedPage>
  );
}
