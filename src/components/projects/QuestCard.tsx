import * as React from "react";
import {
  Target,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Zap,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ListTodo,
  LifeBuoy,
  Split,
  AlertCircle,
  BookmarkPlus,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuestStepList } from "@/components/quests/QuestStepList";
import { ContextHistory } from "@/components/context/ContextHistory";
import { SaveContextDialog } from "@/components/context/SaveContextDialog";
import { useQuests } from "@/hooks/useQuests";
import type { Quest, QuestPriority } from "@/types/quest";
import { cn } from "@/lib/utils";

interface QuestCardProps {
  quest: Quest;
  isMainQuest: boolean;
  onSetMainQuest: (id: string) => void;
  onUpdateProgress: (id: string, progress: number) => void;
  onComplete: (id: string) => void;
  onEdit: (quest: Quest) => void;
  onDelete: (id: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

const PRIORITY_CONFIG: Record<
  QuestPriority,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  high: {
    label: "HIGH PRIORITY",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: Flame,
  },
  medium: {
    label: "MEDIUM PRIORITY",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    icon: Zap,
  },
  low: {
    label: "LOW PRIORITY",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: Sparkles,
  },
};

export function QuestCard({
  quest,
  isMainQuest,
  onSetMainQuest,
  onUpdateProgress,
  onComplete,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  className,
  defaultExpanded = false,
}: QuestCardProps) {
  const { getQuestSteps, getQuestNextAction, getQuestProgress } = useQuests();
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [showSaveContextDialog, setShowSaveContextDialog] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded || isMainQuest);
  const [isJustCompleted, setIsJustCompleted] = React.useState(false);

  const shouldReduceMotion = useReducedMotion();

  const steps = getQuestSteps(quest.id);
  const progress = getQuestProgress(quest);
  const nextAction = getQuestNextAction(quest);
  const priorityConfig = PRIORITY_CONFIG[quest.priority];
  const PriorityIcon = priorityConfig.icon;
  const isCompleted = quest.status === "completed";

  const handleConfirmComplete = () => {
    setIsJustCompleted(true);
    setTimeout(() => {
      onComplete(quest.id);
      setShowCompleteDialog(false);
      setIsJustCompleted(false);
    }, 400);
  };

