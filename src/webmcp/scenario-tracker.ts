import type { DemoScenarioStep } from "@/types/webmcp";

const INITIAL_STEPS: DemoScenarioStep[] = [
  {
    id: "read_workspace",
    title: "Read Workspace State",
    description: "Agent queries projects, active Main Quest, steps, and parking lot.",
    tools: ["get_current_work_state", "list_projects", "list_quests", "get_quest"],
    isCompleted: false,
  },
  {
    id: "resume_context",
    title: "Resume Interrupted Work",
    description: "Agent retrieves saved context note and restores mental flow.",
    tools: ["resume_work_context", "get_resumable_context"],
    isCompleted: false,
  },
  {
    id: "make_smaller",
    title: "Make Action Smaller",
    description: "Agent breaks down a stuck next action into a micro-step.",
    tools: ["make_next_action_smaller"],
    isCompleted: false,
  },
  {
    id: "park_distraction",
    title: "Park Stray Distraction",
    description: "Agent captures an incoming idea to the Parking Lot safely.",
    tools: ["park_side_quest"],
    isCompleted: false,
  },
  {
    id: "start_focus",
    title: "Start Focus Session",
    description: "Agent starts a focus session timer on the Main Quest.",
    tools: ["start_focus_session"],
    isCompleted: false,
  },
  {
    id: "check_recovery",
    title: "Recovery & Well-being",
    description: "Agent checks movement/water history and logs recovery.",
    tools: ["get_recovery_state", "suggest_recovery", "log_recovery"],
    isCompleted: false,
  },
  {
    id: "review_summary",
    title: "Review Accomplishments",
    description: "Agent inspects completed session summary, XP, and combo rank.",
    tools: ["get_session_summary", "get_player_state"],
    isCompleted: false,
  },
];

type ScenarioListener = (steps: DemoScenarioStep[], isAllCompleted: boolean) => void;

class DemoScenarioTracker {
  private steps: DemoScenarioStep[] = JSON.parse(JSON.stringify(INITIAL_STEPS));
  private listeners: Set<ScenarioListener> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("sidequest:demo-reset", () => {
        this.reset();
      });
    }
  }

  public recordToolExecution(toolName: string): void {
    let updated = false;
    this.steps = this.steps.map((step) => {
      if (step.tools.includes(toolName) && !step.isCompleted) {
        updated = true;
        return {
          ...step,
          isCompleted: true,
          completedAt: new Date().toISOString(),
        };
      }
      return step;
    });

    if (updated) {
      this.notify();
    }
  }

  public getSteps(): DemoScenarioStep[] {
    return [...this.steps];
  }

  public getCompletedCount(): number {
    return this.steps.filter((s) => s.isCompleted).length;
  }

  public getTotalCount(): number {
    return this.steps.length;
  }

  public isAllCompleted(): boolean {
    return this.steps.every((s) => s.isCompleted);
  }

  public reset(): void {
    this.steps = JSON.parse(JSON.stringify(INITIAL_STEPS));
    this.notify();
  }

  public subscribe(listener: ScenarioListener): () => void {
    this.listeners.add(listener);
    listener(this.getSteps(), this.isAllCompleted());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const steps = this.getSteps();
    const isAll = this.isAllCompleted();
    this.listeners.forEach((l) => l(steps, isAll));
  }
}

export const demoScenarioTracker = new DemoScenarioTracker();
