import * as React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Compass, ChevronRight, Target, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { CatLogo } from "@/components/shared/CatLogo";
import { NAVIGATION_ITEMS } from "@/config/navigation";
import { useQuests } from "@/hooks/useQuests";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function Sidebar({ onItemClick, className }: SidebarProps) {
  const location = useLocation();
  const { getMainQuest, getQuestProgress, getQuestNextAction } = useQuests();
  const mainQuest = getMainQuest();

  const progress = mainQuest ? getQuestProgress(mainQuest) : 0;
  const nextAction = mainQuest ? getQuestNextAction(mainQuest) : undefined;

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-[#27272a] bg-[#09090b] text-[#fafafa] select-none transition-colors duration-200",
        className
      )}
    >
      {/* Brand Header */}
      <div className="p-6 pb-4">
        <Link
          to="/"
          onClick={onItemClick}
          className="group block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047ba] dark:focus-visible:ring-white/40 rounded-lg"
        >
          <div className="flex items-center gap-2.5 mb-1">
            <CatLogo size={32} className="shrink-0 -ml-0.5" />
            <h1 className="font-bold tracking-[0.2em] text-sm uppercase text-[#fafafa] transition-colors">
              SIDEQUEST
            </h1>
          </div>
          <p className="text-[10px] text-[#71717a] font-medium uppercase tracking-wider pl-8.5">
            Stay on the main quest.
          </p>
        </Link>
      </div>

      {/* Navigation list */}
      <div className="flex-1 px-3 py-2 space-y-1">
        <div className="px-3 pb-1.5 text-[9px] font-mono font-semibold uppercase tracking-widest text-[#71717a]">
          Navigation
        </div>
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium transition-all duration-150 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0047ba] dark:focus-visible:ring-white/50",
                  isActive
                    ? "bg-[#18181b] text-[#fafafa] font-bold border-2 border-[#0047ba] dark:border-[#3f3f46] shadow-sm"
                    : "text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#18181b] border border-transparent hover:border-[#27272a]/60"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-150",
                      isActive
                        ? "text-[#fafafa] scale-105 opacity-100"
                        : "text-[#a1a1aa] opacity-75 group-hover:opacity-100 group-hover:text-[#fafafa] group-hover:scale-105"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate font-semibold tracking-wide">{item.label}</span>
                  {item.id === "demo" && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 ml-auto mr-1 font-semibold uppercase">
                      JUDGE
                    </span>
                  )}
                </div>

                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#0047ba] dark:bg-white shrink-0 shadow-xs" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Quest Status Card (Bottom sidebar widget) */}
      <div className="p-3 mt-auto border-t border-[#27272a]">
        <div
          className={cn(
            "p-3.5 bg-[#18181b] border border-[#27272a] rounded-xl space-y-2.5 transition-all",
            mainQuest && "border-[#0047ba]/40 dark:border-white/30"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Target className="w-3 h-3 text-[#71717a]" />
              <span className="text-[10px] font-bold text-[#71717a] uppercase tracking-widest font-mono">
                MAIN QUEST
              </span>
            </div>
            {mainQuest ? (
              <span className="text-[10px] font-mono font-bold text-[#fafafa]">
                {progress}%
              </span>
            ) : (
              <StatusBadge status="idle" label="IDLE" size="sm" />
            )}
          </div>

          {mainQuest ? (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#fafafa] line-clamp-1">
                {mainQuest.title}
              </p>
              {nextAction ? (
                <p className="text-[11px] text-[#a1a1aa] line-clamp-1">
                  <span className="text-[#71717a]">Next: </span>
                  {nextAction}
                </p>
              ) : (
                <p className="text-[11px] text-[#71717a]">
                  In progress
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#fafafa]">
                No active quest
              </p>
              <p className="text-[11px] text-[#71717a] leading-tight">
                Pick something worth finishing.
              </p>
            </div>
          )}

          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] font-medium"
          >
            {mainQuest ? (
              <Link to={`/projects/${mainQuest.projectId}`} onClick={onItemClick}>
                Open
                <ChevronRight className="ml-1 h-3 w-3 text-[#71717a]" />
              </Link>
            ) : (
              <Link to="/projects" onClick={onItemClick}>
                Choose Quest
                <ChevronRight className="ml-1 h-3 w-3 text-[#71717a]" />
              </Link>
            )}
          </Button>
        </div>

        {/* Sidebar theme & status bar */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-[#71717a]">
          <span className="font-mono text-[10px]">THEME MODE</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