  return (
    <>
      <Card
        className={cn(
          "border-[#27272a] bg-[#18181b] rounded-xl overflow-hidden transition-all duration-200",
          isMainQuest && "border-white/50 bg-[#18181b] shadow-md ring-1 ring-white/20",
          isCompleted && "opacity-70 bg-[#121214] border-[#222226]",
          isJustCompleted && "border-[#22c55e] ring-1 ring-[#22c55e]/30",
          className
        )}
      >
        <CardContent className="p-5 sm:p-6 space-y-4">
          {/* Top Row: Main Quest badge, Priority Badge, Actions */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {isMainQuest && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  <Target className="w-3 h-3" />
                  MAIN QUEST
                </span>
              )}

              <span
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border",
                  priorityConfig.bg,
                  priorityConfig.text,
                  priorityConfig.border
                )}
              >
                <PriorityIcon className="w-3 h-3" />
                {priorityConfig.label}
              </span>

              {isCompleted && (
                <span className="px-2 py-0.5 rounded bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e] text-[10px] font-mono font-bold uppercase tracking-wider">
                  COMPLETED
                </span>
              )}
            </div>

            {/* Actions Menu & Reordering buttons */}
            <div className="flex items-center gap-1">
              {(onMoveUp || onMoveDown) && (
                <div className="flex items-center gap-0.5 mr-1 bg-[#121214] border border-[#27272a] rounded-md p-0.5">
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                    title="Move Quest Up"
                    aria-label="Move Quest Up"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                    title="Move Quest Down"
                    aria-label="Move Quest Down"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-[#27272a] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="iconSm"
                    className="h-7 w-7 text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a]"
                    aria-label="Quest options"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-[#18181b] border-[#27272a] text-[#fafafa] min-w-[160px]"
                >
                  {!isCompleted && !isMainQuest && (
                    <DropdownMenuItem
                      onClick={() => onSetMainQuest(quest.id)}
                      className="cursor-pointer text-xs flex items-center font-medium"
                    >
                      <Target className="w-3.5 h-3.5 mr-2 text-white" />
                      Set as Main Quest
                    </DropdownMenuItem>
                  )}
                  {onMoveUp && canMoveUp && (
                    <DropdownMenuItem
                      onClick={onMoveUp}
                      className="cursor-pointer text-xs flex items-center"
                    >
                      <ArrowUp className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                      Move Up
                    </DropdownMenuItem>
                  )}
                  {onMoveDown && canMoveDown && (
                    <DropdownMenuItem
                      onClick={onMoveDown}
                      className="cursor-pointer text-xs flex items-center"
                    >
                      <ArrowDown className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                      Move Down
                    </DropdownMenuItem>
                  )}
                  {!isCompleted && (
                    <DropdownMenuItem
                      onClick={() => setShowSaveContextDialog(true)}
                      className="cursor-pointer text-xs flex items-center"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                      Save Thread Context
                    </DropdownMenuItem>
                  )}
                  {!isCompleted && (
                    <DropdownMenuItem
                      onClick={() => setShowCompleteDialog(true)}
                      className="cursor-pointer text-xs flex items-center text-[#22c55e] focus:text-[#22c55e]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                      Complete Quest
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="cursor-pointer text-xs flex items-center"
                  >
                    <ListTodo className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                    {isExpanded ? "Collapse Steps" : "View Steps"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEdit(quest)}
                    className="cursor-pointer text-xs flex items-center"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                    Edit Quest
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#27272a]" />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="cursor-pointer text-xs flex items-center text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete Quest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Quest Title & Description */}
          <div className="space-y-1">
            <h4
              className={cn(
                "font-semibold text-sm text-[#fafafa] tracking-tight",
                isCompleted && "line-through text-[#71717a]"
              )}
            >
              {quest.title}
            </h4>
            {quest.description && (
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                {quest.description}
              </p>
            )}
          </div>

          {/* Next Action Preview (Only if active & not completed) */}
          {!isCompleted && (
            <div className="p-3 bg-[#09090b] border border-[#27272a] rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#71717a] uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-[#22c55e]" />
                  <span>NEXT ACTION</span>
                </div>
                {quest.blocker && (
                  <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-2.5 h-2.5" />
                    Blocker noted
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-[#fafafa] leading-snug">
                {nextAction || "Break this quest down into small steps"}
              </p>
            </div>
          )}

          {/* Progress Bar & Step counts */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#71717a]">
                {steps.length > 0
                  ? `${steps.filter((s) => s.status === "completed").length} / ${steps.length} steps`
                  : "0 steps"}
              </span>
              <span className="font-bold text-[#fafafa]">{progress}%</span>
            </div>

            <div className="w-full h-1.5 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Footer: Quick Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]/60">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-mono text-[#a1a1aa] hover:text-[#fafafa] transition-colors cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Hide Details</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>View Steps ({steps.length})</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              {!isCompleted && !isMainQuest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetMainQuest(quest.id)}
                  className="h-7 px-2.5 text-xs font-mono border-[#27272a] hover:bg-[#27272a] text-[#fafafa]"
                >
                  <Target className="w-3 h-3 mr-1" />
                  Make Main
                </Button>
              )}
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCompleteDialog(true)}
                  className="h-7 px-2 text-xs font-mono text-[#22c55e] hover:text-[#22c55e] hover:bg-[#22c55e]/10"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Done
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Section: Step List + Context History */}
          {isExpanded && (
            <div className="pt-3 border-t border-[#27272a] space-y-4 animate-in fade-in duration-200">
              <QuestStepList quest={quest} />
              <ContextHistory questId={quest.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Context Dialog */}
      <SaveContextDialog
        questId={quest.id}
        open={showSaveContextDialog}
        onOpenChange={setShowSaveContextDialog}
      />

      {/* Complete Quest Confirmation Alert Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#22c55e]">
              <CheckCircle2 className="w-5 h-5" />
              Complete "{quest.title}"?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#a1a1aa] space-y-2">
              <span className="block">
                All steps will be marked as finished and your quest progress will reach 100%.
              </span>
              <span className="block text-[#71717a]">
                Nice. One less thing haunting you.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmComplete}
              className="bg-white text-black hover:bg-[#e4e4e7] font-bold"
            >
              Complete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Quest Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quest?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#a1a1aa]">
              Are you sure you want to delete "{quest.title}"? This will also remove its broken-down steps.
              {isMainQuest && " Since this is currently your Main Quest, your active objective will be cleared."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(quest.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Delete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
