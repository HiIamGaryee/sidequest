import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Quest, CreateQuestInput, UpdateQuestInput, QuestPriority } from "@/types/quest";
import { Zap, Clock, ShieldCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  projectId: string;
  initialData?: Quest | null;
  onSubmit: (data: CreateQuestInput | UpdateQuestInput) => void;
}

const PRIORITIES: { value: QuestPriority; label: string; desc: string }[] = [
  { value: "high", label: "HIGH", desc: "Urgent or critical path" },
  { value: "medium", label: "MEDIUM", desc: "Standard priority" },
  { value: "low", label: "LOW", desc: "Low impact / stretch" },
];

const PROGRESS_PRESETS = [0, 25, 50, 75, 100];

export function QuestForm({
  open,
  onOpenChange,
  mode,
  projectId,
  initialData,
  onSubmit,
}: QuestFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<QuestPriority>("medium");
  const [estimatedMinutes, setEstimatedMinutes] = React.useState<string>("");
  const [nextAction, setNextAction] = React.useState("");
  const [blocker, setBlocker] = React.useState("");
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setTitle(initialData.title);
        setDescription(initialData.description || "");
        setPriority(initialData.priority || "medium");
        setEstimatedMinutes(
          initialData.estimatedMinutes ? String(initialData.estimatedMinutes) : ""
        );
        setNextAction(initialData.nextAction || "");
        setBlocker(initialData.blocker || "");
        setProgress(initialData.progress ?? 0);
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setEstimatedMinutes("");
        setNextAction("");
        setBlocker("");
        setProgress(0);
      }
      setError("");
    }
  }, [open, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Quest title is required.");
      return;
    }

    const minutes = estimatedMinutes.trim() ? parseInt(estimatedMinutes, 10) : undefined;
    const validMinutes = minutes && !isNaN(minutes) && minutes > 0 ? minutes : undefined;

    if (mode === "create") {
      const input: CreateQuestInput = {
        projectId,
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: validMinutes,
        nextAction: nextAction.trim() || undefined,
        blocker: blocker.trim() || undefined,
      };
      onSubmit(input);
    } else {
      const input: UpdateQuestInput = {
        title: trimmedTitle,
        description: description.trim() || undefined,
        priority,
        estimatedMinutes: validMinutes,
        nextAction: nextAction.trim() || undefined,
        blocker: blocker.trim() || undefined,
        progress,
      };
      onSubmit(input);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-[#18181b] border-[#27272a] text-[#fafafa] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Add Quest" : "Edit Quest"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Break the initiative down into clear, protected steps."
                : "Modify quest parameters, next action, and progress."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-title" className="text-xs text-[#a1a1aa]">
                Quest Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="quest-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Connect first WebMCP tool"
                autoFocus
                className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b]"
              />
              {error && (
                <p className="text-[11px] text-red-400 font-mono">{error}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-desc" className="text-xs text-[#a1a1aa]">
                Description <span className="text-[10px] text-[#71717a] font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="quest-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What defines success for this specific quest?"
                rows={2}
                className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b] resize-none"
              />
            </div>

            {/* Priority Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[#a1a1aa]">Priority</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col justify-between",
                      priority === p.value
                        ? "bg-white text-black border-white shadow-xs font-bold"
                        : "bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46] hover:text-white"
                    )}
                  >
                    <span className="text-xs font-mono">{p.label}</span>
                    <span
                      className={cn(
                        "text-[10px] line-clamp-1",
                        priority === p.value ? "text-black/70" : "text-[#71717a]"
                      )}
                    >
                      {p.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Action & Estimate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="next-action" className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-[#71717a]" />
                  <span>Manual Next Action</span>
                </Label>
                <Input
                  id="next-action"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="e.g. Test registerTool() inside Chrome"
                  className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="est-time" className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#71717a]" />
                  <span>Estimate (Minutes)</span>
                </Label>
                <Input
                  id="est-time"
                  type="number"
                  min="1"
                  max="480"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="e.g. 20"
                  className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b]"
                />
              </div>
            </div>

            {/* Optional Blocker */}
            <div className="space-y-1.5">
              <Label htmlFor="quest-blocker" className="text-xs text-[#a1a1aa] flex items-center gap-1.5">
                <span className="text-amber-400 font-mono text-[10px]">⚠</span>
                <span>Active Blocker <span className="text-[10px] text-[#71717a] font-normal">(Optional note if you're waiting on something)</span></span>
              </Label>
              <Input
                id="quest-blocker"
                value={blocker}
                onChange={(e) => setBlocker(e.target.value)}
                placeholder="e.g. Waiting for API token or client response"
                className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b]"
              />
            </div>

            {/* Progress Selector in Edit Mode */}
            {mode === "edit" && (
              <div className="space-y-2 pt-1 border-t border-[#27272a]">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-xs text-[#a1a1aa]">Quest Progress</Label>
                  <span className="font-mono font-bold text-[#fafafa]">{progress}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {PROGRESS_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setProgress(pct)}
                      className={cn(
                        "flex-1 py-1 text-xs font-mono rounded-md border transition-all cursor-pointer",
                        progress === pct
                          ? "bg-white text-black font-bold border-white"
                          : "bg-[#09090b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]"
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="font-bold text-xs cursor-pointer"
            >
              {mode === "create" ? "Add Quest" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
