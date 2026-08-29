import * as React from "react";
import { Sparkles, Shield, Inbox, Check, CornerDownLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSideQuests } from "@/hooks/useSideQuests";
import { useQuests } from "@/hooks/useQuests";

interface QuickCaptureSideQuestProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceQuestId?: string;
  onSuccess?: (title: string) => void;
}

export function QuickCaptureSideQuest({
  open,
  onOpenChange,
  sourceQuestId,
  onSuccess,
}: QuickCaptureSideQuestProps) {
  const { captureSideQuest } = useSideQuests();
  const { getMainQuest, getProject } = useQuests();
  const [title, setTitle] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const activeMainQuest = getMainQuest();
  const effectiveSourceId = sourceQuestId || activeMainQuest?.id;

  React.useEffect(() => {
    if (open) {
      setTitle("");
      // Auto focus on next tick
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    captureSideQuest({
      title: trimmed,
      sourceQuestId: effectiveSourceId,
    });

    onSuccess?.(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-md p-0 overflow-hidden shadow-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Inbox className="w-3.5 h-3.5" />
              </div>
              <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-[#a1a1aa] uppercase">
                PARK SIDE QUEST
              </DialogTitle>
            </div>
            <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
              QUICK CAPTURE
            </span>
          </div>

          {/* Heading prompt */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#fafafa] tracking-tight">
              What's trying to steal your attention?
            </h3>
            <DialogDescription className="text-xs text-[#a1a1aa] leading-relaxed">
              Park random thoughts or sudden tasks here. Your active quest stays locked and safe.
            </DialogDescription>
          </div>

          {/* Input field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Check flight prices for summer trip..."
                className="bg-[#09090b] border-[#27272a] text-[#fafafa] text-sm placeholder:text-[#52525b] focus-visible:ring-1 focus-visible:ring-white pr-20 py-2.5 h-11"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 text-[10px] font-mono text-[#71717a] bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a]">
                <span>↵ Enter</span>
              </div>
            </div>

            {effectiveSourceId && activeMainQuest && (
              <p className="text-[11px] text-[#71717a] flex items-center gap-1.5 font-mono pt-1">
                <Shield className="w-3 h-3 text-[#71717a]" />
                <span>Source: {activeMainQuest.title}</span>
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[#27272a]">
            <span className="text-[11px] text-[#71717a]">
              Organize or promote later
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs text-[#a1a1aa] hover:text-white hover:bg-[#27272a] h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!title.trim()}
                className="font-bold text-xs bg-white text-black hover:bg-[#e4e4e7] h-8 cursor-pointer shadow-xs disabled:opacity-40"
              >
                <Inbox className="w-3.5 h-3.5 mr-1.5" />
                Park It
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
