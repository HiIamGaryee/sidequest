export type SideQuestStatus = "parked" | "promoted" | "dismissed";

export interface SideQuest {
  id: string;
  title: string;
  status: SideQuestStatus;
  createdAt: string;
  sourceQuestId?: string;
  promotedQuestId?: string;
}

export interface CaptureSideQuestInput {
  title: string;
  sourceQuestId?: string;
}

export interface UpdateSideQuestInput {
  title?: string;
  status?: SideQuestStatus;
  sourceQuestId?: string;
  promotedQuestId?: string;
}

export interface PromoteSideQuestInput {
  sideQuestId: string;
  projectId: string;
  priority?: "low" | "medium" | "high";
}
