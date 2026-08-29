import * as React from "react";
import { Link } from "react-router-dom";
import { Play, FolderKanban, Flame } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { ResumeCard } from "@/components/context/ResumeCard";
import { DailyMissionBoard } from "@/components/daily/DailyMissionBoard";
import { ChallengeLauncherDialog } from "@/components/challenge/ChallengeLauncherDialog";
import { achievementImages } from "@/config/achievementBadges";
import { useContextKeeper } from "@/hooks/useContextKeeper";
import { useGamification } from "@/hooks/useGamification";
import { getTimeBasedGreeting } from "@/lib/utils";
import {
  MainQuestCard,
  PlayerStateCard,
  NextActionCard,
  SideQuestCard,
  TodayProgressCard,
} from "@/components/dashboard";
import { AgentActivity } from "@/components/webmcp/AgentActivity";
import { useWebMcp } from "@/hooks/useWebMcp";

export function DashboardPage() {
  const shouldReduceMotion = useReducedMotion();
  const { latestResumable } = useContextKeeper();
  const { userProfile, currentRank } = useGamification();
  const { agentActivities } = useWebMcp();
  const [challengeDialogOpen, setChallengeDialogOpen] = React.useState(false);

  const staggerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : custom * 0.06,
        duration: 0.25,
        ease: "easeOut",
      },
    }),
  };

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        {/* Hero Greeting Section */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={staggerVariants}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#27272a]/60"
        >
          <div className="flex items-start gap-3.5">
            <Link
              to="/achievements"
              title="View Achievements & Rank"
              className="w-12 h-12 rounded-xl bg-[#18181b] border border-amber-500/30 p-1 flex items-center justify-center shrink-0 hover:border-amber-400/60 hover:scale-105 transition-all shadow-md group cursor-pointer"
            >
              <img
                src={achievementImages.rankNovice}
                alt="Operative Crest"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] group-hover:brightness-110"
                referrerPolicy="no-referrer"
              />
            </Link>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <StatusBadge status="active" label="OPERATIONAL" size="sm" />
                <span className="text-[10px] font-mono text-amber-400/90 font-bold uppercase tracking-wider">
                  LVL {userProfile.level} • {currentRank.title}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa] leading-normal sm:leading-snug pb-1 overflow-visible">
                {getTimeBasedGreeting()}
              </h1>
              <p className="text-sm text-[#71717a] max-w-lg">
                Ready to keep the main quest alive? Guard your focus and park the chaos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChallengeDialogOpen(true)}
              className="border-[#27272a] hover:border-amber-500/50 bg-[#18181b] text-[#fafafa] font-semibold text-xs cursor-pointer shadow-xs"
            >
              <Flame className="mr-1.5 h-3.5 w-3.5 text-amber-400" />
              Work Challenge
            </Button>
            <Button
              asChild
              variant="default"
              size="sm"
              className="font-bold cursor-pointer shadow-xs"
            >
              <Link to="/focus">
                <Play className="mr-1.5 h-3.5 w-3.5 fill-black" />
                Start Focus
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-[#27272a] hover:bg-[#18181b] text-[#fafafa] font-medium cursor-pointer"
            >
              <Link to="/projects">
                <FolderKanban className="mr-1.5 h-3.5 w-3.5 text-[#a1a1aa]" />
                View Projects
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Grid Sections */}
        <div className="space-y-6 pt-2">
          {/* Thread Restoration (Context Keeper) */}
          {latestResumable && (
            <motion.div
              custom={1}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
            >
              <ResumeCard />
            </motion.div>
          )}

          {/* Daily Mission Board (Loadout) */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
          >
            <DailyMissionBoard />
          </motion.div>

          {/* Row 1: Main Quest & Player State */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
              className="lg:col-span-7"
            >
              <MainQuestCard className="h-full" />
            </motion.div>

            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
              className="lg:col-span-5"
            >
              <PlayerStateCard className="h-full" />
            </motion.div>
          </div>

          {/* Row 2: Next Action & Side Quests */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <motion.div
              custom={5}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
              className="lg:col-span-6"
            >
              <NextActionCard className="h-full" />
            </motion.div>

            <motion.div
              custom={6}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
              className="lg:col-span-6"
            >
              <SideQuestCard className="h-full" />
            </motion.div>
          </div>

          {/* Row 3: Today's Progress */}
          <motion.div
            custom={7}
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
          >
            <TodayProgressCard />
          </motion.div>

          {/* Row 4: WebMCP Agent Activity (if any) */}
          {agentActivities.length > 0 && (
            <motion.div
              custom={8}
              initial="hidden"
              animate="visible"
              variants={staggerVariants}
              className="p-4 rounded-xl border border-[#27272a] bg-[#18181b]/50"
            >
              <AgentActivity maxItems={3} showClear={true} />
            </motion.div>
          )}
        </div>

        <ChallengeLauncherDialog
          open={challengeDialogOpen}
          onOpenChange={setChallengeDialogOpen}
        />
      </PageContainer>
    </AnimatedPage>
  );
}

