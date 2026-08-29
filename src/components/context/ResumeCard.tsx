import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Bookmark,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { achievementImages } from "@/config/achievementBadges";
import { useQuests } from "@/hooks/useQuests";
import { useContextKeeper } from "@/hooks/useContextKeeper";
import { formatContextTimeAgo } from "@/lib/context-utils";
import type { ContextReason, WorkContext } from "@/types/work-context";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";

interface ResumeCardProps {
  className?: string;
  onResumed?: () => void;
}

const REASON_LABELS: Record<ContextReason, { label: string; bg: string; text: string }> = {
  manual: {
    label: "MANUAL SNAPSHOT",
    bg: "bg-blue-500/10",
    text: "text-blue-400 border-blue-500/20",
  },
  interruption: {
    label: "INTERRUPTED",
    bg: "bg-amber-500/10",
    text: "text-amber-400 border-amber-500/20",
  },
  "task-switch": {
    label: "TASK SWITCH",
    bg: "bg-purple-500/10",
    text: "text-purple-400 border-purple-500/20",
  },
  "session-end": {
    label: "SESSION WRAP",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400 border-emerald-500/20",
  },
};

export function ResumeCard({ className, onResumed }: ResumeCardProps) {
  const navigate = useNavigate();
  const { quests, getProject, setMainQuest, activeMainQuestId } = useQuests();
  const { latestResumable, resumeThread, deleteWorkContext } = useContextKeeper();
  const { awardXp, incrementCombo } = useGamification();
  const [isJustResumed, setIsJustResumed] = React.useState(false);

  if (!latestResumable) return null;

  const quest = quests.find((q) => q.id === latestResumable.questId);
  if (!quest || quest.status === "completed") return null;

  const project = getProject(quest.projectId);
  const reasonInfo = REASON_LABELS[latestResumable.reason] || REASON_LABELS.manual;
  const isAlreadyMainQuest = activeMainQuestId === quest.id;

  const triggerResumeGamification = () => {
    awardXp({
      type: "resume_after_interruption",
      referenceId: `resume-${latestResumable.id}-${Date.now()}`,
      label: "Resumed Work Thread",
    });
    incrementCombo("resume_after_interruption");
  };

  const handleResume = () => {
    setIsJustResumed(true);
    triggerResumeGamification();
    resumeThread(latestResumable.id);
    onResumed?.();
    setTimeout(() => {
      setIsJustResumed(false);
    }, 1500);
  };

  const handleResumeAndFocus = () => {
    triggerResumeGamification();
    resumeThread(latestResumable.id);
    onResumed?.();
    navigate("/focus");
  };

  const isStaleProgress = quest.progress !== latestResumable.progress;

  return (
    <Card
      className={cn(
        "border-white/30 bg-[#18181b] rounded-xl overflow-hidden relative select-none transition-all duration-200 hover:border-white/50 shadow-sm",
        isJustResumed && "border-[#22c55e] ring-1 ring-[#22c55e]/40",
        className
      )}
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#09090b] border border-sky-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={achievementImages.resumeThreadEmblem}
                alt="Resume Thread"
                className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
              RESUME YOUR THREAD
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase",
                reasonInfo.bg,
                reasonInfo.text
              )}
            >
              {reasonInfo.label}
            </span>
            <span className="text-[10px] font-mono text-[#71717a] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {formatContextTimeAgo(latestResumable.savedAt)}
            </span>
            <button
              type="button"
              onClick={() => deleteWorkContext(latestResumable.id)}
              className="text-[#71717a] hover:text-[#fafafa] p-0.5 rounded transition-colors"
              title="Dismiss thread bookmark"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="space-y-2">
          <div className="space-y-0.5">
            <h3 className="text-base sm:text-lg font-bold text-[#fafafa] tracking-tight">
              {quest.title}
            </h3>
            {project && (
              <p className="text-xs text-[#71717a]">
                Project: <span className="text-[#a1a1aa]">{project.name}</span>
              </p>
            )}
          </div>

          {/* Note Quote if saved */}
          {latestResumable.note && (
            <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#e4e4e7] italic space-y-1">
              <div className="flex items-center gap-1.5 not-italic text-[10px] font-mono text-[#71717a] uppercase font-bold">
                <Bookmark className="w-2.5 h-2.5 text-white" />
                <span>Last note:</span>
              </div>
              <p className="leading-relaxed pl-4">“{latestResumable.note}”</p>
            </div>
          )}

          {/* Next Action */}
          <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a] flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
              <span className="text-[#71717a] text-[11px] shrink-0">Next:</span>
              <span className="text-[#fafafa] font-medium truncate">
                {latestResumable.nextAction || quest.nextAction || "Pick up where you left off"}
              </span>
            </div>

            <div className="text-[10px] font-mono text-[#a1a1aa] shrink-0">
              {isStaleProgress ? (
                <span>
                  Saved at {latestResumable.progress}% (Now {quest.progress}%)
                </span>
              ) : (
                <span>{quest.progress}% complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#27272a]">
          <span className="text-[11px] text-[#71717a]">
            {isAlreadyMainQuest ? "Already your active Main Quest" : "Jump straight into flow"}
          </span>

          <div className="flex items-center gap-2">
            {!isAlreadyMainQuest && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResume}
                className="h-8 px-3 text-xs font-mono border-[#27272a] hover:bg-[#27272a] text-[#fafafa]"
              >
                Set Main Quest
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              onClick={handleResumeAndFocus}
              className="h-8 px-3.5 text-xs font-bold bg-white text-black hover:bg-[#e4e4e7] cursor-pointer shadow-xs"
            >
              <Play className="w-3 h-3 mr-1.5 fill-black" />
              Resume Focus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
