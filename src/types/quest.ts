export type ProjectStatus = "active" | "archived";

export type QuestStatus = "todo" | "active" | "completed";

export type QuestPriority = "low" | "medium" | "high";

export type QuestStepStatus = "todo" | "completed";

export interface QuestStep {
  id: string;
  questId: string;
  title: string;
  status: QuestStepStatus;
  order: number;
  createdAt: string;
  completedAt?: string;
  isTiny?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface Quest {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: QuestStatus;
  priority: QuestPriority;
  progress: number;
  nextAction?: string;
  estimatedMinutes?: number;
  blocker?: string;
  order?: number;
  createdAt: string;
  completedAt?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface CreateQuestInput {
  projectId: string;
  title: string;
  description?: string;
  priority?: QuestPriority;
  estimatedMinutes?: number;
  nextAction?: string;
  blocker?: string;
  order?: number;
}

export interface UpdateQuestInput {
  title?: string;
  description?: string;
  priority?: QuestPriority;
  estimatedMinutes?: number;
  nextAction?: string;
  blocker?: string;
  progress?: number;
  status?: QuestStatus;
  order?: number;
}

export interface CreateQuestStepInput {
  questId: string;
  title: string;
  isTiny?: boolean;
}

export interface UpdateQuestStepInput {
  title?: string;
  status?: QuestStepStatus;
  order?: number;
  isTiny?: boolean;
}

