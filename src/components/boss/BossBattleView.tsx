import * as React from "react";
import { Link } from "react-router-dom";
import {
  Swords,
  Skull,
  ShieldAlert,
  Trophy,
  CheckCircle2,
  Sparkles,
  Settings,
  Play,
  Flame,
  Zap,
  ChevronRight,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBossContext } from "@/stores/BossContext";
import { useQuestContext } from "@/stores/QuestContext";
import { BossPhaseEditorDialog } from "./BossPhaseEditorDialog";
import { cn } from "@/lib/utils";

interface BossBattleViewProps {
  projectId: string;
  onToggleStandardView?: () => void;
}

export function BossBattleView({
  projectId,
  onToggleStandardView,
}: BossBattleViewProps) {
  const { getBossState, toggleBossMode, claimBossDefeatReward } = useBossContext();
  const { setMainQuest, getQuestNextAction } = useQuestContext();
  const [editorOpen, setEditorOpen] = React.useState(false);

  const bossState = getBossState(projectId);

  if (!bossState) {
    return null;
  }

  const { config, project, quests, progress, hpRemaining, isDefeated, phaseProgress } =
    bossState;

  return (
    <div className="space-y-6" id={`boss-battle-${projectId}`}>
      {/* Boss Arena HUD Header */}
      <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#181116] via-[#100d12] to-[#09090b] border-2 border-rose-900/40 shadow-xl overflow-hidden">
        {/* Background glow overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top meta & controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                    BOSS BATTLE MODE
                  </span>
                  {isDefeated && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      DEFEATED
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-black tracking-tight text-[#fafafa] uppercase mt-1">
                  {config.title || `BOSS: ${project.name}`}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorOpen(true)}
                className="h-8 text-xs border-[#27272a] bg-[#18181b]/80 text-[#a1a1aa] hover:text-[#fafafa]"
              >
                <Settings className="w-3.5 h-3.5 mr-1" />
                Configure Phases
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toggleBossMode(projectId, false);
                  if (onToggleStandardView) onToggleStandardView();
                }}
                className="h-8 text-xs border-[#27272a] bg-[#18181b]/80 text-[#a1a1aa] hover:text-[#fafafa]"
              >
                <List className="w-3.5 h-3.5 mr-1" />
                Standard View
              </Button>
            </div>
          </div>

          {/* Boss HP Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <div className="flex items-center gap-1.5 text-rose-400">
                <Swords className="w-3.5 h-3.5" />
                <span>BOSS HEALTH (PROJECT COMPLETION)</span>
              </div>
              <div className="text-right">
                <span className="text-rose-400">{hpRemaining} HP</span>
                <span className="text-[#71717a] font-normal"> / 100</span>
                <span className="text-[#a1a1aa] ml-2">({progress}% DMG DEALT)</span>
              </div>
            </div>

            {/* Custom styled HP gauge */}
            <div className="h-4 w-full bg-[#1c1418] rounded-full overflow-hidden border border-rose-900/50 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, 100 - hpRemaining))}%` }}
              />
            </div>
          </div>

          {/* Defeat Banner */}
          {isDefeated && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-300 uppercase font-mono">
                    BOSS DEFEATED!
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Everything is done. Suspicious. (+150 XP rewarded)
                  </p>
                </div>
              </div>
              {!config.claimedDefeatRewardAt && (
                <Button
                  size="sm"
                  onClick={() => claimBossDefeatReward(projectId)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
                >
                  Claim Victory XP
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Battle Phases Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-[#a1a1aa] flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>BATTLE PHASES & OBJECTIVES</span>
          </h2>
          <span className="text-xs text-[#71717a]">
            {phaseProgress.filter((p) => p.isComplete).length} of {phaseProgress.length} Phases Cleared
          </span>
        </div>

        <div className="space-y-4">
          {phaseProgress.map((item, idx) => {
            const { phase, quests: pQuests, progress: pProg, isComplete, isCurrent } = item;

            return (
              <div
                key={phase.id}
                className={cn(
                  "p-5 rounded-2xl border transition-all space-y-4",
                  isComplete
                    ? "bg-[#0d120f] border-emerald-500/30"
                    : isCurrent
                    ? "bg-[#141014] border-rose-500/50 shadow-md ring-1 ring-rose-500/20"
                    : "bg-[#0f0f12] border-[#27272a] opacity-80"
                )}
              >
                {/* Phase Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272a]/60">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "text-xs font-mono font-bold px-2 py-0.5 rounded border",
                        isComplete
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : isCurrent
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-[#18181b] text-[#71717a] border-[#27272a]"
                      )}
                    >
                      PHASE {phase.order || idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-[#fafafa]">
                      {phase.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-semibold text-[#a1a1aa]">
                      {pProg}% Phase Cleared
                    </span>
                    {isComplete && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CLEARED
                      </span>
                    )}
                    {isCurrent && !isComplete && (
                      <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> CURRENT TARGET
                      </span>
                    )}
                  </div>
                </div>

                <Progress
                  value={pProg}
                  className={cn(
                    "h-1.5",
                    isComplete
                      ? "bg-[#1c2e22]"
                      : isCurrent
                      ? "bg-[#29171e]"
                      : "bg-[#18181b]"
                  )}
                />

                {/* Quests inside this phase */}
                <div className="space-y-2 pt-1">
                  {pQuests.map((quest) => {
                    const isQuestDone = quest.status === "completed" || quest.progress >= 100;
                    const nextAct = getQuestNextAction(quest);

                    return (
                      <div
                        key={quest.id}
                        className={cn(
                          "p-3 rounded-xl border bg-[#18181b]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all",
                          isQuestDone
                            ? "border-emerald-500/20 bg-emerald-950/5 text-[#a1a1aa]"
                            : "border-[#27272a] text-[#fafafa] hover:border-[#3f3f46]"
                        )}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold truncate">
                              {quest.title}
                            </span>
                            {quest.priority === "high" && (
                              <span className="text-[9px] font-mono px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                PRIORITY
                              </span>
                            )}
                          </div>
                          {nextAct && (
                            <p className="text-[11px] text-[#71717a] line-clamp-1">
                              <span className="text-[#a1a1aa]">Next:</span> {nextAct}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                          <span className="text-xs font-mono font-bold">
                            {quest.progress}%
                          </span>

                          <div className="flex items-center gap-1.5">
                            {!isQuestDone && (
                              <Button
                                size="sm"
                                onClick={() => setMainQuest(quest.id)}
                                className="h-7 text-xs bg-[#0047ba] hover:bg-[#003894] text-white font-medium"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Set Main
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {pQuests.length === 0 && (
                    <div className="p-3 text-center text-xs text-[#71717a]">
                      No quests assigned to this phase yet. Click Configure Phases to assign quests.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BossPhaseEditorDialog
        projectId={projectId}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </div>
  );
}
