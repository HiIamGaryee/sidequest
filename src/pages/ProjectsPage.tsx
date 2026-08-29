import * as React from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Sparkles,
  Archive,
  Target,
  Plus,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useQuests } from "@/hooks/useQuests";
import type { Project, CreateProjectInput } from "@/types/quest";

export function ProjectsPage() {
  const {
    projects,
    quests,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
    getMainQuest,
    getMainQuestProject,
    getQuestProgress,
    getQuestNextAction,
  } = useQuests();

  const [activeTab, setActiveTab] = React.useState<"active" | "archived">("active");
  const [showProjectForm, setShowProjectForm] = React.useState(false);
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create");
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);

  const activeProjects = projects.filter((p) => p.status === "active");
  const archivedProjects = projects.filter((p) => p.status === "archived");

  const currentMainQuest = getMainQuest();
  const mainQuestProject = getMainQuestProject();
  const mainQuestProgress = currentMainQuest ? getQuestProgress(currentMainQuest) : 0;
  const mainQuestNextAction = currentMainQuest ? getQuestNextAction(currentMainQuest) : undefined;

  const handleOpenCreate = () => {
    setFormMode("create");
    setEditingProject(null);
    setShowProjectForm(true);
  };

  const handleOpenEdit = (project: Project) => {
    setFormMode("edit");
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleFormSubmit = (data: CreateProjectInput) => {
    if (formMode === "create") {
      createProject(data);
    } else if (editingProject) {
      updateProject(editingProject.id, data);
    }
  };

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="Projects"
          description="Organize the big things before they become emotional damage."
          badge={
            <StatusBadge
              status="active"
              label={`${activeProjects.length} ACTIVE`}
            />
          }
          actions={
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="font-bold text-xs cursor-pointer shadow-xs"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Project
            </Button>
          }
        />

        <div className="space-y-6">
          {/* Main Quest Priority Highlight Banner */}
          <SectionCard
            title="Main Quest Priority"
            description="The primary objective currently protected across your entire workspace."
            headerAction={
              currentMainQuest ? (
                <StatusBadge status="focus" label="LOCKED FOCUS" size="sm" />
              ) : (
                <StatusBadge status="idle" label="NO ACTIVE QUEST" size="sm" />
              )
            }
          >
            {currentMainQuest ? (
              <div className="p-4 bg-[#09090b] border border-white/20 rounded-xl space-y-3 relative overflow-hidden shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-0.5 rounded shadow-xs">
                        ACTIVE MAIN QUEST
                      </span>
                      {mainQuestProject && (
                        <span className="text-xs text-[#a1a1aa] font-medium">
                          in {mainQuestProject.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-[#fafafa] tracking-tight">
                      {currentMainQuest.title}
                    </h3>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-[#27272a] bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] text-xs font-medium shrink-0"
                  >
                    <Link to={`/projects/${currentMainQuest.projectId}`}>
                      <span>Open Quest</span>
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#a1a1aa]" />
                    </Link>
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1 border-t border-[#27272a]">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#71717a]">Quest Progress</span>
                    <span className="text-[#fafafa] font-semibold">
                      {mainQuestProgress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-300"
                      style={{ width: `${mainQuestProgress}%` }}
                    />
                  </div>
                </div>

                {mainQuestNextAction && (
                  <div className="flex items-center gap-2 text-xs text-[#a1a1aa] pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
                    <span className="text-[11px] text-[#71717a]">Next action:</span>
                    <span className="text-[11px] text-[#fafafa] font-medium truncate">
                      {mainQuestNextAction}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Target}
                badgeText="Main Quest Slot"
                title="No active quest selected"
                description="Promote a project objective to your Main Quest to shield it from side quests and distractions."
                action={
                  activeProjects.length > 0 ? (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-[#27272a] text-xs mt-2 text-[#fafafa]"
                    >
                      <Link to={`/projects/${activeProjects[0].id}`}>
                        Browse Quests
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </SectionCard>

          {/* Filter Tabs between Active & Archived */}
          <div className="flex items-center justify-between gap-3 pt-2 pb-1 border-b border-[#27272a]/60">
            <div className="flex items-center gap-1.5 p-1 bg-[#18181b] border border-[#27272a] rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                  activeTab === "active"
                    ? "bg-white text-black font-bold shadow-xs"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                Active ({activeProjects.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("archived")}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                  activeTab === "archived"
                    ? "bg-white text-black font-bold shadow-xs"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                Archived ({archivedProjects.length})
              </button>
            </div>

            <Button
              onClick={handleOpenCreate}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-[#27272a] hover:bg-[#18181b] text-[#a1a1aa] hover:text-white"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Project
            </Button>
          </div>

          {/* Project List / Grid */}
          <div>
            {activeTab === "active" ? (
              activeProjects.length === 0 ? (
                <EmptyState
                  icon={FolderKanban}
                  badgeText="Queue Empty"
                  title="No projects yet."
                  description="Give the chaos somewhere to live."
                  action={
                    <Button
                      onClick={handleOpenCreate}
                      size="sm"
                      className="font-bold text-xs mt-2"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create Project
                    </Button>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {activeProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        quests={quests}
                        onEdit={handleOpenEdit}
                        onArchive={archiveProject}
                        onRestore={restoreProject}
                        onDelete={deleteProject}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )
            ) : archivedProjects.length === 0 ? (
              <EmptyState
                icon={Archive}
                badgeText="Archive Clean"
                title="Nothing archived."
                description="Apparently you keep everything alive."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {archivedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      quests={quests}
                      onEdit={handleOpenEdit}
                      onArchive={archiveProject}
                      onRestore={restoreProject}
                      onDelete={deleteProject}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Project Creation / Edit Dialog */}
      <ProjectForm
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        mode={formMode}
        initialData={editingProject}
        onSubmit={handleFormSubmit}
      />
    </AnimatedPage>
  );
}
