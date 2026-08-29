import * as React from "react";
import type { SkillBranchMeta } from "@/config/skills";
import type { SkillProgressInfo } from "@/types/skill";
import { SkillNodeCard } from "./SkillNodeCard";
import { Zap, Target, Shield, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillTreeBranchProps {
  branchMeta: SkillBranchMeta;
  skills: SkillProgressInfo[];
}

export function SkillTreeBranch({ branchMeta, skills }: SkillTreeBranchProps) {
  const getIcon = () => {
    switch (branchMeta.id) {
      case "focus":
        return <Zap className="w-5 h-5 text-blue-400" />;
      case "finishing":
        return <Target className="w-5 h-5 text-amber-400" />;
      case "resilience":
        return <Shield className="w-5 h-5 text-purple-400" />;
      case "recovery":
        return <Heart className="w-5 h-5 text-emerald-400" />;
    }
  };

  const unlockedCount = skills.filter((s) => s.state === "unlocked").length;

  return (
    <div className="p-5 rounded-2xl bg-[#0e0e11] border border-[#27272a] space-y-4">
      {/* Branch Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide uppercase text-[#fafafa]">
              {branchMeta.title}
            </h3>
            <p className="text-[11px] text-[#71717a]">{branchMeta.description}</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-[#a1a1aa] px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a]">
          {unlockedCount} / {skills.length}
        </span>
      </div>

      {/* Nodes in this branch */}
      <div className="space-y-3">
        {skills.map((skill) => (
          <SkillNodeCard key={skill.definition.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}
