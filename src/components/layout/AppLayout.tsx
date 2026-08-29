import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileNav } from "@/components/layout/MobileNav";
import { JudgeBanner } from "@/components/judge/JudgeBanner";
import { ChallengeHudBanner } from "@/components/challenge/ChallengeHudBanner";
import {
  RecoveryQuestCard,
  RecoveryCompletionCard,
  RecoveryCenter,
} from "@/components/recovery";
import {
  LevelUpDialog,
  AchievementUnlock,
  XpFeedback,
} from "@/components/gamification";

export function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Desktop Permanent Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Main App Container */}
      <div className="flex flex-1 flex-col md:pl-64 min-w-0">
        <JudgeBanner />
        <ChallengeHudBanner />
        <TopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <AnimatePresence mode="wait">
            <div key={location.pathname} className="w-full flex-1 flex flex-col">
              <Outlet />
            </div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Recovery Prompts & Hub */}
      <RecoveryQuestCard />
      <RecoveryCompletionCard />
      <RecoveryCenter />

      {/* Gamification Overlays & Feedback */}
      <LevelUpDialog />
      <AchievementUnlock />
      <XpFeedback />
    </div>
  );
}
