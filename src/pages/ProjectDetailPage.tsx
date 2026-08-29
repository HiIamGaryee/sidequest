import * as React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Target,
  Sparkles,
  FolderKanban,
  CheckCircle2,
  Filter,
  Swords,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { QuestCard } from "@/components/projects/QuestCard";
import { QuestForm } from "@/components/projects/QuestForm";
import { SaveBeforeSwitchDialog } from "@/components/context/SaveBeforeSwitchDialog";
import { BossBattleView } from "@/components/boss/BossBattleView";
import { useBossContext } from "@/stores/BossContext";
import { useQuests } from "@/hooks/useQuests";
import { calculateProjectProgress, sortQuests } from "@/lib/quest-utils";
import type { Quest, CreateQuestInput, UpdateQuestInput } from "@/types/quest";

type FilterTab = "all" | "active" | "completed" | "high-priority";

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const {
    getProject,
    getProjectQuests,
    getProjectProgress,
    activeMainQuestId,
    getMainQuest,
    createQuest,
    updateQuest,
    deleteQuest,
    moveQuest,
    setMainQuest,
    completeQuest,
    updateQuestProgress,
  } = useQuests();

  const [activeFilter, setActiveFilter] = React.useState<FilterTab>("all");
  const [showQuestForm, setShowQuestForm] = React.useState(false);
  const [questFormMode, setQuestFormMode] = React.useState<"create" | "edit">("create");
  const [editingQuest, setEditingQuest] = React.useState<Quest | null>(null);
  const [switchingToQuest, setSwitchingToQuest] = React.useState<Quest | null>(null);

  const { bossConfigs, toggleBossMode } = useBossContext();
  const bossActive = projectId ? Boolean(bossConfigs[projectId]?.enabled) : false;

  const project = projectId ? getProject(projectId) : undefined;
  const projectQuests = projectId ? getProjectQuests(projectId) : [];

  const progress = projectId ? getProjectProgress(projectId) : 0;
  const totalCount = projectQuests.length;
  const completedCount = projectQuests.filter((q) => q.status === "completed").length;

  // Filter quests
  const filteredQuests = React.useMemo(() => {
    return projectQuests.filter((quest) => {
      if (activeFilter === "active") return quest.status !== "completed";
      if (activeFilter === "completed") return quest.status === "completed";
      if (activeFilter === "high-priority") return quest.priority === "high";
      return true;
    });
  }, [projectQuests, activeFilter]);

  const sortedQuests = React.useMemo(() => {
    return sortQuests(filteredQuests, activeMainQuestId);
  }, [filteredQuests, activeMainQuestId]);

  if (!project) {
    return (
      <AnimatedPage>
        <PageContainer maxWidth="2xl">
          <div className="py-12 text-center space-y-4">
            <p className="text-sm text-[#a1a1aa]">Project not found or was removed.</p>
            <Button asChild variant="outline" size="sm" className="border-[#27272a]">
              <Link to="/projects">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Return to Projects
              </Link>
            </Button>
          </div>
        </PageContainer>
      </AnimatedPage>
    );
  }

  const handleOpenCreateQuest = () => {
    setQuestFormMode("create");
    setEditingQuest(null);
    setShowQuestForm(true);
  };

  const handleOpenEditQuest = (quest: Quest) => {
    setQuestFormMode("edit");
    setEditingQuest(quest);
    setShowQuestForm(true);
  };

  const handleQuestFormSubmit = (data: CreateQuestInput | UpdateQuestInput) => {
    if (questFormMode === "create") {
      createQuest(data as CreateQuestInput);
    } else if (editingQuest) {
      updateQuest(editingQuest.id, data as UpdateQuestInput);
    }
  };

  const handleRequestSetMainQuest = (questId: string) => {
    const currentMain = getMainQuest();
    const targetQuest = projectQuests.find((q) => q.id === questId);

    // If there is an active main quest and it's not the same one and not 0% with no steps, offer save
    if (currentMain && currentMain.id !== questId && targetQuest) {
      setSwitchingToQuest(targetQuest);
    } else {
      setMainQuest(questId);
    }
  };

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between pb-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8 -ml-2 text-xs text-[#a1a1aa] hover:text-white hover:bg-[#18181b]"
          >
            <Link to="/projects">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              All Projects
            </Link>
          </Button>

          <StatusBadge
            status={project.status === "archived" ? "idle" : "active"}
            label={project.status === "archived" ? "ARCHIVED" : "PROJECT ACTIVE"}
            size="sm"
          />
        </div>

        {/* Project Header Info Card */}
        <div className="p-5 sm:p-6 bg-[#18181b] border border-[#27272a] rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center shrink-0 shadow-xs">
                  <FolderKanban className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#fafafa] truncate">
                  {project.name}
                </h1>
              </div>

              {project.description && (
                <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-xl pl-9">
                  {project.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleBossMode(project.id, !bossActive)}
                className="border-[#27272a] hover:border-rose-500/50 bg-[#18181b] text-xs font-semibold text-[#fafafa] cursor-pointer shadow-xs"
              >
                <Swords className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
                {bossActive ? "Standard View" : "Boss Battle Mode"}
              </Button>
              <Button
                onClick={handleOpenCreateQuest}
                size="sm"
                className="font-bold text-xs shrink-0 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Quest
              </Button>
            </div>
          </div>

          {/* Project Progress bar */}
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-[#71717a]">
                <span>Overall Progress</span>
                <span>•</span>
                <span className="text-[#a1a1aa] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                  {completedCount} of {totalCount} completed
                </span>
              </div>
              <span className="font-bold text-[#fafafa]">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {bossActive ? (
          <div className="pt-2">
            <BossBattleView
              projectId={project.id}
              onToggleStandardView={() => toggleBossMode(project.id, false)}
            />
          </div>
        ) : (
          <>
            {/* Filter Navigation Tabs */}
            <div className="flex items-center justify-between gap-3 pt-2 pb-1 border-b border-[#27272a]/60">
              <div className="flex items-center gap-1.5 p-1 bg-[#18181b] border border-[#27272a] rounded-lg">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "active", label: "Active" },
                    { id: "completed", label: "Completed" },
                    { id: "high-priority", label: "High Priority" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-white text-black font-bold shadow-xs"
                        : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-mono text-[#71717a]">
                {filteredQuests.length} {filteredQuests.length === 1 ? "Quest" : "Quests"}
              </span>
            </div>

            {/* Quest List */}
            <div className="space-y-4 pt-2">
              {totalCount === 0 ? (
                <EmptyState
                  icon={Target}
                  badgeText="Empty Quest Log"
                  title="No quests yet."
                  description="Break the project into something finishable."
                  action={
                    <Button
                      onClick={handleOpenCreateQuest}
                      size="sm"
                      className="font-bold text-xs mt-2"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Add Quest
                    </Button>
                  }
                />
              ) : filteredQuests.length === 0 ? (
                <EmptyState
                  icon={Filter}
                  badgeText="No Matches"
                  title="No quests found"
                  description={`No quests match the "${activeFilter}" filter.`}
                  action={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveFilter("all")}
                      className="border-[#27272a] text-xs mt-2"
                    >
                      Clear Filter
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {sortedQuests.map((quest, idx) => (
                      <QuestCard
                        key={quest.id}
                        quest={quest}
                        isMainQuest={quest.id === activeMainQuestId}
                        onSetMainQuest={handleRequestSetMainQuest}
                        onUpdateProgress={updateQuestProgress}
                        onComplete={completeQuest}
                        onEdit={handleOpenEditQuest}
                        onDelete={deleteQuest}
                        onMoveUp={
                          projectId && idx > 0
                            ? () => moveQuest(projectId, quest.id, "up")
                            : undefined
                        }
                        onMoveDown={
                          projectId && idx < sortedQuests.length - 1
                            ? () => moveQuest(projectId, quest.id, "down")
                            : undefined
                        }
                        canMoveUp={idx > 0}
                        canMoveDown={idx < sortedQuests.length - 1}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>

      {/* Create / Edit Quest Form Dialog */}
      <QuestForm
        open={showQuestForm}
        onOpenChange={setShowQuestForm}
        mode={questFormMode}
        projectId={project.id}
        initialData={editingQuest}
        onSubmit={handleQuestFormSubmit}
      />

      {/* Save Before Switch Dialog */}
      <SaveBeforeSwitchDialog
        open={Boolean(switchingToQuest)}
        onOpenChange={(open) => !open && setSwitchingToQuest(null)}
        targetQuest={switchingToQuest}
        onConfirmSwitch={(targetId) => setMainQuest(targetId)}
      />
    </AnimatedPage>
  );
}
