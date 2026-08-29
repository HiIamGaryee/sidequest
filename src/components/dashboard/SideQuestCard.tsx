import * as React from "react";
import {
  Inbox,
  ShieldAlert,
  Plus,
  ArrowUpRight,
  Archive,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSideQuests } from "@/hooks/useSideQuests";
import { QuickCaptureSideQuest } from "@/components/side-quests/QuickCaptureSideQuest";
import { ParkingLotDialog } from "@/components/side-quests/ParkingLotDialog";
import { PromoteSideQuestDialog } from "@/components/side-quests/PromoteSideQuestDialog";
import { achievementImages } from "@/config/achievementBadges";
import { formatCapturedTime } from "@/lib/side-quest-utils";
import type { SideQuest } from "@/types/side-quest";
import { cn } from "@/lib/utils";
import { useAgentHighlight } from "@/webmcp/agent-highlight-store";

export interface SideQuestCardProps {
  className?: string;
}

export function SideQuestCard({ className }: SideQuestCardProps) {
  const { isHighlighted, lastActionSummary } = useAgentHighlight("parking-lot");
  const { parkedSideQuests, parkedCount, dismissSideQuest } = useSideQuests();
  const [showQuickCapture, setShowQuickCapture] = React.useState(false);
  const [showParkingLot, setShowParkingLot] = React.useState(false);
  const [promotingSideQuest, setPromotingSideQuest] = React.useState<SideQuest | null>(null);

  const previewItems = parkedSideQuests.slice(0, 3);

  return (
    <>
      <Card
        id="side-quest-card"
        className={cn(
          "border-[#27272a] bg-[#18181b] rounded-xl select-none transition-all duration-300 hover:border-[#3f3f46] flex flex-col justify-between overflow-hidden relative",
          isHighlighted && "ring-2 ring-purple-400 border-purple-400/80 shadow-md shadow-purple-500/20",
          className
        )}
      >
        {/* Agent Update Highlight Ribbon */}
        {isHighlighted && (
          <div className="bg-purple-500/20 border-b border-purple-500/40 px-4 py-1.5 text-xs font-mono text-purple-300 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="font-bold">PARKING LOT UPDATED:</span>
            <span className="truncate">{lastActionSummary || "Side quest captured by WebMCP"}</span>
          </div>
        )}

        <CardContent className="p-5 sm:p-6 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#09090b] border border-purple-500/30 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src={achievementImages.parkingLotEmblem}
                    alt="Side Quests"
                    className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h4 className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#fafafa] uppercase">
                  SIDE QUESTS
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a] text-[#a1a1aa] font-semibold">
                  PARKING LOT
                </span>
              </div>
            </div>

            {/* Parking Status & Summary */}
            <div className="p-3.5 bg-[#09090b] border border-[#27272a] rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#fafafa]">
                    {parkedCount === 0
                      ? "0 parked"
                      : `${parkedCount} idea${parkedCount === 1 ? "" : "s"} parked`}
                  </span>
                  {parkedCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      Off-mind
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickCapture(true)}
                  className="h-6 px-2 text-[11px] font-mono font-semibold text-[#a1a1aa] hover:text-white hover:bg-[#18181b] border border-[#27272a]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Park Idea
                </Button>
              </div>

              {parkedCount === 0 ? (
                <p className="text-xs text-[#71717a] leading-relaxed">
                  Random ideas are safe here. They don't need to hijack the current quest while you're in flow.
                </p>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {previewItems.map((sq) => (
                    <div
                      key={sq.id}
                      className="group/item flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-[#18181b] border border-[#27272a] text-xs hover:border-[#3f3f46] transition-all"
                    >
                      <span className="truncate text-white/90 font-medium text-xs">
                        {sq.title}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPromotingSideQuest(sq)}
                          className="text-[10px] font-mono text-[#a1a1aa] hover:text-white hover:bg-[#27272a] px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                          title="Promote to quest"
                        >
                          Promote
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissSideQuest(sq.id)}
                          className="text-[#71717a] hover:text-white p-0.5"
                          title="Dismiss"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {parkedCount > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowParkingLot(true)}
                      className="text-[11px] font-mono text-[#a1a1aa] hover:text-white pt-1 w-full text-center hover:underline cursor-pointer"
                    >
                      + {parkedCount - 3} more parked in lot
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer info & View All button */}
          <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-[11px] text-[#71717a]">
            <span className="flex items-center gap-1.5 font-mono">
              <img
                src={achievementImages.parkingLotEmblem}
                alt="Shield"
                className="w-3.5 h-3.5 object-contain"
                referrerPolicy="no-referrer"
              />
              Distraction Shield: Active
            </span>

            <button
              type="button"
              onClick={() => setShowParkingLot(true)}
              className="text-[10px] font-mono text-[#a1a1aa] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Lot</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </CardContent>
      </Card>

      <QuickCaptureSideQuest
        open={showQuickCapture}
        onOpenChange={setShowQuickCapture}
      />

      <ParkingLotDialog
        open={showParkingLot}
        onOpenChange={setShowParkingLot}
      />

      <PromoteSideQuestDialog
        sideQuest={promotingSideQuest}
        open={Boolean(promotingSideQuest)}
        onOpenChange={(open) => !open && setPromotingSideQuest(null)}
      />
    </>
  );
}
