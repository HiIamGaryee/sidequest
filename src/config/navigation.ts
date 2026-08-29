import {
  LayoutDashboard,
  Target,
  FolderKanban,
  Zap,
  History,
  Trophy,
  Settings,
  Bot,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    description: "Your command center for keeping the main quest alive.",
  },
  {
    id: "focus",
    label: "Focus",
    path: "/focus",
    icon: Target,
    description: "A distraction-reduced workspace for the task that matters now.",
  },
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    icon: FolderKanban,
    description: "Manage projects, quests and progress.",
  },
  {
    id: "skills",
    label: "Skill Tree",
    path: "/skills",
    icon: Zap,
    description: "4-branch real work progression and mastery unlocks.",
  },
  {
    id: "history",
    label: "History",
    path: "/history",
    icon: History,
    description: "Review completed work and previous sessions.",
  },
  {
    id: "achievements",
    label: "Achievements",
    path: "/achievements",
    icon: Trophy,
    description: "Track XP, levels and milestones.",
  },
  {
    id: "demo",
    label: "Judge Mode",
    path: "/demo",
    icon: Bot,
    description: "WebMCP Challenge Judge Suite and real-time observability timeline.",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: Settings,
    description: "Control app preferences and local data.",
  },
];
