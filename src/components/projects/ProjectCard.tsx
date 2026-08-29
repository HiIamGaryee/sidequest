import * as React from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  MoreVertical,
  ArrowRight,
  Archive,
  RotateCcw,
  Trash2,
  Edit2,
  CheckCircle2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuests } from "@/hooks/useQuests";
import type { Project, Quest } from "@/types/quest";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  quests: Quest[];
  onEdit: (project: Project) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ProjectCard({
  project,
  quests,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  className,
}: ProjectCardProps) {
  const { getProjectProgress } = useQuests();
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  const projectQuests = quests.filter((q) => q.projectId === project.id);
  const totalQuests = projectQuests.length;
  const completedQuests = projectQuests.filter((q) => q.status === "completed").length;
  const progress = getProjectProgress(project.id);
  const isArchived = project.status === "archived";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className={cn("h-full", className)}
      >
        <Card
          className={cn(
            "h-full border-[#27272a] bg-[#18181b] rounded-xl flex flex-col justify-between transition-all duration-200 hover:border-[#3f3f46] relative overflow-hidden",
            isArchived && "opacity-75 bg-[#141417] border-[#222226]"
          )}
        >
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                      isArchived
                        ? "bg-[#27272a] text-[#71717a]"
                        : "bg-white text-black"
                    )}
                  >
                    <FolderKanban className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-semibold text-sm text-[#fafafa] truncate tracking-tight">
                    {project.name}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge
                    status={isArchived ? "idle" : progress === 100 ? "complete" : "active"}
                    label={isArchived ? "ARCHIVED" : progress === 100 ? "COMPLETED" : "ACTIVE"}
                    size="sm"
                  />

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        className="h-7 w-7 text-[#71717a] hover:text-[#fafafa] hover:bg-[#27272a]"
                        aria-label="Project options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-[#18181b] border-[#27272a] text-[#fafafa] min-w-[150px]"
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/projects/${project.id}`}
                          className="cursor-pointer text-xs flex items-center"
                        >
                          <FolderKanban className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                          Open Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onEdit(project)}
                        className="cursor-pointer text-xs flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-2 text-[#a1a1aa]" />
                        Edit Project
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#27272a]" />
                      {isArchived ? (
                        <DropdownMenuItem
                          onClick={() => onRestore(project.id)}
                          className="cursor-pointer text-xs flex items-center text-[#22c55e] focus:text-[#22c55e]"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-2" />
                          Restore Project
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => onArchive(project.id)}
                          className="cursor-pointer text-xs flex items-center text-[#a1a1aa]"
                        >
                          <Archive className="w-3.5 h-3.5 mr-2" />
                          Archive Project
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setShowDeleteDialog(true)}
                        className="cursor-pointer text-xs flex items-center text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-[#a1a1aa] line-clamp-2 min-h-[32px] leading-relaxed">
                {project.description || "No description provided."}
              </p>

              {/* Quest stats & Progress */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#71717a]">
                    <span>{totalQuests} {totalQuests === 1 ? "quest" : "quests"}</span>
                    <span>•</span>
                    <span className="text-[#a1a1aa] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
                      {completedQuests} done
                    </span>
                  </div>
                  <span className="font-semibold text-[#fafafa]">{progress}%</span>
                </div>

                <div className="w-full h-1.5 bg-[#09090b] border border-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer Action Button */}
            <div className="pt-3 border-t border-[#27272a]/60">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full text-xs h-8 border-[#27272a] bg-[#09090b] hover:bg-[#27272a] text-[#fafafa] font-medium justify-between group"
              >
                <Link to={`/projects/${project.id}`}>
                  <span>Open Project</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#71717a] group-hover:text-white transition-colors" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#18181b] border-[#27272a] text-[#fafafa]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-[#a1a1aa]">
              All {totalQuests} {totalQuests === 1 ? "quest" : "quests"} inside "{project.name}" will also be permanently removed. If one was active as your Main Quest, it will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(project.id)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
