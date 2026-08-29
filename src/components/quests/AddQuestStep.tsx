import * as React from "react";
import { Plus, Zap, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AddQuestStepProps {
  questId: string;
  onAddStep: (title: string, isTiny: boolean) => void;
  className?: string;
  placeholder?: string;
}

const STEP_SUGGESTIONS = [
  "Inspect current code / file",
  "Write minimal interface/stub",
  "Test 1 single case",
  "Review & verify result",
];

export function AddQuestStep({
  questId,
  onAddStep,
  className,
  placeholder = "Add a small step (e.g. read docs, write 1 line)...",
}: AddQuestStepProps) {
  const [title, setTitle] = React.useState("");
  const [isTiny, setIsTiny] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddStep(trimmed, isTiny);
    setTitle("");
    setIsTiny(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onAddStep(suggestion, isTiny);
    setTitle("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="h-8 text-xs bg-[#09090b] border-[#27272a] text-[#fafafa] placeholder:text-[#52525b] pr-8 focus-visible:border-white/40"
          />
          {title.trim().length > 0 && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-[#71717a] hover:text-white transition-colors cursor-pointer"
              title="Press Enter to add"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Tiny step toggle button */}
        <button
          type="button"
          onClick={() => setIsTiny(!isTiny)}
          title={isTiny ? "Tiny step (2-5 min) active" : "Mark as Tiny step"}
          className={cn(
            "h-8 px-2 rounded-md border text-[10px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer shrink-0",
            isTiny
              ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
              : "bg-[#09090b] border-[#27272a] text-[#71717a] hover:text-[#fafafa] hover:border-[#3f3f46]"
          )}
        >
          <Zap className="w-3 h-3" />
          <span className="hidden sm:inline">Tiny</span>
        </button>

        <Button
          type="submit"
          disabled={!title.trim()}
          variant="outline"
          size="sm"
          className="h-8 px-2.5 text-xs border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] font-medium shrink-0 disabled:opacity-40 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </form>

      {/* Quick template suggestions for low-friction creation */}
      {showSuggestions && (
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          <span className="text-[10px] font-mono text-[#71717a]">Quick templates:</span>
          {STEP_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white hover:border-[#3f3f46] transition-all cursor-pointer"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
