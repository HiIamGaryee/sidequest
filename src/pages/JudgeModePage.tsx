import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  RotateCcw,
  LogOut,
  HelpCircle,
  Activity,
  Layers,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Play,
  ArrowLeft,
  LayoutDashboard,
} from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { Button } from "@/components/ui/button";
import { usePersistence } from "@/stores/PersistenceContext";
import { JudgeIntroModal } from "@/components/judge/JudgeIntroModal";
import { DemoGuide } from "@/components/judge/DemoGuide";
import { DemoScenarioTracker } from "@/components/judge/DemoScenarioTracker";
import { DemoHealthBadge } from "@/components/judge/DemoHealthBadge";
import { AgentActionTimeline } from "@/components/webmcp/AgentActionTimeline";
import { DevToolTester } from "@/components/webmcp/DevToolTester";
import { WebMcpToolExplorer } from "@/components/webmcp/WebMcpToolExplorer";
import { WebMcpArchitectureCard } from "@/components/webmcp/WebMcpArchitectureCard";
import { WebMcpCollaborationCard } from "@/components/webmcp/WebMcpCollaborationCard";

export function JudgeModePage() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { isJudgeMode, enterJudgeMode, resetJudgeDemo, exitJudgeMode } = usePersistence();

  const [showIntroModal, setShowIntroModal] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("sidequest:judge-intro-seen");
      return !seen;
    }
    return true;
  });

  const [selectedToolForTesting, setSelectedToolForTesting] = React.useState<string>("get_current_work_state");

  // Ensure Judge Mode is active when on /demo route
  React.useEffect(() => {
    if (!isJudgeMode) {
      enterJudgeMode();
    }
  }, [isJudgeMode, enterJudgeMode]);

  const handleStartDemo = () => {
    setShowIntroModal(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sidequest:judge-intro-seen", "true");
    }
  };

  const handleExitDemo = () => {
    exitJudgeMode();
    navigate("/");
  };

  const handleResetDemo = () => {
    resetJudgeDemo();
  };

  const handleSelectToolForTesting = (toolName: string) => {
    setSelectedToolForTesting(toolName);
    const testerEl = document.getElementById("dev-tool-tester-card");
    if (testerEl) {
      testerEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  const staggerVariants: Variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : custom * 0.05,
        duration: 0.25,
        ease: "easeOut",
      },
    }),
  };

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <div className="space-y-6">
          {/* Header & Hero */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20 text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  WEBMCP CHALLENGE
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60 text-[11px] font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  ISOLATED DEMO WORKSPACE
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-foreground leading-normal pb-0.5 overflow-visible">
                Judge Mode & Observability Suite
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Agent-native productivity for staying on the main quest. Observe live WebMCP schema calls, state mutations, and human-agent collaboration boundaries.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <Button
                id="judge-intro-help-btn"
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowIntroModal(true)}
                className="h-8 px-2.5 text-xs font-mono border-border text-foreground hover:bg-secondary cursor-pointer"
                title="View Intro & Instructions"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                Guide
              </Button>

              <Button
                id="judge-page-reset-btn"
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetDemo}
                className="h-8 px-2.5 text-xs font-mono bg-secondary/50 border-sky-500/30 text-sky-500 dark:text-sky-400 hover:bg-sky-500/10 cursor-pointer"
                title="Reset demo workspace to starting state"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Demo
              </Button>

              <Link to="/">
                <Button
                  id="judge-view-app-btn"
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Live App
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Health HUD */}
          <motion.div custom={1} initial="hidden" animate="visible" variants={staggerVariants}>
            <DemoHealthBadge />
          </motion.div>

          {/* Interaction Guide (6 prompts) */}
          <motion.div custom={2} initial="hidden" animate="visible" variants={staggerVariants}>
            <DemoGuide />
          </motion.div>

          {/* Scenario Tracker */}
          <motion.div custom={3} initial="hidden" animate="visible" variants={staggerVariants}>
            <DemoScenarioTracker />
          </motion.div>

          {/* Real-time Agent Action Timeline */}
          <motion.div custom={4} initial="hidden" animate="visible" variants={staggerVariants}>
            <AgentActionTimeline />
          </motion.div>

          {/* Interactive WebMCP Tool Runner */}
          <motion.div custom={5} initial="hidden" animate="visible" variants={staggerVariants}>
            <DevToolTester initialToolName={selectedToolForTesting} />
          </motion.div>

          {/* Tool Explorer */}
          <motion.div custom={6} initial="hidden" animate="visible" variants={staggerVariants}>
            <WebMcpToolExplorer onSelectToolForTesting={handleSelectToolForTesting} />
          </motion.div>

          {/* Architecture & Collaboration Cards */}
          <motion.div
            custom={7}
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="grid grid-cols-1 gap-6"
          >
            <WebMcpArchitectureCard />
            <WebMcpCollaborationCard />
          </motion.div>

          {/* Footer exit link */}
          <motion.div
            custom={8}
            initial="hidden"
            animate="visible"
            variants={staggerVariants}
            className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono"
          >
            <div>SIDEQUEST v1.0 • WebMCP Challenge Judge Suite</div>
            <button
              id="judge-footer-exit-btn"
              type="button"
              onClick={handleExitDemo}
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit Judge Mode and Return to Normal Workspace
            </button>
          </motion.div>
        </div>
      </PageContainer>

      {/* Intro Modal */}
      <JudgeIntroModal
        open={showIntroModal}
        onOpenChange={setShowIntroModal}
        onStartDemo={handleStartDemo}
        onExitJudgeMode={handleExitDemo}
      />
    </AnimatedPage>
  );
}
