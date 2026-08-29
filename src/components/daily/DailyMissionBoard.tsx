import * as React from "react";
import { Link } from "react-router-dom";
import {
  Target,
  Shield,
  CheckCircle2,
  Plus,
  X,
  Play,
  LifeBuoy,
  Sparkles,
  Droplets,
  Activity,
  Moon,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyContext } from "@/stores/DailyContext";
import { useQuestContext } from "@/stores/QuestContext";
import { useRecoveryContext } from "@/stores/RecoveryContext";
import { SelectDailyMissionDialog } from "./SelectDailyMissionDialog";
import type { RecoveryType } from "@/types/recovery";
import { cn } from "@/lib/utils";

export function DailyMissionBoard() {
  const {
    todayKey,
    loadout,
    mainMissionQuest,
    sideMissionQuests,
    isMainMissionComplete,
    areSideMissionsComplete,
    isDailyClear,
    isRecoveryGoalsMet,
    recoveryGoalsProgress,
    clearMainMission,
    removeSideMission,
    claimDailyClearBonus,
    claimRecoveryBonus,
  } = useDailyContext();

  const { projects, getQuestNextAction } = useQuestContext();
  const { logWater, logMovement, logStretch } = useRecoveryContext();

  const handleLogRecovery = (type: string) => {
    if (type === "water") logWater();
    else if (type === "movement") logMovement(60);
    else logStretch();
  };

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"main" | "side">("main");

  const openAssignMain = () => {
    setDialogMode("main");
    setDialogOpen(true);
  };

  const openAddSide = () => {
    setDialogMode("side");
    setDialogOpen(true);
  };

  // Find parent project of main mission
  const mainProject = React.useMemo(() => {
    if (!mainMissionQuest) return null;
    return projects.find((p) => p.id === mainMissionQuest.projectId) || null;
  }, [projects, mainMissionQuest]);

  const nextAction = mainMissionQuest ? getQuestNextAction(mainMissionQuest) : undefined;

  // Format today's date
  const formattedDate = React.useMemo(() => {
    try {
      const parts = todayKey.split("-").map(Number);
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return todayKey;
    }
  }, [todayKey]);

  return (
    <div
      id="daily-mission-board"
      className="p-5 rounded-2xl bg-[#0e0e11] border border-[#27272a] shadow-md space-y-5"
    >
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-[#fafafa]">
            <Target className="w-4 h-4 text-[#0047ba] dark:text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-[#fafafa]">
                TODAY'S LOADOUT
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#18181b] text-[#a1a1aa] border border-[#27272a]">
                {formattedDate}
              </span>
            </div>
            <p className="text-[11px] text-[#71717a] mt-0.5">
              1 Main Mission + up to 2 Side Missions. Focused daily execution.
            </p>
          </div>
        </div>

        {/* Daily Clear Status / Claim Button */}
        {isDailyClear ? (
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>DAILY MISSIONS CLEARED</span>
            </div>
            {!loadout.claimedClearBonusAt && (
              <Button
                size="sm"
                onClick={claimDailyClearBonus}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
              >
                Claim +40 XP
              </Button>
            )}
          </div>
        ) : (
          <div className="text-[11px] font-mono text-[#71717a] flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles className="w-3 h-3 text-amber-400/80" />
            <span>Clear all daily missions for +40 XP</span>
          </div>
        )}
      </div>

      {/* Main Loadout Slots Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 1. Daily Main Mission (Left 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71717a]">
            <span>1. DAILY MAIN MISSION (COMMITTED FOCUS)</span>
            {mainMissionQuest && (
              <button
                type="button"
                onClick={clearMainMission}
                className="text-[10px] text-[#71717a] hover:text-rose-400 transition-colors"
              >
                Clear slot
              </button>
            )}
          </div>

          {mainMissionQuest ? (
            <div
              className={cn(
                "p-4 rounded-xl border bg-[#141418] transition-all space-y-3",
                isMainMissionComplete
                  ? "border-emerald-500/40 bg-emerald-950/10"
                  : "border-[#0047ba]/40 shadow-xs"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0 flex-1">
                  {mainProject && (
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                      {mainProject.name}
                    </div>
                  )}
                  <h3 className="text-sm font-bold text-[#fafafa] truncate">
                    {mainMissionQuest.title}
                  </h3>
                  {nextAction && (
                    <p className="text-xs text-[#a1a1aa] line-clamp-1">
                      <span className="text-[#71717a]">Next: </span>
                      {nextAction}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-[#fafafa]">
                    {mainMissionQuest.progress}%
                  </span>
                  <div className="mt-1">
                    {isMainMissionComplete ? (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        COMPLETED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0047ba]/20 text-blue-400 border border-[#0047ba]/30">
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Progress value={mainMissionQuest.progress} className="h-1.5 bg-[#27272a]" />

              <div className="flex items-center justify-between pt-1 gap-2">
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    className="h-7 text-xs bg-[#0047ba] hover:bg-[#003894] text-white font-semibold"
                  >
                    <Link to="/focus">
                      <Play className="w-3 h-3 mr-1" />
                      Focus Session
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-[#27272a] bg-[#18181b] text-[#fafafa]"
                  >
                    <Link to={`/projects/${mainMissionQuest.projectId}`}>
                      Open Quest
                    </Link>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openAssignMain}
                  className="h-7 text-xs text-[#a1a1aa] hover:text-[#fafafa]"
                >
                  Change Quest
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAssignMain}
              className="w-full p-6 rounded-xl border border-dashed border-[#27272a] bg-[#141418]/50 hover:bg-[#141418] hover:border-[#0047ba]/60 transition-all flex flex-col items-center justify-center gap-2 text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#71717a] group-hover:text-[#fafafa] group-hover:border-[#0047ba]">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-[#fafafa]">
                Assign Daily Main Mission
              </div>
              <div className="text-[11px] text-[#71717a] max-w-xs">
                Commit to advancing 1 primary quest today to keep the main quest alive.
              </div>
            </button>
          )}
        </div>

        {/* 2. Daily Side Missions (Right column) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71717a]">
            <span>2. SIDE MISSIONS ({sideMissionQuests.length}/2)</span>
            {sideMissionQuests.length < 2 && (
              <button
                type="button"
                onClick={openAddSide}
                className="text-[10px] text-[#0047ba] dark:text-blue-400 hover:underline font-semibold"
              >
                + Add
              </button>
            )}
          </div>

          <div className="space-y-2">
            {sideMissionQuests.map((quest) => {
              const isComplete = quest.status === "completed" || quest.progress >= 100;

              return (
                <div
                  key={quest.id}
                  className={cn(
                    "p-3 rounded-xl border bg-[#141418] transition-all space-y-2",
                    isComplete
                      ? "border-emerald-500/30 bg-emerald-950/10"
                      : "border-[#27272a]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-[#fafafa] truncate">
                        {quest.title}
                      </div>
                      <div className="text-[10px] font-mono text-[#71717a] mt-0.5">
                        {quest.progress}% • {isComplete ? "Completed" : "In progress"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSideMission(quest.id)}
                      className="text-[#71717a] hover:text-rose-400 p-0.5"
                      title="Remove side mission"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Progress value={quest.progress} className="h-1 bg-[#27272a]" />
                </div>
              );
            })}

            {sideMissionQuests.length < 2 && (
              <button
                type="button"
                onClick={openAddSide}
                className="w-full p-3 rounded-xl border border-dashed border-[#27272a] bg-[#141418]/30 hover:bg-[#141418] hover:border-[#3f3f46] transition-all flex items-center justify-center gap-2 text-xs text-[#71717a] hover:text-[#fafafa]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Secondary Side Mission</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Daily Recovery Goals (Self-Care & Real Sustainability) */}
      <div className="p-3.5 rounded-xl bg-[#141418] border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#71717a] flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span>DAILY RECOVERY & SUSTAINABILITY</span>
          </div>
          <p className="text-xs text-[#a1a1aa]">
            Take care of yourself while you work. Logging self-care earns +10 XP daily bonus.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {recoveryGoalsProgress.map((goal) => {
            const getIcon = () => {
              if (goal.type === "water") return <Droplets className="w-3 h-3 text-cyan-400" />;
              if (goal.type === "movement") return <Activity className="w-3 h-3 text-emerald-400" />;
              return <Moon className="w-3 h-3 text-indigo-400" />;
            };

            return (
              <button
                key={goal.type}
                type="button"
                onClick={() => handleLogRecovery(goal.type)}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all hover:scale-102",
                  goal.met
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-[#18181b] border-[#27272a] text-[#fafafa] hover:border-[#3f3f46]"
                )}
                title={`Click to log ${goal.type} (+20 XP)`}
              >
                {getIcon()}
                <span className="capitalize">{goal.type}</span>
                <span className="font-mono text-[10px] opacity-75">
                  ({goal.current}/{goal.target})
                </span>
              </button>
            );
          })}

          {isRecoveryGoalsMet && !loadout.claimedRecoveryBonusAt && (
            <Button
              size="sm"
              onClick={claimRecoveryBonus}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Claim +10 XP
            </Button>
          )}
        </div>
      </div>

      <SelectDailyMissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
      />
    </div>
  );
}
