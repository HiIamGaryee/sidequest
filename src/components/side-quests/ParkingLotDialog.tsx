import * as React from "react";
import {
  Inbox,
  Plus,
  ArrowUpRight,
  Archive,
  Trash2,
  Filter,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SideQuestItem } from "@/components/side-quests/SideQuestItem";
import { PromoteSideQuestDialog } from "@/components/side-quests/PromoteSideQuestDialog";
import { useSideQuests } from "@/hooks/useSideQuests";
import type { SideQuest, SideQuestStatus } from "@/types/side-quest";

interface ParkingLotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParkingLotDialog({ open, onOpenChange }: ParkingLotDialogProps) {
  const {
    sideQuests,
    captureSideQuest,
    dismissSideQuest,
    deleteSideQuest,
    restoreSideQuest,
  } = useSideQuests();

  const [activeTab, setActiveTab] = React.useState<SideQuestStatus>("parked");
  const [newTitle, setNewTitle] = React.useState("");
  const [promotingSideQuest, setPromotingSideQuest] = React.useState<SideQuest | null>(null);

  const parkedItems = sideQuests.filter((sq) => sq.status === "parked");
  const promotedItems = sideQuests.filter((sq) => sq.status === "promoted");
  const dismissedItems = sideQuests.filter((sq) => sq.status === "dismissed");

  const currentItems =
    activeTab === "parked"
      ? parkedItems
      : activeTab === "promoted"
      ? promotedItems
      : dismissedItems;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    captureSideQuest({ title: newTitle.trim() });
    setNewTitle("");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa] sm:max-w-xl p-0 overflow-hidden shadow-2xl">
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white text-black flex items-center justify-center">
                  <Inbox className="w-3.5 h-3.5" />
                </div>
                <DialogTitle className="text-xs font-mono font-bold tracking-[0.2em] text-[#a1a1aa] uppercase">
                  PARKING LOT
                </DialogTitle>
              </div>
              <span className="text-[10px] font-mono text-[#71717a] px-2 py-0.5 rounded bg-[#09090b] border border-[#27272a]">
                {parkedItems.length} ACTIVE
              </span>
            </div>

            {/* Quick add inline form */}
            <form onSubmit={handleQuickAdd} className="flex gap-2">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Capture a distracting thought..."
                className="bg-[#09090b] border-[#27272a] text-xs placeholder:text-[#52525b] focus-visible:ring-1 focus-visible:ring-white h-9"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newTitle.trim()}
                className="h-9 px-3 text-xs font-bold bg-white text-black hover:bg-[#e4e4e7] shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Park
              </Button>
            </form>

            {/* Tabs Filter */}
            <div className="flex items-center justify-between gap-2 border-b border-[#27272a] pb-2">
              <div className="flex items-center gap-1.5 bg-[#09090b] p-1 rounded-lg border border-[#27272a]">
                {(
                  [
                    { id: "parked", label: `Parked (${parkedItems.length})` },
                    { id: "promoted", label: `Promoted (${promotedItems.length})` },
                    { id: "dismissed", label: `Dismissed (${dismissedItems.length})` },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as SideQuestStatus)}
                    className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-white text-black font-bold"
                        : "text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {currentItems.length === 0 ? (
                <div className="py-8 text-center space-y-2 rounded-lg bg-[#09090b] border border-[#27272a]">
                  <Inbox className="w-6 h-6 text-[#52525b] mx-auto" />
                  <p className="text-xs text-[#a1a1aa]">
                    {activeTab === "parked"
                      ? "Nothing parked right now. Flow state secured."
                      : activeTab === "promoted"
                      ? "No promoted side quests yet."
                      : "No dismissed side quests."}
                  </p>
                </div>
              ) : (
                currentItems.map((sq) => (
                  <SideQuestItem
                    key={sq.id}
                    sideQuest={sq}
                    onPromote={(item) => setPromotingSideQuest(item)}
                    onDismiss={dismissSideQuest}
                    onDelete={deleteSideQuest}
                    onRestore={restoreSideQuest}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-[#27272a] text-[11px] text-[#71717a]">
              <span>Capture first, organize later</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs text-[#a1a1aa] hover:text-white"
              >
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Promote Dialog */}
      <PromoteSideQuestDialog
        sideQuest={promotingSideQuest}
        open={Boolean(promotingSideQuest)}
        onOpenChange={(open) => !open && setPromotingSideQuest(null)}
      />
    </>
  );
}
