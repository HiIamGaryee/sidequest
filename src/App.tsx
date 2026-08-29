import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { FocusPage } from "@/pages/FocusPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { ProjectDetailPage } from "@/pages/ProjectDetailPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { AchievementsPage } from "@/pages/AchievementsPage";
import { SkillsPage } from "@/pages/SkillsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { JudgeModePage } from "@/pages/JudgeModePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PersistenceProvider, usePersistence } from "@/stores/PersistenceContext";
import { QuestProvider } from "@/stores/QuestContext";
import { FocusProvider } from "@/stores/FocusContext";
import { SideQuestProvider } from "@/stores/SideQuestContext";
import { ContextKeeperProvider } from "@/stores/ContextKeeperContext";
import { RecoveryProvider } from "@/stores/RecoveryContext";
import { GamificationProvider } from "@/stores/GamificationContext";
import { DailyProvider } from "@/stores/DailyContext";
import { BossProvider } from "@/stores/BossContext";
import { ChallengeProvider } from "@/stores/ChallengeContext";
import { SkillProvider } from "@/stores/SkillContext";
import { ThemeProvider } from "@/stores/ThemeContext";
import { WebMcpBridge } from "@/webmcp/WebMcpBridge";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";
import { FirstRunOnboarding } from "@/components/onboarding/FirstRunOnboarding";
import { ActiveSessionRecoveryModal } from "@/components/focus/ActiveSessionRecoveryModal";
import { Toaster } from "@/components/ui/toaster";

function AppContent() {
  const { isHydrated, isFirstRun, completeOnboarding } = usePersistence();
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (isHydrated && isFirstRun) {
      setShowOnboarding(true);
    }
  }, [isHydrated, isFirstRun]);

  if (!isHydrated) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/demo" element={<JudgeModePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ActiveSessionRecoveryModal />
      <Toaster />
      <FirstRunOnboarding
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open);
          if (!open) {
            completeOnboarding();
          }
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PersistenceProvider>
          <GamificationProvider>
            <QuestProvider>
              <FocusProvider>
                <SideQuestProvider>
                  <ContextKeeperProvider>
                    <RecoveryProvider>
                      <DailyProvider>
                        <BossProvider>
                          <ChallengeProvider>
                            <SkillProvider>
                              <WebMcpBridge>
                                <AppContent />
                              </WebMcpBridge>
                            </SkillProvider>
                          </ChallengeProvider>
                        </BossProvider>
                      </DailyProvider>
                    </RecoveryProvider>
                  </ContextKeeperProvider>
                </SideQuestProvider>
              </FocusProvider>
            </QuestProvider>
          </GamificationProvider>
        </PersistenceProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
