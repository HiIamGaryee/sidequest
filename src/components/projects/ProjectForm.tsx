import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Project, CreateProjectInput } from "@/types/quest";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: Project | null;
  onSubmit: (data: CreateProjectInput) => void;
}

export function ProjectForm({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: ProjectFormProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) {
      if (mode === "edit" && initialData) {
        setName(initialData.name);
        setDescription(initialData.description || "");
      } else {
        setName("");
        setDescription("");
      }
      setError("");
    }
  }, [open, mode, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#18181b] border-[#27272a] text-[#fafafa]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "New Project" : "Edit Project"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Give the chaos a single place to live."
                : "Update project information and scope."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-xs text-[#a1a1aa]">
                Project Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. WebMCP Hackathon"
                autoFocus
                className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b]"
              />
              {error && (
                <p className="text-[11px] text-red-400 font-mono">{error}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-desc" className="text-xs text-[#a1a1aa]">
                Description <span className="text-[10px] text-[#71717a] font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="project-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state what must be accomplished..."
                rows={3}
                className="bg-[#09090b] border-[#27272a] text-xs text-[#fafafa] placeholder:text-[#52525b] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#27272a] text-[#a1a1aa] hover:bg-[#27272a] text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="font-bold text-xs cursor-pointer"
            >
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
