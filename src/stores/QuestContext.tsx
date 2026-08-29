import * as React from "react";
import type {
  Project,
  Quest,
  QuestStep,
  CreateProjectInput,
  UpdateProjectInput,
  CreateQuestInput,
  UpdateQuestInput,
  CreateQuestStepInput,
  UpdateQuestStepInput,
} from "@/types/quest";
import {
  getQuestSteps as filterAndSortQuestSteps,
  getQuestNextAction as deriveQuestNextAction,
  calculateQuestProgress as deriveQuestProgress,
  calculateProjectProgress as deriveProjectProgress,
  normalizeStepOrder,
} from "@/lib/quest-utils";
import { useGamificationContext } from "./GamificationContext";
import { usePersistence } from "./PersistenceContext";

export interface QuestContextValue {
  projects: Project[];
  quests: Quest[];
  questSteps: QuestStep[];
  activeMainQuestId: string | null;
  // Project actions
  createProject: (input: CreateProjectInput) => Project;
  updateProject: (id: string, input: UpdateProjectInput) => void;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;
  restoreProject: (id: string) => void;
  // Quest actions
  createQuest: (input: CreateQuestInput) => Quest;
  updateQuest: (id: string, input: UpdateQuestInput) => void;
  deleteQuest: (id: string) => void;
  moveQuest: (projectId: string, questId: string, direction: "up" | "down") => void;
  reorderQuests: (projectId: string, questIdsInOrder: string[]) => void;
  setMainQuest: (id: string | null) => void;
  completeQuest: (id: string) => void;
  updateQuestProgress: (id: string, progress: number) => void;
  setQuestBlocker: (id: string, blocker?: string) => void;
  // Step actions
  createQuestStep: (input: CreateQuestStepInput) => QuestStep;
  updateQuestStep: (id: string, input: UpdateQuestStepInput) => void;
  deleteQuestStep: (id: string) => void;
  completeQuestStep: (id: string) => void;
  reopenQuestStep: (id: string) => void;
  reorderQuestSteps: (questId: string, stepIdsInOrder: string[]) => void;
  moveQuestStep: (id: string, direction: "up" | "down") => void;
  makeStepSmaller: (questId: string, currentStepId: string, tinyStepTitle: string) => QuestStep;
  skipQuestStep: (questId: string, stepId: string) => void;
  // Selectors & derived helpers
  getMainQuest: () => Quest | null;
  getMainQuestProject: () => Project | null;
  getProject: (id: string) => Project | undefined;
  getProjectQuests: (projectId: string) => Quest[];
  getQuestSteps: (questId: string) => QuestStep[];
  getQuestNextAction: (quest: Quest) => string | undefined;
  getQuestProgress: (quest: Quest) => number;
  getProjectProgress: (projectId: string) => number;
}

const QuestContext = React.createContext<QuestContextValue | null>(null);

// Initial in-memory development seed data (not persisted to localStorage)
const INITIAL_PROJECT_ID = "proj-webmcp-hackathon";
const INITIAL_QUEST_ID_1 = "quest-ui-foundation";
const INITIAL_QUEST_ID_2 = "quest-main-quest-system";
const INITIAL_QUEST_ID_3 = "quest-webmcp-tools";
const INITIAL_QUEST_ID_4 = "quest-demo-video";

