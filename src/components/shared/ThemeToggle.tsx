import * as React from "react";
import { Sun, Moon, Laptop, Sparkles } from "lucide-react";
import { useTheme, type Theme } from "@/stores/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "segmented";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "icon",
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const maskId = React.useId().replace(/:/g, "_") + "_clipping";

  if (variant === "segmented") {
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
      {
        value: "light",
        label: "Light",
        icon: <Sun className="h-3.5 w-3.5 text-amber-500" />,
      },
      {
        value: "dark",
        label: "Dark",
        icon: <Moon className="h-3.5 w-3.5 text-sky-400" />,
      },
      {
        value: "system",
        label: "System",
        icon: <Laptop className="h-3.5 w-3.5" />,
      },
    ];

    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-lg bg-secondary/80 dark:bg-[#09090b] border border-border/80 dark:border-[#27272a] text-xs font-mono",
          className
        )}
      >
        {options.map((opt) => {
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isActive
                  ? "bg-card dark:bg-[#18181b] text-primary dark:text-[#fafafa] shadow-xs border border-border/90 dark:border-[#3f3f46] font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50 dark:hover:bg-[#18181b]/50"
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/70 dark:hover:bg-[#18181b] border border-transparent hover:border-border/60",
              className
            )}
          >
            {resolvedTheme === "dark" ? (
              <Moon className="h-4 w-4 text-sky-400" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
            {showLabel && (
              <span className="capitalize font-mono text-xs">{theme}</span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-card dark:bg-[#18181b] border-border dark:border-[#27272a] text-foreground dark:text-[#fafafa] min-w-[130px]"
        >
          <DropdownMenuItem
            onClick={() => setTheme("light")}
            className="flex items-center gap-2 text-xs cursor-pointer focus:bg-secondary dark:focus:bg-[#27272a]"
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            <span>Light Mode</span>
            {theme === "light" && (
              <span className="ml-auto text-[10px] text-primary font-mono">
                ✓
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("dark")}
            className="flex items-center gap-2 text-xs cursor-pointer focus:bg-secondary dark:focus:bg-[#27272a]"
          >
            <Moon className="h-3.5 w-3.5 text-sky-400" />
            <span>Dark Mode</span>
            {theme === "dark" && (
              <span className="ml-auto text-[10px] text-sky-400 font-mono">
                ✓
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme("system")}
            className="flex items-center gap-2 text-xs cursor-pointer focus:bg-secondary dark:focus:bg-[#27272a]"
          >
            <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
            <span>System</span>
            {theme === "system" && (
              <span className="ml-auto text-[10px] text-primary font-mono">
                ✓
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default: Animated Solar/Lunar Liquid Orb Toggle Button
  const isDark = resolvedTheme === "dark";

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              "group relative inline-flex items-center justify-center p-1 rounded-full cursor-pointer transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              isDark
                ? "focus-visible:ring-sky-400 hover:bg-sky-500/10"
                : "focus-visible:ring-amber-500 hover:bg-amber-500/10",
              className
            )}
            aria-label={`Toggle theme (currently ${resolvedTheme} mode)`}
          >
            {/* Animated Liquid Plasma Orb */}
            <div
              className={cn(
                "theme-orb-loader transition-transform duration-300 group-hover:scale-110",
                isDark && "is-dark"
              )}
            >
              {/* SVG Mask Definition */}
              <svg className="orb-svg" viewBox="0 0 100 100" aria-hidden="true">
                <defs>
                  <mask id={maskId}>
                    <polygon points="0,0 100,0 100,100 0,100" fill="black" />
                    <g className="clipping-mask-g">
                      <polygon points="25,25 75,25 50,75" fill="white" />
                      <polygon points="50,25 75,75 25,75" fill="white" />
                      <polygon points="35,35 65,35 50,65" fill="white" />
                      <polygon points="35,35 65,35 50,65" fill="white" />
                      <polygon points="35,35 65,35 50,65" fill="white" />
                      <polygon points="35,35 65,35 50,65" fill="white" />
                      <polygon points="35,35 65,35 50,65" fill="white" />
                    </g>
                  </mask>
                </defs>
              </svg>

              {/* Masked Rotating Liquid Gradient */}
              <div
                className="box"
                style={{
                  mask: `url(#${maskId})`,
                  WebkitMask: `url(#${maskId})`,
                }}
              />

              {/* Center Core: Celestial Sun / Moon Icon with Subtle Glass Backdrop */}
              <div className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center bg-black/25 dark:bg-black/40 backdrop-blur-xs transition-all duration-300 shadow-inner">
                {isDark ? (
                  <Moon className="w-3 h-3 text-sky-200 transition-transform duration-300 group-hover:-rotate-12 drop-shadow-xs" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-200 transition-transform duration-300 group-hover:rotate-45 drop-shadow-xs" />
                )}
              </div>
            </div>

            <span className="sr-only">Toggle theme</span>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-card dark:bg-[#18181b] border-border dark:border-[#27272a] text-foreground dark:text-[#fafafa] text-xs font-mono shadow-md"
        >
          <div className="flex items-center gap-1.5">
            {isDark ? (
              <Sun className="w-3 h-3 text-amber-500" />
            ) : (
              <Moon className="w-3 h-3 text-sky-400" />
            )}
            <span>Switch to {isDark ? "Light" : "Dark"} Mode</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
