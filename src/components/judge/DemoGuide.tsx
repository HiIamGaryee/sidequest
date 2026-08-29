import * as React from "react";
import { Copy, Check, Sparkles, MessageSquare, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DemoPromptItem {
  id: string;
  number: number;
  prompt: string;
  title: string;
  expectedFlow: string;
  toolsUsed: string[];
}

export const DEMO_PROMPTS: DemoPromptItem[] = [
  {
    id: "prompt-1",
    number: 1,
    title: "Resume Interrupted Work",
    prompt: "I have 45 minutes. Get me back to useful work.",
    expectedFlow: "Agent reads work state, retrieves saved Context Keeper note, restores active Main Quest, and begins a focus session.",
    toolsUsed: ["get_current_work_state", "resume_work_context", "start_focus_session"],
  },
  {
    id: "prompt-2",
    number: 2,
    title: "Unstuck & Micro-Steps",
    prompt: "I'm stuck. Make my next action smaller.",
    expectedFlow: "Agent breaks down the current blocked next action into an ultra-frictionless 2-minute micro-step.",
    toolsUsed: ["get_current_work_state", "make_next_action_smaller"],
  },
  {
    id: "prompt-3",
    number: 3,
    title: "Park Distraction",
    prompt: "Park 'redesign my portfolio' so I don't switch tasks.",
    expectedFlow: "Agent parks the distracting impulse safely into the Side Quest Parking Lot without derailing Main Quest focus.",
    toolsUsed: ["park_side_quest", "get_current_work_state"],
  },
  {
    id: "prompt-4",
    number: 4,
    title: "Lock In Focus",
    prompt: "Start a 25-minute focus session.",
    expectedFlow: "Agent activates the countdown timer on the Main Quest and logs focus engagement.",
    toolsUsed: ["start_focus_session", "get_focus_state"],
  },
  {
    id: "prompt-5",
    number: 5,
    title: "Physical Well-being",
    prompt: "I've been working for a while. Check if a recovery break makes sense.",
    expectedFlow: "Agent inspects elapsed focus time and recovery history (52m since last movement) and recommends a stretch or hydration pause.",
    toolsUsed: ["get_recovery_state", "suggest_recovery", "log_recovery"],
  },
  {
    id: "prompt-6",
    number: 6,
    title: "Review Accomplishments",
    prompt: "What did I accomplish?",
    expectedFlow: "Agent provides a structured summary of focus minutes, completed steps, player level (Lv. 4), and combo streaks.",
    toolsUsed: ["get_session_summary", "get_player_state"],
  },
];

interface DemoGuideProps {
  onSelectPrompt?: (prompt: string) => void;
}

export function DemoGuide({ onSelectPrompt }: DemoGuideProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (item: DemoPromptItem) => {
    navigator.clipboard.writeText(item.prompt).then(() => {
      setCopiedId(item.id);
      if (onSelectPrompt) {
        onSelectPrompt(item.prompt);
      }
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  return (
    <section
      id="demo-guide-panel"
      aria-labelledby="demo-guide-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 id="demo-guide-heading" className="text-sm font-semibold text-foreground tracking-tight">
              WebMCP Interaction Guide
            </h3>
            <p className="text-xs text-muted-foreground">
              Copy these prompts into ChatGPT or your WebMCP agent client to test live mutations.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border/60">
          6 Prepared Prompts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {DEMO_PROMPTS.map((item) => {
          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              id={`prompt-card-${item.number}`}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                isCopied
                  ? "bg-sky-500/10 border-sky-500/40"
                  : "bg-secondary/20 hover:bg-secondary/40 border-border/60 hover:border-border"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-sky-500/20 flex items-center justify-center text-[9px] text-sky-500 dark:text-sky-300">
                      {item.number}
                    </span>
                    {item.title}
                  </span>

                  <Button
                    id={`copy-prompt-btn-${item.number}`}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(item)}
                    className="h-6 px-2 text-[10px] font-mono gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={`Copy prompt ${item.number}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs font-mono font-medium text-foreground bg-background/60 p-2 rounded-lg border border-border/40 select-all">
                  "{item.prompt}"
                </p>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                <p className="leading-snug text-foreground/80">
                  <span className="font-semibold text-muted-foreground text-[10px] uppercase mr-1">Expected Flow:</span>
                  {item.expectedFlow}
                </p>

                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[9px] font-mono text-muted-foreground/70">Tools:</span>
                  {item.toolsUsed.map((tool) => (
                    <code
                      key={tool}
                      className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-secondary/80 text-sky-500 dark:text-sky-400 border border-border/40"
                    >
                      {tool}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
