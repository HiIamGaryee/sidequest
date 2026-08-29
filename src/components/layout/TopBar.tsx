import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import { Menu, Inbox, HeartPulse, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerHud } from "@/components/gamification/PlayerHud";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CatLogo } from "@/components/shared/CatLogo";
import { QuickCaptureSideQuest } from "@/components/side-quests/QuickCaptureSideQuest";
import { useSideQuests } from "@/hooks/useSideQuests";
import { useRecovery } from "@/hooks/useRecovery";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NAVIGATION_ITEMS } from "@/config/navigation";

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation();
  const { parkedCount } = useSideQuests();
  const { isDueAny, openRecoveryCenter, preferences } = useRecovery();
  const [showQuickCapture, setShowQuickCapture] = React.useState(false);
  const [feedbackToast, setFeedbackToast] = React.useState<string | null>(null);

  // Global Cmd+K / Ctrl+K listener for quick capture
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowQuickCapture((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCaptureSuccess = (title: string) => {
    setFeedbackToast(`Parked: "${title.length > 20 ? title.slice(0, 20) + '...' : title}"`);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 2500);
  };

  const currentNav =
    NAVIGATION_ITEMS.find((item) =>
      item.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.path)
    ) || NAVIGATION_ITEMS[0];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md select-none transition-colors">
        {/* Left side: Mobile menu toggle + Current page indicator */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="iconSm"
            onClick={onMenuClick}
            className="md:hidden text-muted-foreground hover:text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <Link to="/" className="md:hidden flex items-center">
            <CatLogo size={26} />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground/60 hidden sm:inline">
              /
            </span>
            <h2 className="text-sm font-medium text-foreground tracking-tight">
              {currentNav.label}
            </h2>
          </div>
        </div>

        {/* Right side: Clean, spacious utilities & Player Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Subtle Parked Feedback Toast */}
          {feedbackToast && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-300 text-xs font-mono animate-in fade-in slide-in-from-top-1 duration-200">
              <Inbox className="w-3 h-3" />
              <span>{feedbackToast}</span>
            </div>
          )}

          <TooltipProvider delayDuration={200}>
            {/* Quick Capture Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setShowQuickCapture(true)}
                  className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-xs font-mono rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border text-foreground transition-all cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Park a distracting idea"
                >
                  <Inbox className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span className="hidden sm:inline">Park Idea</span>
                  <kbd className="hidden md:inline-block text-[10px] font-mono text-muted-foreground bg-muted/60 px-1 py-0.2 rounded border border-border/60">
                    ⌘K
                  </kbd>
                  {parkedCount > 0 && (
                    <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-mono">
                Park idea without breaking focus (⌘K / Ctrl+K)
              </TooltipContent>
            </Tooltip>

            {/* Recovery Center Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={openRecoveryCenter}
                  className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-mono rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border text-foreground transition-all cursor-pointer shadow-xs relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="Open Recovery Center"
                >
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  <span className="hidden lg:inline">Recovery</span>
                  {preferences.enabled && isDueAny && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-mono">
                Recovery Center • Hydration, movement & eye rest
              </TooltipContent>
            </Tooltip>

            {/* WebMCP Agent Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to="/settings"
                  className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 bg-secondary/40 hover:bg-secondary hover:border-border text-muted-foreground hover:text-foreground transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  aria-label="WebMCP Agent Status & Settings"
                >
                  <Bot className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs font-mono">
                WebMCP Agent Integration (Active)
              </TooltipContent>
            </Tooltip>

            {/* Theme Toggle */}
            <ThemeToggle />
          </TooltipProvider>

          {/* Unified Player Status HUD */}
          <PlayerHud />
        </div>
      </header>

      <QuickCaptureSideQuest
        open={showQuickCapture}
        onOpenChange={setShowQuickCapture}
        onSuccess={handleCaptureSuccess}
      />
    </>
  );
}