const INITIAL_PROJECTS: Project[] = [
  {
    id: INITIAL_PROJECT_ID,
    name: "WebMCP Hackathon",
    description: "Build and submit the SideQuest project with single-objective focus mechanics.",
    status: "active",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const INITIAL_QUESTS: Quest[] = [
  {
    id: INITIAL_QUEST_ID_1,
    projectId: INITIAL_PROJECT_ID,
    title: "Build UI Foundation",
    description: "Establish Tailwind dark HUD layout and component architecture.",
    status: "completed",
    priority: "high",
    progress: 100,
    nextAction: "Review design consistency across viewports.",
    estimatedMinutes: 30,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: INITIAL_QUEST_ID_2,
    projectId: INITIAL_PROJECT_ID,
    title: "Build Main Quest System",
    description: "Deliver interactive project/quest management with strict single-main-quest enforcement.",
    status: "active",
    priority: "high",
    progress: 50,
    nextAction: "Break down into micro-steps for task execution.",
    estimatedMinutes: 25,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: INITIAL_QUEST_ID_3,
    projectId: INITIAL_PROJECT_ID,
    title: "Add WebMCP Tools",
    description: "Register assistive browser protocol handlers for context tracking.",
    status: "todo",
    priority: "high",
    progress: 0,
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: INITIAL_QUEST_ID_4,
    projectId: INITIAL_PROJECT_ID,
    title: "Record Demo Video",
    description: "Showcase anti-distraction loops and single-objective workflow.",
    status: "todo",
    priority: "medium",
    progress: 0,
    nextAction: "Outline 2-minute walkthrough script.",
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

const INITIAL_STEPS: QuestStep[] = [
  // Steps for INITIAL_QUEST_ID_1 (Build UI Foundation) - All completed
  {
    id: "step-1-1",
    questId: INITIAL_QUEST_ID_1,
    title: "Configure Tailwind HUD themes & color tokens",
    status: "completed",
    order: 1,
    createdAt: new Date(Date.now() - 3600000 * 11).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 9).toISOString(),
  },
  {
    id: "step-1-2",
    questId: INITIAL_QUEST_ID_1,
    title: "Implement responsive AppLayout shell & navigation",
    status: "completed",
    order: 2,
    createdAt: new Date(Date.now() - 3600000 * 9).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: "step-1-3",
    questId: INITIAL_QUEST_ID_1,
    title: "Verify mobile/tablet viewport responsiveness",
    status: "completed",
    order: 3,
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },

  // Steps for INITIAL_QUEST_ID_2 (Build Main Quest System) - In progress
  {
    id: "step-2-1",
    questId: INITIAL_QUEST_ID_2,
    title: "Design Project & Quest data types",
    status: "completed",
    order: 1,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "step-2-2",
    questId: INITIAL_QUEST_ID_2,
    title: "Build global state provider with activeMainQuestId rule",
    status: "completed",
    order: 2,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "step-2-3",
    questId: INITIAL_QUEST_ID_2,
    title: "Implement QuestStep model and derived Next Action",
    status: "todo",
    order: 3,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "step-2-4",
    questId: INITIAL_QUEST_ID_2,
    title: "Build Unstuck Mode with Make Smaller and Park Blocker",
    status: "todo",
    order: 4,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },

  // Steps for INITIAL_QUEST_ID_3 (Add WebMCP Tools) - Todo breakdown
  {
    id: "step-3-1",
    questId: INITIAL_QUEST_ID_3,
    title: "Read WebMCP docs and specifications",
    status: "todo",
    order: 1,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "step-3-2",
    questId: INITIAL_QUEST_ID_3,
    title: "Register first WebMCP tool handler in navigator",
    status: "todo",
    order: 2,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "step-3-3",
    questId: INITIAL_QUEST_ID_3,
    title: "Test getTools() contract schema output",
    status: "todo",
    order: 3,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "step-3-4",
    questId: INITIAL_QUEST_ID_3,
    title: "Connect tool calls to React state dispatcher",
    status: "todo",
    order: 4,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "step-3-5",
    questId: INITIAL_QUEST_ID_3,
    title: "Test tool execution inside browser environment",
    status: "todo",
    order: 5,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export function QuestProvider({ children }: { children: React.ReactNode }) {
  const { awardXp, incrementCombo, evaluateAchievements } = useGamificationContext();
  const { initialState, saveSnapshot, isHydrated } = usePersistence();

  const [projects, setProjects] = React.useState<Project[]>(() => initialState.projects);
  const [quests, setQuests] = React.useState<Quest[]>(() => initialState.quests);
  const [questSteps, setQuestSteps] = React.useState<QuestStep[]>(() => initialState.questSteps);
  const [activeMainQuestId, setActiveMainQuestId] = React.useState<string | null>(
    () => initialState.activeMainQuestId
  );

  // Sync state if initialState changes (e.g. on Demo load or Import)
  React.useEffect(() => {
    if (isHydrated) {
      setProjects(initialState.projects);
      setQuests(initialState.quests);
      setQuestSteps(initialState.questSteps);
      // Validate activeMainQuestId exists
      const validMainQuestId =
        initialState.activeMainQuestId &&
        initialState.quests.some((q) => q.id === initialState.activeMainQuestId)
          ? initialState.activeMainQuestId
          : null;
      setActiveMainQuestId(validMainQuestId);
    }
  }, [initialState, isHydrated]);

  // Persist changes whenever quest data changes
  const isInitialMount = React.useRef(true);
  React.useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isHydrated) {
      saveSnapshot({
        projects,
        quests,
        questSteps,
        activeMainQuestId,
      });
    }
  }, [projects, quests, questSteps, activeMainQuestId, isHydrated, saveSnapshot]);

  // Keep achievement evaluation synced with quest completion metrics
  React.useEffect(() => {
    const completedQuestsCount = quests.filter((q) => q.status === "completed").length;
    const completedTinyStepsCount = questSteps.filter(
      (s) => s.status === "completed" && s.isTiny
    ).length;
    evaluateAchievements({
      completedQuestsCount,
      completedTinyStepsCount,
    });
  }, [quests, questSteps, evaluateAchievements]);

  // --- Projects ---

  const createProject = React.useCallback((input: CreateProjectInput): Project => {
    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: input.name.trim(),
      description: input.description?.trim() || undefined,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = React.useCallback((id: string, input: UpdateProjectInput) => {
    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== id) return proj;
        return {
          ...proj,
          name: input.name !== undefined ? input.name.trim() : proj.name,
          description:
            input.description !== undefined ? input.description.trim() || undefined : proj.description,
          status: input.status !== undefined ? input.status : proj.status,
        };
      })
    );
  }, []);

  const deleteProject = React.useCallback((id: string) => {
    // 1. Gather all quest IDs belonging to this project
    let deletedQuestIds: string[] = [];
    setQuests((prevQuests) => {
      const remaining: Quest[] = [];
      for (const q of prevQuests) {
        if (q.projectId === id) {
          deletedQuestIds.push(q.id);
        } else {
          remaining.push(q);
        }
      }
      return remaining;
    });

    // 2. Clear activeMainQuestId if it was in this project
    setActiveMainQuestId((currentId) => {
      if (currentId && deletedQuestIds.includes(currentId)) {
        return null;
      }
      return currentId;
    });

    // 3. Remove all steps for deleted quests
    setQuestSteps((prevSteps) =>
      prevSteps.filter((s) => !deletedQuestIds.includes(s.questId))
    );

    // 4. Remove project
    setProjects((prev) => prev.filter((proj) => proj.id !== id));
  }, []);

  const archiveProject = React.useCallback((id: string) => {
    setQuests((prevQuests) => {
      const projectQuestIds = new Set(
        prevQuests.filter((q) => q.projectId === id).map((q) => q.id)
      );

      setActiveMainQuestId((currentId) => {
        if (currentId && projectQuestIds.has(currentId)) {
          return null;
        }
        return currentId;
      });

      return prevQuests;
    });

    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, status: "archived" } : proj))
    );
  }, []);

  const restoreProject = React.useCallback((id: string) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === id ? { ...proj, status: "active" } : proj))
    );
  }, []);

  // --- Quests ---

  const normalizeQuestOrder = (questList: Quest[]): Quest[] => {
    return questList.map((q, idx) => ({
      ...q,
      order: idx + 1,
    }));
  };

  const createQuest = React.useCallback(
    (input: CreateQuestInput): Quest => {
      const projectQuests = quests.filter((q) => q.projectId === input.projectId);
      const maxOrder = projectQuests.reduce((max, q) => Math.max(max, q.order ?? 0), 0);

      const newQuest: Quest = {
        id: `quest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        projectId: input.projectId,
        title: input.title.trim(),
        description: input.description?.trim() || undefined,
        status: "todo",
        priority: input.priority || "medium",
        progress: 0,
        nextAction: input.nextAction?.trim() || undefined,
        estimatedMinutes: input.estimatedMinutes || undefined,
        blocker: input.blocker?.trim() || undefined,
        order: input.order ?? maxOrder + 1,
        createdAt: new Date().toISOString(),
      };

      setQuests((prev) => [...prev, newQuest]);
      return newQuest;
    },
    [quests]
  );

  const updateQuest = React.useCallback((id: string, input: UpdateQuestInput) => {
    setQuests((prev) =>
      prev.map((quest) => {
        if (quest.id !== id) return quest;

        const updatedProgress =
          input.progress !== undefined
            ? Math.max(0, Math.min(100, input.progress))
            : quest.progress;

        return {
          ...quest,
          title: input.title !== undefined ? input.title.trim() : quest.title,
          description:
            input.description !== undefined
              ? input.description.trim() || undefined
              : quest.description,
          priority: input.priority !== undefined ? input.priority : quest.priority,
          estimatedMinutes:
            input.estimatedMinutes !== undefined
              ? input.estimatedMinutes
              : quest.estimatedMinutes,
          nextAction:
            input.nextAction !== undefined
              ? input.nextAction.trim() || undefined
              : quest.nextAction,
          blocker:
            input.blocker !== undefined
              ? input.blocker.trim() || undefined
              : quest.blocker,
          progress: updatedProgress,
          status: input.status !== undefined ? input.status : quest.status,
          order: input.order !== undefined ? input.order : quest.order,
        };
      })
    );
  }, []);

  const deleteQuest = React.useCallback((id: string) => {
    setActiveMainQuestId((currentId) => (currentId === id ? null : currentId));
    setQuests((prev) => prev.filter((quest) => quest.id !== id));
    // Clean up all related steps
    setQuestSteps((prev) => prev.filter((step) => step.questId !== id));
  }, []);

  const moveQuest = React.useCallback(
    (projectId: string, questId: string, direction: "up" | "down") => {
      setQuests((prev) => {
        const projectQuests = prev
          .filter((q) => q.projectId === projectId)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        const currentIndex = projectQuests.findIndex((q) => q.id === questId);
        if (currentIndex === -1) return prev;

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= projectQuests.length) return prev;

        const reordered = [...projectQuests];
        const temp = reordered[currentIndex];
        reordered[currentIndex] = reordered[targetIndex];
        reordered[targetIndex] = temp;

        const normalized = normalizeQuestOrder(reordered);
        const otherQuests = prev.filter((q) => q.projectId !== projectId);
        return [...otherQuests, ...normalized];
      });
    },
    []
  );

  const reorderQuests = React.useCallback(
    (projectId: string, questIdsInOrder: string[]) => {
      setQuests((prev) => {
        const projectQuests = prev.filter((q) => q.projectId === projectId);
        const otherQuests = prev.filter((q) => q.projectId !== projectId);

        const questMap = new Map(projectQuests.map((q) => [q.id, q]));
        const ordered: Quest[] = [];

        for (const id of questIdsInOrder) {
          const q = questMap.get(id);
          if (q) {
            ordered.push(q);
            questMap.delete(id);
          }
        }

        for (const remaining of questMap.values()) {
          ordered.push(remaining);
        }

        const normalized = normalizeQuestOrder(ordered);
        return [...otherQuests, ...normalized];
      });
    },
    []
  );

  const setMainQuest = React.useCallback((id: string | null) => {
    setActiveMainQuestId(id);
  }, []);

  const completeQuest = React.useCallback((id: string) => {
    const quest = quests.find((q) => q.id === id);
    const isAlreadyCompleted = quest?.status === "completed";
    const isMain = activeMainQuestId === id;

    if (!isAlreadyCompleted && quest) {
      if (isMain) {
        awardXp({
          type: "quest_completed",
          referenceId: id,
          label: quest.title,
        });
        awardXp({
          type: "main_quest_completed",
          referenceId: `main-${id}`,
          label: `Main Quest: ${quest.title}`,
        });
      } else {
        awardXp({
          type: "quest_completed",
          referenceId: id,
          label: quest.title,
        });
      }
      incrementCombo("quest_completed");
    }

    setActiveMainQuestId((currentId) => (currentId === id ? null : currentId));

    setQuests((prev) =>
      prev.map((quest) => {
        if (quest.id !== id) return quest;
        return {
          ...quest,
          status: "completed",
          progress: 100,
          completedAt: new Date().toISOString(),
        };
      })
    );
  }, [quests, activeMainQuestId, awardXp, incrementCombo]);

  const updateQuestProgress = React.useCallback((id: string, progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

    setQuests((prev) =>
      prev.map((quest) => {
        if (quest.id !== id) return quest;
        return {
          ...quest,
          progress: clampedProgress,
        };
      })
    );
  }, []);

  const setQuestBlocker = React.useCallback((id: string, blocker?: string) => {
    setQuests((prev) =>
      prev.map((quest) => {
        if (quest.id !== id) return quest;
        return {
          ...quest,
          blocker: blocker?.trim() ? blocker.trim() : undefined,
        };
      })
    );
  }, []);

  // --- Steps ---

  const createQuestStep = React.useCallback(
    (input: CreateQuestStepInput): QuestStep => {
      // Find current max order for this quest
      let maxOrder = 0;
      questSteps.forEach((s) => {
        if (s.questId === input.questId && s.order > maxOrder) {
          maxOrder = s.order;
        }
      });

      const newStep: QuestStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        questId: input.questId,
        title: input.title.trim(),
        status: "todo",
        order: maxOrder + 1,
        isTiny: input.isTiny || false,
        createdAt: new Date().toISOString(),
      };

      setQuestSteps((prev) => [...prev, newStep]);
      return newStep;
    },
    [questSteps]
  );

  const updateQuestStep = React.useCallback(
    (id: string, input: UpdateQuestStepInput) => {
      setQuestSteps((prev) =>
        prev.map((step) => {
          if (step.id !== id) return step;
          return {
            ...step,
            title: input.title !== undefined ? input.title.trim() : step.title,
            status: input.status !== undefined ? input.status : step.status,
            order: input.order !== undefined ? input.order : step.order,
            isTiny: input.isTiny !== undefined ? input.isTiny : step.isTiny,
            completedAt:
              input.status === "completed"
                ? step.completedAt || new Date().toISOString()
                : input.status === "todo"
                ? undefined
                : step.completedAt,
          };
        })
      );
    },
    []
  );

  const deleteQuestStep = React.useCallback((id: string) => {
    setQuestSteps((prev) => {
      const stepToDelete = prev.find((s) => s.id === id);
      if (!stepToDelete) return prev;

      const questId = stepToDelete.questId;
      const remainingForQuest = prev.filter(
        (s) => s.questId === questId && s.id !== id
      );
      const normalizedQuestSteps = normalizeStepOrder(remainingForQuest);

      return [
        ...prev.filter((s) => s.questId !== questId),
        ...normalizedQuestSteps,
      ];
    });
  }, []);

  const completeQuestStep = React.useCallback((id: string) => {
    const step = questSteps.find((s) => s.id === id);
    const isAlreadyCompleted = step?.status === "completed";

    if (!isAlreadyCompleted && step) {
      awardXp({
        type: "step_completed",
        referenceId: id,
        label: step.title.length > 30 ? step.title.slice(0, 30) + '...' : step.title,
      });
      incrementCombo("step_completed");
    }

    setQuestSteps((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: "completed",
          completedAt: new Date().toISOString(),
        };
      })
    );
  }, [questSteps, awardXp, incrementCombo]);

  const reopenQuestStep = React.useCallback((id: string) => {
    setQuestSteps((prev) =>
      prev.map((step) => {
        if (step.id !== id) return step;
        return {
          ...step,
          status: "todo",
          completedAt: undefined,
        };
      })
    );
  }, []);

  const reorderQuestSteps = React.useCallback(
    (questId: string, stepIdsInOrder: string[]) => {
      setQuestSteps((prev) => {
        const otherSteps = prev.filter((s) => s.questId !== questId);
        const thisQuestStepsMap = new Map(
          prev.filter((s) => s.questId === questId).map((s) => [s.id, s])
        );

        const orderedSteps: QuestStep[] = [];
        stepIdsInOrder.forEach((id, index) => {
          const step = thisQuestStepsMap.get(id);
          if (step) {
            orderedSteps.push({
              ...step,
              order: index + 1,
            });
          }
        });

        // Add any that might not have been in the array
        thisQuestStepsMap.forEach((step) => {
          if (!stepIdsInOrder.includes(step.id)) {
            orderedSteps.push({
              ...step,
              order: orderedSteps.length + 1,
            });
          }
        });

        return [...otherSteps, ...orderedSteps];
      });
    },
    []
  );

  const moveQuestStep = React.useCallback(
    (id: string, direction: "up" | "down") => {
      setQuestSteps((prev) => {
        const step = prev.find((s) => s.id === id);
        if (!step) return prev;

        const questId = step.questId;
        const currentQuestSteps = prev
          .filter((s) => s.questId === questId)
          .sort((a, b) => a.order - b.order);

        const currentIndex = currentQuestSteps.findIndex((s) => s.id === id);
        if (currentIndex === -1) return prev;

        const targetIndex =
          direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= currentQuestSteps.length) {
          return prev;
        }

        // Swap
        const reordered = [...currentQuestSteps];
        const temp = reordered[currentIndex];
        reordered[currentIndex] = reordered[targetIndex];
        reordered[targetIndex] = temp;

        const normalized = normalizeStepOrder(reordered);
        const otherSteps = prev.filter((s) => s.questId !== questId);

        return [...otherSteps, ...normalized];
      });
    },
    []
  );

  const makeStepSmaller = React.useCallback(
    (questId: string, currentStepId: string, tinyStepTitle: string): QuestStep => {
      const currentQuestSteps = questSteps
        .filter((s) => s.questId === questId)
        .sort((a, b) => a.order - b.order);

      const targetStepIndex = currentQuestSteps.findIndex(
        (s) => s.id === currentStepId
      );

      const newStep: QuestStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        questId,
        title: tinyStepTitle.trim(),
        status: "todo",
        order: targetStepIndex >= 0 ? targetStepIndex + 1 : 1,
        isTiny: true,
        createdAt: new Date().toISOString(),
      };

      const updatedQuestSteps: QuestStep[] = [];
      if (targetStepIndex >= 0) {
        currentQuestSteps.splice(targetStepIndex, 0, newStep);
        updatedQuestSteps.push(...normalizeStepOrder(currentQuestSteps));
      } else {
        updatedQuestSteps.push(...normalizeStepOrder([newStep, ...currentQuestSteps]));
      }

      setQuestSteps((prev) => [
        ...prev.filter((s) => s.questId !== questId),
        ...updatedQuestSteps,
      ]);

      return newStep;
    },
    [questSteps]
  );

  const skipQuestStep = React.useCallback((questId: string, stepId: string) => {
    setQuestSteps((prev) => {
      const currentQuestSteps = prev
        .filter((s) => s.questId === questId)
        .sort((a, b) => a.order - b.order);

      const stepIndex = currentQuestSteps.findIndex((s) => s.id === stepId);
      if (stepIndex === -1 || stepIndex >= currentQuestSteps.length - 1) {
        return prev;
      }

      // Move this step after the next step
      const reordered = [...currentQuestSteps];
      const [removed] = reordered.splice(stepIndex, 1);
      reordered.splice(stepIndex + 1, 0, removed);

      const normalized = normalizeStepOrder(reordered);
      const otherSteps = prev.filter((s) => s.questId !== questId);

      return [...otherSteps, ...normalized];
    });
  }, []);

  // --- Selectors ---

  const getMainQuest = React.useCallback((): Quest | null => {
    if (!activeMainQuestId) return null;
    return quests.find((q) => q.id === activeMainQuestId && q.status !== "completed") || null;
  }, [activeMainQuestId, quests]);

  const getMainQuestProject = React.useCallback((): Project | null => {
    const mainQuest = getMainQuest();
    if (!mainQuest) return null;
    return projects.find((p) => p.id === mainQuest.projectId) || null;
  }, [getMainQuest, projects]);

  const getProject = React.useCallback(
    (id: string): Project | undefined => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const getProjectQuests = React.useCallback(
    (projectId: string): Quest[] => {
      return quests
        .filter((q) => q.projectId === projectId)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    },
    [quests]
  );

  const getQuestSteps = React.useCallback(
    (questId: string): QuestStep[] => {
      return filterAndSortQuestSteps(questSteps, questId);
    },
    [questSteps]
  );

  const getQuestNextAction = React.useCallback(
    (quest: Quest): string | undefined => {
      return deriveQuestNextAction(quest, questSteps);
    },
    [questSteps]
  );

  const getQuestProgress = React.useCallback(
    (quest: Quest): number => {
      return deriveQuestProgress(quest, questSteps);
    },
    [questSteps]
  );

  const getProjectProgress = React.useCallback(
    (projectId: string): number => {
      const pQuests = quests.filter((q) => q.projectId === projectId);
      return deriveProjectProgress(pQuests, questSteps);
    },
    [quests, questSteps]
  );

  const contextValue = React.useMemo<QuestContextValue>(
    () => ({
      projects,
      quests,
      questSteps,
      activeMainQuestId,
      createProject,
      updateProject,
      deleteProject,
      archiveProject,
      restoreProject,
      createQuest,
      updateQuest,
      deleteQuest,
      moveQuest,
      reorderQuests,
      setMainQuest,
      completeQuest,
      updateQuestProgress,
      setQuestBlocker,
      createQuestStep,
      updateQuestStep,
      deleteQuestStep,
      completeQuestStep,
      reopenQuestStep,
      reorderQuestSteps,
      moveQuestStep,
      makeStepSmaller,
      skipQuestStep,
      getMainQuest,
      getMainQuestProject,
      getProject,
      getProjectQuests,
      getQuestSteps,
      getQuestNextAction,
      getQuestProgress,
      getProjectProgress,
    }),
    [
      projects,
      quests,
      questSteps,
      activeMainQuestId,
      createProject,
      updateProject,
      deleteProject,
      archiveProject,
      restoreProject,
      createQuest,
      updateQuest,
      deleteQuest,
      moveQuest,
      reorderQuests,
      setMainQuest,
      completeQuest,
      updateQuestProgress,
      setQuestBlocker,
      createQuestStep,
      updateQuestStep,
      deleteQuestStep,
      completeQuestStep,
      reopenQuestStep,
      reorderQuestSteps,
      moveQuestStep,
      makeStepSmaller,
      skipQuestStep,
      getMainQuest,
      getMainQuestProject,
      getProject,
      getProjectQuests,
      getQuestSteps,
      getQuestNextAction,
      getQuestProgress,
      getProjectProgress,
    ]
  );

  return <QuestContext.Provider value={contextValue}>{children}</QuestContext.Provider>;
}

export function useQuestContext(): QuestContextValue {
  const context = React.useContext(QuestContext);
  if (!context) {
    throw new Error("useQuestContext must be used within a QuestProvider");
  }
  return context;
}
