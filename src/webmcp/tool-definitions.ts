import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import type { StoresRef } from "./stores-bridge";
import { toolSuccess, toolError } from "./tool-results";
import { createSafeExecute } from "./webmcp-utils";
import type { RecoveryType } from "@/types/recovery";

export function createWebMcpTools(getStores: () => StoresRef): WebMcpToolDefinition<any, any>[] {
  return [
    // ==========================================
    // 1. WORK & QUESTS (Read & Mutating)
    // ==========================================

    {
      name: "get_current_work_state",
      title: "Get Current Work State",
      description:
        "Provides a complete overview of the user's active productivity state: the current Main Quest, parent project, progress percentage, next micro-action, active focus session status, blockers, parked side quest count, and latest saved work context. Call this first to understand what the user is working on.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_current_work_state",
        () => "Retrieved current work state overview",
        () => {
          const { quests: qStore, focus: fStore, sideQuests: sqStore, contextKeeper: ckStore } = getStores();
          const mainQuest = qStore.getMainQuest();
          const mainProject = qStore.getMainQuestProject();
          const mainSteps = mainQuest ? qStore.getQuestSteps(mainQuest.id) : [];
          const nextAction = mainQuest ? qStore.getQuestNextAction(mainQuest) : undefined;
          const progress = mainQuest ? qStore.getQuestProgress(mainQuest) : 0;
          const parkedSideQuests = sqStore.getParkedSideQuests();
          const latestContext = ckStore.getLatestContext(mainQuest?.id);

          return toolSuccess({
            mainQuest: mainQuest
              ? {
                  id: mainQuest.id,
                  title: mainQuest.title,
                  description: mainQuest.description,
                  priority: mainQuest.priority,
                  progress,
                  nextAction: nextAction || "None specified",
                  stepCount: mainSteps.length,
                  completedStepCount: mainSteps.filter((s) => s.status === "completed").length,
                  blocker: mainQuest.blocker || null,
                }
              : null,
            project: mainProject
              ? {
                  id: mainProject.id,
                  name: mainProject.name,
                  progress: qStore.getProjectProgress(mainProject.id),
                }
              : null,
            focusSession: {
              status: fStore.status,
              plannedMinutes: fStore.plannedMinutes,
              elapsedSeconds: fStore.elapsedSeconds,
              remainingSeconds: fStore.remainingSeconds,
              isOvertime: fStore.isOvertime,
            },
            parkedSideQuestCount: parkedSideQuests.length,
            recentContext: latestContext
              ? {
                  id: latestContext.id,
                  savedAt: latestContext.savedAt,
                  reason: latestContext.reason,
                  note: latestContext.note,
                }
              : null,
          });
        }
      ),
    },

    {
      name: "list_projects",
      title: "List Projects",
      description:
        "Lists all active, non-archived projects with summary stats including project ID, name, progress percentage, total quest count, and completed quest count.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "list_projects",
        () => "Listed active projects",
        () => {
          const { quests: qStore } = getStores();
          const activeProjects = qStore.projects
            .filter((p) => p.status !== "archived")
            .map((p) => {
              const pQuests = qStore.getProjectQuests(p.id);
              const completedCount = pQuests.filter((q) => q.status === "completed").length;
              return {
                id: p.id,
                name: p.name,
                description: p.description,
                progress: qStore.getProjectProgress(p.id),
                questCount: pQuests.length,
                completedQuestCount: completedCount,
              };
            });

          return toolSuccess({
            projects: activeProjects,
            totalCount: activeProjects.length,
          });
        }
      ),
    },

    {
      name: "list_quests",
      title: "List Quests",
      description:
        "Lists quests across all projects or filtered by a specific projectId. Returns quest ID, projectId, title, status, priority, progress percentage, nextAction, and whether it is the active Main Quest.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "Optional project ID to filter quests",
          },
        },
      },
      execute: createSafeExecute(
        "list_quests",
        (input) => (input?.projectId ? `Listed quests for project ${input.projectId}` : "Listed all active quests"),
        (input?: { projectId?: string }) => {
          const { quests: qStore } = getStores();
          let filtered = qStore.quests;

          if (input?.projectId) {
            filtered = filtered.filter((q) => q.projectId === input.projectId);
          }

          const result = filtered.map((q) => ({
            id: q.id,
            projectId: q.projectId,
            title: q.title,
            status: q.status,
            priority: q.priority,
            progress: qStore.getQuestProgress(q),
            nextAction: qStore.getQuestNextAction(q) || null,
            isMainQuest: qStore.activeMainQuestId === q.id,
            blocker: q.blocker || null,
          }));

          return toolSuccess({
            quests: result,
            totalCount: result.length,
          });
        }
      ),
    },

    {
      name: "get_quest",
      title: "Get Quest Details",
      description:
        "Retrieves detailed information for a single quest, including its parent project, ordered step list, progress percentage, blocker, next action, and saved context snapshots.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The unique ID of the quest to inspect",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "get_quest",
        (input) => `Inspected quest: ${input?.questId}`,
        (input: { questId: string }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { quests: qStore, contextKeeper: ckStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `No quest found with ID: ${input.questId}`);
          }

          const project = qStore.getProject(quest.projectId);
          const steps = qStore.getQuestSteps(quest.id);
          const nextAction = qStore.getQuestNextAction(quest);
          const progress = qStore.getQuestProgress(quest);
          const contexts = ckStore.getQuestContexts(quest.id);

          return toolSuccess({
            quest: {
              id: quest.id,
              projectId: quest.projectId,
              projectName: project?.name || "Unknown Project",
              title: quest.title,
              description: quest.description,
              status: quest.status,
              priority: quest.priority,
              progress,
              nextAction: nextAction || null,
              blocker: quest.blocker || null,
              isMainQuest: qStore.activeMainQuestId === quest.id,
              steps: steps.map((s) => ({
                id: s.id,
                title: s.title,
                status: s.status,
                order: s.order,
                isTiny: s.isTiny,
              })),
              savedContextCount: contexts.length,
            },
          });
        }
      ),
    },

    {
      name: "create_quest",
      title: "Create Quest",
      description:
        "Creates a new quest inside a designated project. Does not automatically make it the active Main Quest.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "The target project ID to create this quest in",
          },
          title: {
            type: "string",
            description: "Clear, actionable title of the quest",
          },
          description: {
            type: "string",
            description: "Optional notes or requirements",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Priority level (default is medium)",
          },
          estimatedMinutes: {
            type: "number",
            minimum: 1,
            maximum: 600,
            description: "Estimated focus duration in minutes",
          },
          nextAction: {
            type: "string",
            description: "Immediate first next step",
          },
        },
        required: ["projectId", "title"],
      },
      execute: createSafeExecute(
        "create_quest",
        (input) => `Created quest: "${input?.title}"`,
        (input: {
          projectId: string;
          title: string;
          description?: string;
          priority?: "low" | "medium" | "high";
          estimatedMinutes?: number;
          nextAction?: string;
        }) => {
          if (!input?.projectId || !input?.title?.trim()) {
            return toolError("INVALID_INPUT", "projectId and title are required");
          }
          const { quests: qStore } = getStores();
          const project = qStore.getProject(input.projectId);
          if (!project) {
            return toolError("PROJECT_NOT_FOUND", `Project with ID ${input.projectId} does not exist`);
          }

          const createdQuest = qStore.createQuest({
            projectId: input.projectId,
            title: input.title.trim(),
            description: input.description?.trim(),
            priority: input.priority || "medium",
            estimatedMinutes: input.estimatedMinutes,
            nextAction: input.nextAction?.trim(),
          });

          return toolSuccess(
            {
              quest: {
                id: createdQuest.id,
                projectId: createdQuest.projectId,
                title: createdQuest.title,
                status: createdQuest.status,
                priority: createdQuest.priority,
              },
            },
            `Created quest "${createdQuest.title}" in project "${project.name}"`
          );
        }
      ),
    },

    {
      name: "set_main_quest",
      title: "Set Main Quest",
      description:
        "Sets one existing quest as the user's active Main Quest, guaranteeing exactly one Main Quest globally. Use this when the user explicitly chooses or asks to focus on a specific quest.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The unique ID of the quest to designate as Main Quest",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "set_main_quest",
        (input, res: any) => `Set Main Quest: "${res?.data?.title || input?.questId}"`,
        (input: { questId: string }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          qStore.setMainQuest(quest.id);
          const nextAction = qStore.getQuestNextAction(quest);

          return toolSuccess(
            {
              mainQuestId: quest.id,
              title: quest.title,
              nextAction: nextAction || null,
              progress: qStore.getQuestProgress(quest),
            },
            `Active Main Quest set to "${quest.title}"`
          );
        }
      ),
    },

    {
      name: "update_quest_progress",
      title: "Update Quest Progress",
      description:
        "Manually updates progress percentage (0-100) for quests that do NOT use step-derived progress. If the quest has steps, you must use complete_quest_step instead.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID to update",
          },
          progress: {
            type: "number",
            minimum: 0,
            maximum: 100,
            description: "New progress percentage from 0 to 100",
          },
        },
        required: ["questId", "progress"],
      },
      execute: createSafeExecute(
        "update_quest_progress",
        (input) => `Updated progress for quest ${input?.questId} to ${input?.progress}%`,
        (input: { questId: string; progress: number }) => {
          if (!input?.questId || typeof input?.progress !== "number") {
            return toolError("INVALID_INPUT", "questId and progress (0-100) are required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          const steps = qStore.getQuestSteps(quest.id);
          if (steps.length > 0) {
            return toolError(
              "STEP_BASED_PROGRESS",
              `Quest "${quest.title}" uses step-based progress (${steps.length} steps). Use complete_quest_step instead of manual progress override.`
            );
          }

          qStore.updateQuestProgress(quest.id, input.progress);

          return toolSuccess(
            {
              questId: quest.id,
              title: quest.title,
              newProgress: Math.max(0, Math.min(100, Math.round(input.progress))),
            },
            `Updated quest progress to ${input.progress}%`
          );
        }
      ),
    },

    {
      name: "complete_quest_step",
      title: "Complete Quest Step",
      description:
        "Marks a specific step within a quest as completed. Automatically advances the Next Action to the subsequent step, recalculates quest progress, and awards completion XP.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The parent quest ID",
          },
          stepId: {
            type: "string",
            description: "The unique ID of the step to mark completed",
          },
        },
        required: ["questId", "stepId"],
      },
      execute: createSafeExecute(
        "complete_quest_step",
        (input, res: any) => `Completed step: "${res?.data?.completedStep?.title || input?.stepId}"`,
        (input: { questId: string; stepId: string }) => {
          if (!input?.questId || !input?.stepId) {
            return toolError("INVALID_INPUT", "questId and stepId are required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          const steps = qStore.getQuestSteps(quest.id);
          const targetStep = steps.find((s) => s.id === input.stepId);
          if (!targetStep) {
            return toolError("STEP_NOT_FOUND", `Step with ID ${input.stepId} does not exist in this quest`);
          }

          qStore.completeQuestStep(targetStep.id);

          // Get fresh state after step completion
          const updatedSteps = qStore.getQuestSteps(quest.id);
          const remainingIncomplete = updatedSteps.filter((s) => s.status !== "completed" && s.id !== targetStep.id);
          const nextAction = qStore.getQuestNextAction(quest);
          const newProgress = qStore.getQuestProgress(quest);

          return toolSuccess(
            {
              completedStep: {
                id: targetStep.id,
                title: targetStep.title,
                status: "completed",
              },
              newProgress,
              newNextAction: nextAction || null,
              allStepsCompleted: remainingIncomplete.length === 0,
            },
            `Completed step "${targetStep.title}"`
          );
        }
      ),
    },

    {
      name: "add_quest_step",
      title: "Add Quest Step",
      description:
        "Appends a new step or micro-action to a quest, updating the step sequence and Next Action.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID to attach this step to",
          },
          title: {
            type: "string",
            description: "Step action description",
          },
          isTiny: {
            type: "boolean",
            description: "Whether this is an ultra-small micro-step (<5 min)",
          },
        },
        required: ["questId", "title"],
      },
      execute: createSafeExecute(
        "add_quest_step",
        (input) => `Added step "${input?.title}" to quest ${input?.questId}`,
        (input: { questId: string; title: string; isTiny?: boolean }) => {
          if (!input?.questId || !input?.title?.trim()) {
            return toolError("INVALID_INPUT", "questId and title are required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          const newStep = qStore.createQuestStep({
            questId: quest.id,
            title: input.title.trim(),
            isTiny: input.isTiny ?? false,
          });

          const nextAction = qStore.getQuestNextAction(quest);

          return toolSuccess(
            {
              step: newStep,
              totalSteps: qStore.getQuestSteps(quest.id).length,
              nextAction: nextAction || null,
            },
            `Added step "${newStep.title}" to quest "${quest.title}"`
          );
        }
      ),
    },

    {
      name: "make_next_action_smaller",
      title: "Make Next Action Smaller",
      description:
        "Assists a stuck user by inserting an ultra-small, frictionless micro-step right before the current action (Unstuck mode).",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID",
          },
          smallerAction: {
            type: "string",
            description: "The ultra-simple, frictionless micro-action (e.g. 'Open terminal' or 'Read lines 1-10')",
          },
        },
        required: ["questId", "smallerAction"],
      },
      execute: createSafeExecute(
        "make_next_action_smaller",
        (input) => `Made next action smaller: "${input?.smallerAction}"`,
        (input: { questId: string; smallerAction: string }) => {
          if (!input?.questId || !input?.smallerAction?.trim()) {
            return toolError("INVALID_INPUT", "questId and smallerAction are required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          const steps = qStore.getQuestSteps(quest.id);
          const firstIncomplete = steps.find((s) => s.status !== "completed");

          let createdStep;
          if (firstIncomplete) {
            createdStep = qStore.makeStepSmaller(quest.id, firstIncomplete.id, input.smallerAction.trim());
          } else {
            createdStep = qStore.createQuestStep({
              questId: quest.id,
              title: input.smallerAction.trim(),
              isTiny: true,
            });
          }

          return toolSuccess(
            {
              newNextAction: createdStep.title,
              stepId: createdStep.id,
              isTiny: true,
            },
            `Unstuck: Added micro-step "${createdStep.title}"`
          );
        }
      ),
    },

    {
      name: "set_quest_blocker",
      title: "Set Quest Blocker",
      description:
        "Marks a quest as blocked with an obstacle explanation, making the obstacle prominent in the UI.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID",
          },
          blocker: {
            type: "string",
            description: "Description of what is blocking progress",
          },
        },
        required: ["questId", "blocker"],
      },
      execute: createSafeExecute(
        "set_quest_blocker",
        (input) => `Set blocker on quest ${input?.questId}: "${input?.blocker}"`,
        (input: { questId: string; blocker: string }) => {
          if (!input?.questId || !input?.blocker?.trim()) {
            return toolError("INVALID_INPUT", "questId and blocker are required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          qStore.setQuestBlocker(quest.id, input.blocker.trim());

          return toolSuccess(
            {
              questId: quest.id,
              title: quest.title,
              blocker: input.blocker.trim(),
            },
            `Blocker set for "${quest.title}"`
          );
        }
      ),
    },

    {
      name: "clear_quest_blocker",
      title: "Clear Quest Blocker",
      description:
        "Clears an active blocker tag from a quest once the obstacle has been resolved.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID to clear blocker from",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "clear_quest_blocker",
        (input) => `Cleared blocker from quest: ${input?.questId}`,
        (input: { questId: string }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { quests: qStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          qStore.setQuestBlocker(quest.id, undefined);

          return toolSuccess(
            {
              questId: quest.id,
              title: quest.title,
              blocker: null,
            },
            `Cleared blocker from "${quest.title}"`
          );
        }
      ),
    },

    // ==========================================
    // 2. SIDE QUESTS / PARKING LOT
    // ==========================================

    {
      name: "park_side_quest",
      title: "Park Side Quest Idea",
      description:
        "Parks a distracting thought or tangential idea into the Side Quest Parking Lot without interrupting the active Main Quest or breaking focus momentum.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The distracting idea or side task title",
          },
          sourceQuestId: {
            type: "string",
            description: "Optional source quest ID during which this idea occurred",
          },
        },
        required: ["title"],
      },
      execute: createSafeExecute(
        "park_side_quest",
        (input) => `Parked side quest: "${input?.title}"`,
        (input: { title: string; sourceQuestId?: string }) => {
          if (!input?.title?.trim()) {
            return toolError("INVALID_INPUT", "title is required");
          }
          const { sideQuests: sqStore } = getStores();
          const newSq = sqStore.captureSideQuest({
            title: input.title.trim(),
            sourceQuestId: input.sourceQuestId,
          });

          return toolSuccess(
            {
              sideQuestId: newSq.id,
              title: newSq.title,
              parkedCount: sqStore.getParkedSideQuests().length,
            },
            `Parked idea "${newSq.title}" in Side Quest Parking Lot`
          );
        }
      ),
    },

    {
      name: "list_side_quests",
      title: "List Side Quests",
      description:
        "Lists currently parked ideas and side quests in the Parking Lot.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "list_side_quests",
        () => "Listed parked side quests",
        () => {
          const { sideQuests: sqStore } = getStores();
          const parked = sqStore.getParkedSideQuests().map((sq) => ({
            id: sq.id,
            title: sq.title,
            createdAt: sq.createdAt,
            sourceQuestId: sq.sourceQuestId || null,
            status: sq.status,
          }));

          return toolSuccess({
            sideQuests: parked,
            totalCount: parked.length,
          });
        }
      ),
    },

    {
      name: "promote_side_quest",
      title: "Promote Side Quest to Quest",
      description:
        "Converts a parked idea from the Side Quest Parking Lot into a formal quest inside a project. Does not automatically make it the Main Quest.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          sideQuestId: {
            type: "string",
            description: "The parked side quest ID to promote",
          },
          projectId: {
            type: "string",
            description: "Target project ID",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Initial priority for the promoted quest (default medium)",
          },
        },
        required: ["sideQuestId", "projectId"],
      },
      execute: createSafeExecute(
        "promote_side_quest",
        (input, res: any) => `Promoted side quest to: "${res?.data?.quest?.title || input?.sideQuestId}"`,
        (input: { sideQuestId: string; projectId: string; priority?: "low" | "medium" | "high" }) => {
          if (!input?.sideQuestId || !input?.projectId) {
            return toolError("INVALID_INPUT", "sideQuestId and projectId are required");
          }
          const { sideQuests: sqStore, quests: qStore } = getStores();
          const project = qStore.getProject(input.projectId);
          if (!project) {
            return toolError("PROJECT_NOT_FOUND", `Project with ID ${input.projectId} does not exist`);
          }

          const targetSq = sqStore.sideQuests.find((sq) => sq.id === input.sideQuestId);
          if (!targetSq) {
            return toolError("SIDE_QUEST_NOT_FOUND", `Side quest with ID ${input.sideQuestId} does not exist`);
          }

          const newQuest = sqStore.promoteSideQuest(
            {
              sideQuestId: input.sideQuestId,
              projectId: input.projectId,
              priority: input.priority || "medium",
            },
            qStore.createQuest
          );

          return toolSuccess(
            {
              promotedQuest: {
                id: newQuest.id,
                projectId: newQuest.projectId,
                title: newQuest.title,
                status: newQuest.status,
              },
            },
            `Promoted side quest to full quest "${newQuest.title}" in "${project.name}"`
          );
        }
      ),
    },

    // ==========================================
    // 3. CONTEXT KEEPER / RESUME ME
    // ==========================================

    {
      name: "save_work_context",
      title: "Save Work Context",
      description:
        "Saves a work context bookmark for a quest, preserving current step, Next Action, progress, and an optional note before task switches or interruptions.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID to save context for",
          },
          note: {
            type: "string",
            description: "Optional notes about current thoughts or stopping point",
          },
          reason: {
            type: "string",
            enum: ["manual", "task-switch", "interruption", "session-end"],
            description: "Why the context is being saved",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "save_work_context",
        (input) => `Saved work context for quest: ${input?.questId}`,
        (input: { questId: string; note?: string; reason?: "manual" | "task-switch" | "interruption" | "session-end" }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { quests: qStore, contextKeeper: ckStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          const steps = qStore.getQuestSteps(quest.id);
          const firstIncomplete = steps.find((s) => s.status !== "completed");
          const nextAction = qStore.getQuestNextAction(quest);
          const progress = qStore.getQuestProgress(quest);

          const savedContext = ckStore.saveWorkContext({
            questId: quest.id,
            note: input.note,
            reason: input.reason || "manual",
            currentStepId: firstIncomplete?.id,
            nextAction: nextAction,
            progress: progress,
            blocker: quest.blocker,
          });

          return toolSuccess(
            {
              contextId: savedContext?.id,
              questId: quest.id,
              title: quest.title,
              nextAction: nextAction || null,
              savedAt: savedContext?.savedAt,
            },
            `Saved work context for "${quest.title}"`
          );
        }
      ),
    },

    {
      name: "get_resumable_context",
      title: "Get Resumable Context",
      description:
        "Retrieves the latest valid work context available for resuming work after a break or task switch.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "Optional quest ID to retrieve context specifically for",
          },
        },
      },
      execute: createSafeExecute(
        "get_resumable_context",
        () => "Checked for resumable work context",
        (input?: { questId?: string }) => {
          const { quests: qStore, contextKeeper: ckStore } = getStores();

          if (input?.questId) {
            const ctx = ckStore.getLatestContext(input.questId);
            if (!ctx) {
              return toolSuccess({ available: false });
            }
            const quest = qStore.quests.find((q) => q.id === ctx.questId);
            return toolSuccess({
              available: true,
              context: {
                id: ctx.id,
                questId: ctx.questId,
                questTitle: quest?.title || "Unknown Quest",
                savedAt: ctx.savedAt,
                reason: ctx.reason,
                note: ctx.note || null,
                nextAction: ctx.nextAction || null,
                progress: ctx.progress,
              },
            });
          }

          const resumable = ckStore.getLatestResumable(qStore.quests, qStore.activeMainQuestId);
          if (!resumable) {
            return toolSuccess({ available: false });
          }

          const quest = qStore.quests.find((q) => q.id === resumable.questId);
          return toolSuccess({
            available: true,
            context: {
              id: resumable.id,
              questId: resumable.questId,
              questTitle: quest?.title || "Unknown Quest",
              savedAt: resumable.savedAt,
              reason: resumable.reason,
              note: resumable.note || null,
              nextAction: resumable.nextAction || null,
              progress: resumable.progress,
            },
          });
        }
      ),
    },

    {
      name: "resume_work_context",
      title: "Resume Work Context",
      description:
        "Restores focus to a previously saved work context, setting the associated quest as the active Main Quest and restoring immediate Next Action orientation.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID of the saved context to resume",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "resume_work_context",
        (input, res: any) => `Resumed work context for: "${res?.data?.title || input?.questId}"`,
        (input: { questId: string }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { quests: qStore, gamification: gStore } = getStores();
          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          qStore.setMainQuest(quest.id);

          // Award resume XP & combo increment
          gStore.awardXp({
            type: "resume_after_interruption",
            referenceId: `resume-mcp-${quest.id}-${Date.now()}`,
            label: `Resumed: ${quest.title.slice(0, 25)}`,
          });
          gStore.incrementCombo("resume_after_interruption");

          const nextAction = qStore.getQuestNextAction(quest);
          const progress = qStore.getQuestProgress(quest);

          return toolSuccess(
            {
              resumedQuestId: quest.id,
              title: quest.title,
              nextAction: nextAction || null,
              progress,
            },
            `Resumed work thread for "${quest.title}". Next Action: ${nextAction || "Continue working"}`
          );
        }
      ),
    },

    // ==========================================
    // 4. FOCUS SESSIONS
    // ==========================================

    {
      name: "start_focus_session",
      title: "Start Focus Session",
      description:
        "Starts a timed deep-work Focus Session for a specific quest. Returns a conflict error if a session is already actively running.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The quest ID to focus on",
          },
          plannedMinutes: {
            type: "number",
            minimum: 5,
            maximum: 180,
            description: "Planned focus duration in minutes (5 to 180, default 25)",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "start_focus_session",
        (input) => `Started ${input?.plannedMinutes || 25}m focus session on quest ${input?.questId}`,
        (input: { questId: string; plannedMinutes?: number }) => {
          if (!input?.questId) {
            return toolError("INVALID_INPUT", "questId is required");
          }
          const { focus: fStore, quests: qStore } = getStores();

          if (fStore.status === "running") {
            return toolError(
              "FOCUS_SESSION_CONFLICT",
              "Another Focus Session is already running. Pause or end it before starting a new one."
            );
          }

          const quest = qStore.quests.find((q) => q.id === input.questId);
          if (!quest) {
            return toolError("QUEST_NOT_FOUND", `Quest with ID ${input.questId} does not exist`);
          }

          // If not current main quest, align it
          if (qStore.activeMainQuestId !== quest.id) {
            qStore.setMainQuest(quest.id);
          }

          const session = fStore.startFocusSession(quest.id, input.plannedMinutes || 25);

          return toolSuccess(
            {
              sessionId: session.id,
              questId: quest.id,
              questTitle: quest.title,
              plannedMinutes: session.plannedMinutes,
              status: "running",
            },
            `Started ${session.plannedMinutes}-minute focus session on "${quest.title}"`
          );
        }
      ),
    },

    {
      name: "get_focus_state",
      title: "Get Focus State",
      description:
        "Returns the current focus session state: timer status (idle/running/paused/completed), elapsed seconds, remaining seconds, overtime, active quest, and Next Action.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_focus_state",
        () => "Retrieved focus session state",
        () => {
          const { focus: fStore, quests: qStore } = getStores();
          const mainQuest = qStore.getMainQuest();

          return toolSuccess({
            status: fStore.status,
            plannedMinutes: fStore.plannedMinutes,
            elapsedSeconds: fStore.elapsedSeconds,
            remainingSeconds: fStore.remainingSeconds,
            overtimeSeconds: fStore.overtimeSeconds,
            isOvertime: fStore.isOvertime,
            currentQuest: mainQuest
              ? {
                  id: mainQuest.id,
                  title: mainQuest.title,
                  nextAction: qStore.getQuestNextAction(mainQuest) || null,
                }
              : null,
          });
        }
      ),
    },

    {
      name: "pause_focus_session",
      title: "Pause Focus Session",
      description:
        "Pauses the currently running focus timer and automatically saves the current work context.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "pause_focus_session",
        () => "Paused focus session",
        () => {
          const { focus: fStore } = getStores();
          if (fStore.status !== "running") {
            return toolError("INVALID_STATE", `Cannot pause when focus timer status is "${fStore.status}"`);
          }

          fStore.pauseFocusSession();

          return toolSuccess(
            {
              status: "paused",
              elapsedSeconds: fStore.elapsedSeconds,
            },
            "Focus session paused"
          );
        }
      ),
    },

    {
      name: "resume_focus_session",
      title: "Resume Focus Session",
      description:
        "Resumes a previously paused focus session timer.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "resume_focus_session",
        () => "Resumed focus session",
        () => {
          const { focus: fStore } = getStores();
          if (fStore.status !== "paused") {
            return toolError("INVALID_STATE", `Cannot resume when focus timer status is "${fStore.status}"`);
          }

          fStore.resumeFocusSession();

          return toolSuccess(
            {
              status: "running",
              remainingSeconds: fStore.remainingSeconds,
            },
            "Focus session resumed"
          );
        }
      ),
    },

    {
      name: "end_focus_session",
      title: "End Focus Session",
      description:
        "Concludes the active or paused focus session, records elapsed focus metrics, generates session summary stats, and awards focus completion XP.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "end_focus_session",
        () => "Ended focus session",
        () => {
          const { focus: fStore } = getStores();
          if (fStore.status === "idle") {
            return toolError("NO_ACTIVE_SESSION", "No focus session is currently running or paused.");
          }

          const completedSession = fStore.endFocusSession();

          return toolSuccess(
            {
              status: "completed",
              session: completedSession
                ? {
                    id: completedSession.id,
                    questId: completedSession.questId,
                    elapsedMinutes: Math.floor(completedSession.elapsedSeconds / 60),
                    completedStepsCount: completedSession.endingCompletedStepIds?.length || 0,
                    progressDelta:
                      (completedSession.endingProgress ?? 0) - completedSession.startingProgress,
                  }
                : null,
            },
            "Focus session ended successfully"
          );
        }
      ),
    },

    // ==========================================
    // 5. RECOVERY & WELL-BEING
    // ==========================================

    {
      name: "get_recovery_state",
      title: "Get Recovery State",
      description:
        "Inspects recovery status: whether recovery prompts are enabled, pending recovery prompts, minutes since last hydration or movement, and next recommended recovery action.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_recovery_state",
        () => "Retrieved recovery state",
        () => {
          const { recovery: rStore } = getStores();
          const waterLogs = rStore.recoveryLogs.filter((l) => l.type === "water");
          const movementLogs = rStore.recoveryLogs.filter((l) => l.type === "movement" || l.type === "stretch");

          const lastWater = waterLogs[0]?.timestamp || null;
          const lastMovement = movementLogs[0]?.timestamp || null;

          return toolSuccess({
            nudgesEnabled: rStore.preferences.enabled,
            currentRecoveryQuest: rStore.activeQuest
              ? {
                  id: rStore.activeQuest.id,
                  type: rStore.activeQuest.type,
                  title: rStore.activeQuest.title,
                }
              : null,
            lastWater,
            lastMovement,
            recentLogCount: rStore.recoveryLogs.length,
          });
        }
      ),
    },

    {
      name: "suggest_recovery",
      title: "Suggest Recovery Action",
      description:
        "Evaluates deterministic recovery needs (water, movement, stretch, eye rest) based on work duration and recovery history without providing medical advice.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "suggest_recovery",
        () => "Generated optional recovery suggestion",
        () => {
          const { recovery: rStore, focus: fStore } = getStores();
          const elapsedMins = Math.floor(fStore.elapsedSeconds / 60);

          if (elapsedMins >= 45) {
            return toolSuccess({
              needed: true,
              type: "movement",
              reason: `Focused for ${elapsedMins} minutes. A quick 1-2 minute movement or posture stretch is recommended.`,
            });
          }

          if (elapsedMins >= 25) {
            return toolSuccess({
              needed: true,
              type: "eyes",
              reason: `25 minutes of screen time. Look at something 20 feet away for 20 seconds.`,
            });
          }

          return toolSuccess({
            needed: false,
            message: "Focus duration is still low. Recovery is optional.",
          });
        }
      ),
    },

    {
      name: "log_recovery",
      title: "Log Recovery Activity",
      description:
        "Logs an optional physical recovery action (water, movement, stretch, eyes, bio, break), protecting current combo streaks and awarding recovery XP.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["water", "movement", "stretch", "eyes", "bio", "break"],
            description: "Type of recovery activity to log",
          },
        },
        required: ["type"],
      },
      execute: createSafeExecute(
        "log_recovery",
        (input) => `Logged recovery: ${input?.type}`,
        (input: { type: RecoveryType }) => {
          const allowed: RecoveryType[] = ["water", "movement", "stretch", "eyes", "bio", "break"];
          if (!input?.type || !allowed.includes(input.type)) {
            return toolError("INVALID_INPUT", `Type must be one of: ${allowed.join(", ")}`);
          }

          const { recovery: rStore } = getStores();

          switch (input.type) {
            case "water":
              rStore.logWater();
              break;
            case "movement":
              rStore.logMovement(120);
              break;
            case "stretch":
              rStore.logStretch();
              break;
            case "eyes":
              rStore.logEyeBreak(20);
              break;
            case "bio":
              rStore.logBioBreak();
              break;
            case "break":
              rStore.logGeneralBreak(300);
              break;
          }

          return toolSuccess(
            {
              type: input.type,
              loggedAt: new Date().toISOString(),
            },
            `Logged recovery: ${input.type}. Combo protected.`
          );
        }
      ),
    },

    // ==========================================
    // 6. GAMIFICATION & SESSION SUMMARY
    // ==========================================

    {
      name: "get_player_state",
      title: "Get Player State",
      description:
        "Returns the user's gamification profile: level, rank title, total XP, XP needed for the next level, active combo streak, best combo streak, and unlocked achievements count.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_player_state",
        () => "Retrieved player gamification state",
        () => {
          const { gamification: gStore } = getStores();
          const state = gStore.getPlayerState();
          const unlockedCount = gStore.achievements.filter((a) => a.isUnlocked).length;

          return toolSuccess({
            level: state.level,
            title: state.levelTitle,
            xp: state.xp,
            lifetimeXp: state.lifetimeXp,
            xpToNextLevel: state.xpToNextLevel,
            currentCombo: state.currentCombo,
            bestCombo: state.bestCombo,
            unlockedAchievementsCount: unlockedCount,
            totalAchievementsCount: gStore.achievements.length,
          });
        }
      ),
    },

    {
      name: "get_session_summary",
      title: "Get Session Summary",
      description:
        "Returns summary metrics for the most recently completed focus session (focus duration, quest title, progress delta, steps completed, and recovery actions).",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_session_summary",
        () => "Retrieved latest session summary",
        () => {
          const { focus: fStore, quests: qStore, gamification: gStore } = getStores();
          const session = fStore.lastCompletedSession;
          if (!session) {
            return toolSuccess({
              hasCompletedSession: false,
              message: "No completed focus sessions recorded in this session yet.",
            });
          }

          const quest = qStore.quests.find((q) => q.id === session.questId);

          return toolSuccess({
            hasCompletedSession: true,
            session: {
              id: session.id,
              questId: session.questId,
              questTitle: quest?.title || "Unknown Quest",
              durationSeconds: session.elapsedSeconds,
              durationMinutes: Math.floor(session.elapsedSeconds / 60),
              stepsCompleted: session.endingCompletedStepIds?.length || 0,
              progressDelta: (session.endingProgress ?? 0) - session.startingProgress,
              startedAt: session.startedAt,
              endedAt: session.endedAt || null,
            },
            playerStats: {
              currentLevel: gStore.playerProfile.level,
              currentCombo: gStore.playerProfile.currentCombo,
            },
          });
        }
      ),
    },

    // ==========================================
    // 7. STEP 12 EXPANSION TOOLS
    // ==========================================

    {
      name: "get_today_loadout",
      title: "Get Today's Loadout",
      description:
        "Returns the user's Daily Mission Board for today: the assigned Daily Main Mission, up to 2 Side Missions, today's recovery goals, and whether daily completion bonus has been cleared.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_today_loadout",
        () => "Retrieved Today's Loadout",
        () => {
          const { daily: dStore } = getStores();
          return toolSuccess({
            date: dStore.todayKey,
            mainMission: dStore.mainMissionQuest
              ? {
                  id: dStore.mainMissionQuest.id,
                  title: dStore.mainMissionQuest.title,
                  progress: dStore.mainMissionQuest.progress,
                  isComplete: dStore.isMainMissionComplete,
                }
              : null,
            sideMissions: dStore.sideMissionQuests.map((q) => ({
              id: q.id,
              title: q.title,
              progress: q.progress,
              isComplete: q.status === "completed" || q.progress >= 100,
            })),
            isDailyClear: dStore.isDailyClear,
            isRecoveryGoalsMet: dStore.isRecoveryGoalsMet,
            recoveryGoals: dStore.recoveryGoalsProgress,
          });
        }
      ),
    },

    {
      name: "set_daily_main_mission",
      title: "Set Daily Main Mission",
      description:
        "Assigns a Quest as the Daily Main Mission on Today's Loadout board. Optionally also sets it as the active global Main Quest.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The unique ID of the quest to assign as Daily Main Mission.",
          },
          setAsGlobalMainQuest: {
            type: "boolean",
            description: "If true, also switches the application-wide Main Quest to this quest.",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "set_daily_main_mission",
        (args: { questId: string; setAsGlobalMainQuest?: boolean }) =>
          `Assigned quest ${args.questId} as Daily Main Mission`,
        (args: { questId: string; setAsGlobalMainQuest?: boolean }) => {
          const { daily: dStore, quests: qStore } = getStores();
          const targetQuest = qStore.quests.find((q) => q.id === args.questId);
          if (!targetQuest) {
            return toolError("NOT_FOUND", `Quest '${args.questId}' not found.`);
          }

          dStore.setMainMission(args.questId, Boolean(args.setAsGlobalMainQuest));

          return toolSuccess({
            assignedQuestId: args.questId,
            questTitle: targetQuest.title,
            isGlobalMainQuest: Boolean(args.setAsGlobalMainQuest),
            date: dStore.todayKey,
          });
        }
      ),
    },

    {
      name: "add_daily_side_mission",
      title: "Add Daily Side Mission",
      description:
        "Adds a Quest to today's Side Missions. Enforces the maximum 2 side missions constraint.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          questId: {
            type: "string",
            description: "The unique ID of the quest to add as a side mission.",
          },
        },
        required: ["questId"],
      },
      execute: createSafeExecute(
        "add_daily_side_mission",
        (args: { questId: string }) => `Added quest ${args.questId} as daily side mission`,
        (args: { questId: string }) => {
          const { daily: dStore, quests: qStore } = getStores();
          const targetQuest = qStore.quests.find((q) => q.id === args.questId);
          if (!targetQuest) {
            return toolError("NOT_FOUND", `Quest '${args.questId}' not found.`);
          }

          const res = dStore.addSideMission(args.questId);
          if (!res.success) {
            return toolError("CONSTRAINT_VIOLATION", res.error || "Could not add side mission.");
          }

          return toolSuccess({
            questId: args.questId,
            questTitle: targetQuest.title,
            currentSideMissionCount: dStore.loadout.sideQuestIds.length,
          });
        }
      ),
    },

    {
      name: "get_boss_state",
      title: "Get Boss Battle State",
      description:
        "Queries boss health, progress percentage, phase statuses, and defeat state for a given Project.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "The project ID to check for Boss Battle mode.",
          },
        },
        required: ["projectId"],
      },
      execute: createSafeExecute(
        "get_boss_state",
        (args: { projectId: string }) => `Retrieved Boss Battle state for project ${args.projectId}`,
        (args: { projectId: string }) => {
          const { boss: bStore } = getStores();
          const state = bStore.getBossState(args.projectId);
          if (!state) {
            return toolError("NOT_FOUND", `Project '${args.projectId}' not found.`);
          }

          return toolSuccess({
            projectId: args.projectId,
            projectName: state.project.name,
            bossModeEnabled: state.config.enabled,
            bossTitle: state.config.title || `BOSS: ${state.project.name}`,
            hpRemaining: state.hpRemaining,
            projectProgress: state.progress,
            isDefeated: state.isDefeated,
            activePhase: state.activePhase
              ? {
                  id: state.activePhase.id,
                  title: state.activePhase.title,
                  order: state.activePhase.order,
                }
              : null,
            phases: state.phaseProgress.map((p) => ({
              id: p.phase.id,
              title: p.phase.title,
              progress: p.progress,
              isComplete: p.isComplete,
              isCurrent: p.isCurrent,
              questCount: p.quests.length,
            })),
          });
        }
      ),
    },

    {
      name: "toggle_boss_mode",
      title: "Toggle Boss Mode",
      description:
        "Enables or disables Boss Battle HUD view for a specific Project.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
            description: "The unique ID of the project.",
          },
          enabled: {
            type: "boolean",
            description: "True to enable boss mode, false to return to standard view.",
          },
        },
        required: ["projectId"],
      },
      execute: createSafeExecute(
        "toggle_boss_mode",
        (args: { projectId: string; enabled?: boolean }) =>
          `Toggled boss mode for project ${args.projectId}`,
        (args: { projectId: string; enabled?: boolean }) => {
          const { boss: bStore } = getStores();
          bStore.toggleBossMode(args.projectId, args.enabled);
          const updated = bStore.getBossState(args.projectId);
          return toolSuccess({
            projectId: args.projectId,
            bossModeEnabled: updated?.config.enabled ?? false,
          });
        }
      ),
    },

    {
      name: "start_challenge",
      title: "Start Work Challenge",
      description:
        "Initiates a voluntary short challenge (timed_action, step_count, main_quest_progress, or no_switch) on an active Quest.",
      annotations: {
        readOnlyHint: false,
      },
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["timed_action", "step_count", "main_quest_progress", "no_switch"],
            description: "The challenge preset type.",
          },
          questId: {
            type: "string",
            description: "Optional Quest ID to bind the challenge to. Defaults to Main Quest.",
          },
          durationSeconds: {
            type: "number",
            description: "Optional duration for timed_action challenges (e.g. 600 for 10 min).",
          },
        },
        required: ["type"],
      },
      execute: createSafeExecute(
        "start_challenge",
        (args: { type: any; questId?: string; durationSeconds?: number }) =>
          `Started challenge ${args.type}`,
        (args: { type: any; questId?: string; durationSeconds?: number }) => {
          const { challenge: cStore } = getStores();
          const res = cStore.startChallenge(args.type, args.questId, args.durationSeconds);
          if (!res.success) {
            return toolError("FAILED", res.error || "Could not start challenge.");
          }

          return toolSuccess({
            challenge: cStore.activeChallenge,
          });
        }
      ),
    },

    {
      name: "get_challenge_state",
      title: "Get Challenge State",
      description:
        "Returns the active challenge HUD status, remaining countdown seconds, and progress percentage.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_challenge_state",
        () => "Retrieved active challenge state",
        () => {
          const { challenge: cStore } = getStores();
          return toolSuccess({
            hasActiveChallenge: Boolean(cStore.activeChallenge),
            activeChallenge: cStore.activeChallenge,
            remainingSeconds: cStore.remainingSeconds,
            progressPercentage: cStore.progressPercentage,
          });
        }
      ),
    },

    {
      name: "get_skill_tree",
      title: "Get Skill Tree Progress",
      description:
        "Returns the complete 4-branch Skill Tree (Focus, Finishing, Resilience, Recovery), unlocked count, and next available skill nodes.",
      annotations: {
        readOnlyHint: true,
      },
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: createSafeExecute(
        "get_skill_tree",
        () => "Retrieved Skill Tree progress",
        () => {
          const { skills: sStore } = getStores();
          return toolSuccess({
            unlockedCount: sStore.unlockedCount,
            totalCount: sStore.totalCount,
            latestUnlocked: sStore.latestUnlocked
              ? {
                  id: sStore.latestUnlocked.definition.id,
                  title: sStore.latestUnlocked.definition.title,
                  cosmeticTitle: sStore.latestUnlocked.definition.cosmeticTitle,
                  unlockedAt: sStore.latestUnlocked.unlockedAt,
                }
              : null,
            nextAvailable: sStore.nextAvailable
              ? {
                  id: sStore.nextAvailable.definition.id,
                  title: sStore.nextAvailable.definition.title,
                  progressPercentage: sStore.nextAvailable.percentage,
                }
              : null,
            skills: sStore.skillsProgress.map((s) => ({
              id: s.definition.id,
              branch: s.definition.branch,
              title: s.definition.title,
              cosmeticTitle: s.definition.cosmeticTitle,
              state: s.state,
              currentCount: s.currentCount,
              targetCount: s.targetCount,
              percentage: s.percentage,
              unlockedAt: s.unlockedAt || null,
            })),
          });
        }
      ),
    },
  ];
}
