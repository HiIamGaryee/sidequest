import * as React from "react";
import {
  Zap,
  Target,
  Shield,
  Heart,
  Award,
  Sparkles,
  Trophy,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useSkillContext } from "@/stores/SkillContext";
import { SkillTreeBranch } from "@/components/skills/SkillTreeBranch";
import type { SkillBranch } from "@/types/skill";
import { cn } from "@/lib/utils";

export function SkillsPage() {
  const { branches, skillsProgress, unlockedCount, totalCount, latestUnlocked, getBranchSkills } =
    useSkillContext();

  const [activeTab, setActiveTab] = React.useState<"all" | SkillBranch>("all");

  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  const displayedBranches = React.useMemo(() => {
    if (activeTab === "all") return branches;
    return branches.filter((b) => b.id === activeTab);
  }, [branches, activeTab]);

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header & Stats Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141418] to-[#09090b] border border-[#27272a] shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold tracking-widest uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>REAL-WORK PROGRESSION SYSTEM</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#fafafa] uppercase mt-1">
              SKILL TREE & MASTERY
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1 max-w-xl">
              12 skill nodes across 4 branches representing focus endurance, project completion, cognitive recovery, and resilience.
            </p>
          </div>

          {/* Masteries Progress Metric */}
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center gap-4 self-start sm:self-auto">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">
                Skills Unlocked
              </div>
              <div className="text-base font-mono font-bold text-[#fafafa]">
                {unlockedCount} <span className="text-xs text-[#71717a]">/ {totalCount} ({progressPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Unlocked Title Banner */}
        {latestUnlocked && (
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200">
                Latest Unlocked Title:{" "}
                <span className="font-bold text-amber-300">
                  "{latestUnlocked.definition.cosmeticTitle}"
                </span>{" "}
                ({latestUnlocked.definition.title})
              </span>
            </div>
          </div>
        )}

        {/* Branch Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#27272a]/60">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
              activeTab === "all"
                ? "bg-[#fafafa] text-[#09090b]"
                : "bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a]"
            )}
          >
            All Branches ({totalCount})
          </button>
          {branches.map((b) => {
            const count = getBranchSkills(b.id).filter((s) => s.state === "unlocked").length;
            const isTabActive = activeTab === b.id;

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setActiveTab(b.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                  isTabActive
                    ? "bg-[#fafafa] text-[#09090b]"
                    : "bg-[#18181b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a]"
                )}
              >
                <span>{b.title}</span>
                <span className="text-[10px] font-mono opacity-75">
                  ({count}/3)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Branch Tree Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayedBranches.map((branchMeta) => {
          const skills = getBranchSkills(branchMeta.id);
          return (
            <SkillTreeBranch
              key={branchMeta.id}
              branchMeta={branchMeta}
              skills={skills}
            />
          );
        })}
      </div>
    </div>
  );
}
