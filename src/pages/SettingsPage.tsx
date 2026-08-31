import * as React from "react";
import {
  ShieldCheck,
  HardDrive,
  Palette,
  Download,
  Upload,
  Trash2,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Clock,
  Activity,
  Bot,
  AlertTriangle,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTheme } from "@/stores/ThemeContext";
import { usePersistence } from "@/stores/PersistenceContext";
import { useRecovery } from "@/hooks/useRecovery";
import { RECOVERY_INTERVALS } from "@/config/recovery";
import { WebMcpStatusCard } from "@/components/webmcp/WebMcpStatusCard";
import { WebMcpDevInspector } from "@/components/webmcp/WebMcpDevInspector";
import { FirstRunOnboarding } from "@/components/onboarding/FirstRunOnboarding";

export function SettingsPage() {
  const { theme, resolvedTheme, reducedMotion, setReducedMotion } = useTheme();
  const { preferences, updatePreferences } = useRecovery();
  const {
    lastSavedAt,
    isDemoData,
    appSettings,
    updateAppSettings,
    clearLocalData,
    exportData,
    validateBackup,
    importData,
    loadDemoWorkspace,
    resetSettings,
  } = usePersistence();

  const [notification, setNotification] = React.useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = React.useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);
  const [isImportConfirmOpen, setIsImportConfirmOpen] = React.useState(false);
  const [pendingImportContent, setPendingImportContent] = React.useState<string | null>(null);
  const [importFileName, setImportFileName] = React.useState<string>("");
  const [validationResult, setValidationResult] = React.useState<ReturnType<typeof validateBackup> | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setPendingImportContent(content);
        const result = validateBackup(content);
        setValidationResult(result);
        setIsImportConfirmOpen(true);
      }
    };
    reader.readAsText(file);
    // Reset file input value so same file can be chosen again if needed
    e.target.value = "";
  };

  const handleConfirmImport = async () => {
    if (!pendingImportContent) return;
    setIsImportConfirmOpen(false);
    await importData(pendingImportContent);
    setPendingImportContent(null);
    setValidationResult(null);
    setNotification("WORKSPACE RESTORED FROM BACKUP");
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConfirmClear = () => {
    setIsClearConfirmOpen(false);
    setNotification("LOCAL DATA CLEARED. Fresh start. Try not to create 47 side quests immediately.");
    setTimeout(() => {
      clearLocalData();
    }, 1000);
  };

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="Settings"
          description="Control appearance, focus preferences, demo mode, and local-first data storage."
          badge={
            isDemoData ? (
              <StatusBadge status="complete" label="DEMO WORKSPACE" />
            ) : (
              <StatusBadge status="active" label="LOCAL STORAGE" />
            )
          }
        />

        {notification && (
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {notification}
          </div>
        )}

        {/* WebMCP Challenge Judge Suite Callout */}
        <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 text-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px] font-mono font-bold uppercase">
                WEBMCP CHALLENGE
              </span>
              <span className="text-sm font-semibold text-foreground font-mono">Judge Mode Suite</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Launch the isolated demo workspace with 6 copyable prompts, scenario tracker, and live action timeline.
            </p>
          </div>

          <Button
            asChild
            variant="default"
            size="sm"
            className="h-8 px-3 text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer shrink-0"
          >
            <a href="/demo">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Open Judge Mode
            </a>
          </Button>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <SectionCard
            title="Appearance"
            description="Theme preference and interface motion options."
            headerAction={
              <div className="flex items-center gap-1.5 text-[11px] text-[#a1a1aa] font-mono">
                <Palette className="h-3.5 w-3.5" />
                <span className="capitalize">{theme} Theme</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-1">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#fafafa]">Interface Theme</span>
                  <p className="text-[11px] text-[#71717a]">
                    High-contrast dark HUD or crisp light theme
                  </p>
                </div>
                <ThemeToggle variant="segmented" className="segmented-control" />
              </div>

              <Separator className="bg-[#27272a]" />

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#fafafa]">Reduced Motion</span>
                  <p className="text-[11px] text-[#71717a]">
                    Minimize transition animations for distraction-free focus
                  </p>
                </div>
                <div className="segmented-control flex items-center gap-1 bg-[#18181b] p-0.5 rounded-lg border border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setReducedMotion("system")}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                      reducedMotion === "system"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    System
                  </button>
                  <button
                    type="button"
                    onClick={() => setReducedMotion("on")}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                      reducedMotion === "on"
                        ? "bg-emerald-600 text-white shadow-sm font-semibold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Reduced
                  </button>
                  <button
                    type="button"
                    onClick={() => setReducedMotion("off")}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                      reducedMotion === "off"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Standard
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Productivity & Focus Settings */}
          <SectionCard
            title="Focus & Recovery"
            description="Default timer durations and ADHD-friendly health reminders."
            headerAction={
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>{appSettings.defaultFocusMinutes || 25}m Default</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#fafafa]">Default Focus Duration</span>
                  <p className="text-[11px] text-[#71717a]">
                    Standard duration when launching a new Focus Session
                  </p>
                </div>
                <div className="segmented-control segmented-control--solid flex items-center gap-1 bg-[#18181b] p-0.5 rounded-lg border border-[#27272a]">
                  {[15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => updateAppSettings({ defaultFocusMinutes: mins })}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
                        (appSettings.defaultFocusMinutes || 25) === mins
                          ? "bg-emerald-600 text-white font-bold"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <Separator className="bg-[#27272a]" />

              {/* Recovery Reminders Toggle */}
              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#fafafa]">ADHD Health Prompts</span>
                  <p className="text-[11px] text-[#71717a]">
                    Gentle reminders for hydration, movement, eye rest, and breaks
                  </p>
                </div>
                <Switch
                  checked={preferences.enabled}
                  onCheckedChange={(checked) => updatePreferences({ enabled: checked })}
                  aria-label="Toggle recovery reminders"
                />
              </div>

              {preferences.enabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg border border-[#27272a] bg-[#09090b] flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-300 text-[11px]">Water Interval</span>
                      <p className="text-[10px] text-zinc-500 font-mono">Every 45 min</p>
                    </div>
                    <Switch
                      checked={preferences.waterEnabled}
                      onCheckedChange={(c) => updatePreferences({ waterEnabled: c })}
                    />
                  </div>
                  <div className="p-2.5 rounded-lg border border-[#27272a] bg-[#09090b] flex items-center justify-between">
                    <div>
                      <span className="font-medium text-zinc-300 text-[11px]">Movement Interval</span>
                      <p className="text-[10px] text-zinc-500 font-mono">Every 60 min</p>
                    </div>
                    <Switch
                      checked={preferences.movementEnabled}
                      onCheckedChange={(c) => updatePreferences({ movementEnabled: c })}
                    />
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Demo Mode & Tour */}
          <SectionCard
            title="Demo Workspace & Onboarding"
            description="Re-seed the evaluation workspace or replay the product guide."
            headerAction={
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Judging Tools</span>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-950/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-emerald-200">
                      Seed Demo Workspace
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Loads the "WebMCP Challenge" sample project with completed steps, active Main
                    Quest, parked side quests, and XP history.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={loadDemoWorkspace}
                  className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5 font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Load Demo Data
                </Button>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="space-y-0.5">
                  <span className="font-medium text-[#fafafa]">Replay Onboarding Tour</span>
                  <p className="text-[11px] text-[#71717a]">
                    Review the 3 core principles of the single-objective focus workflow
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOnboardingOpen(true)}
                  className="border-[#27272a] text-zinc-300 hover:bg-zinc-800 text-xs gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                  View Tour
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* WebMCP Agent Integration Section */}
          <SectionCard
            title="WebMCP Agent Integration"
            description="Exposes 21 native tools to browser agents via document.modelContext."
            headerAction={
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-mono">
                <Bot className="h-3.5 w-3.5" />
                <span>WebMCP Ready</span>
              </div>
            }
          >
            <div className="space-y-4">
              <WebMcpStatusCard />
              <WebMcpDevInspector />
            </div>
          </SectionCard>

          {/* Data & Privacy Section (Requirements 25-32) */}
          <SectionCard
            title="Data & Privacy"
            description="Export backups, restore previous states, or reset your local workspace."
            headerAction={
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>100% Offline-First</span>
              </div>
            }
          >
            <div className="space-y-4">
              {/* Storage Info Card */}
              <div className="rounded-lg border border-[#27272a] bg-[#09090b] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-sm font-medium text-[#fafafa]">
                      Browser Local Storage
                    </h4>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Namespace: sidequest:v1
                  </span>
                </div>
                <p className="text-xs text-[#71717a] leading-relaxed">
                  SIDEQUEST operates without backend databases or cloud tracking. All projects,
                  quests, focus sessions, and achievements are stored directly in your browser.
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-900">
                  <span>Last Saved:</span>
                  <span>{lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString() : "Live"}</span>
                </div>
              </div>

              {/* Export & Import Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="settings-export-btn w-full border-[#27272a] hover:bg-zinc-800 text-zinc-200 text-xs gap-2 justify-start h-10"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <div className="text-left">
                    <div className="font-medium">Export Backup JSON</div>
                    <div className="text-[10px] text-zinc-500 font-normal">Download full workspace state</div>
                  </div>
                </Button>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".json"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="settings-import-btn w-full border-[#27272a] hover:bg-zinc-800 text-zinc-200 text-xs gap-2 justify-start h-10"
                  >
                    <Upload className="w-4 h-4 text-sky-400" />
                    <div className="text-left">
                      <div className="font-medium">Import Backup JSON</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Restore state from file</div>
                    </div>
                  </Button>
                </div>
              </div>

              <Separator className="bg-[#27272a]" />

              {/* Destructive Clear Local Data */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-red-500/20 bg-red-950/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-200 text-xs">
                      Clear Local Data
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Wipes SIDEQUEST storage keys, resets player profile to Level 1, and returns to a
                    blank state.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsClearConfirmOpen(true)}
                  className="shrink-0 bg-red-600 hover:bg-red-500 text-white text-xs gap-1.5 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Data
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Clear Data Confirmation Dialog */}
        <Dialog open={isClearConfirmOpen} onOpenChange={setIsClearConfirmOpen}>
          <DialogContent className="sm:max-w-md bg-zinc-950 border-red-500/30 text-zinc-100 p-6 shadow-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs tracking-wider uppercase font-bold">
                <AlertTriangle className="w-4 h-4" />
                // CONFIRM DATA DESTRUCTION
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-zinc-100">
                Clear all local SIDEQUEST data?
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
                This will permanently delete all projects, active & completed quests, focus logs,
                parked side quests, and earned XP.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
              💡 Tip: You can click <strong>Export Backup JSON</strong> first to preserve your
              progress before clearing.
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsClearConfirmOpen(false)}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmClear}
                className="bg-red-600 hover:bg-red-500 text-white text-xs gap-1.5 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Clear Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Confirmation Dialog with Validation Preview */}
        <Dialog open={isImportConfirmOpen} onOpenChange={setIsImportConfirmOpen}>
          <DialogContent className="sm:max-w-lg bg-zinc-950 border-sky-500/30 text-zinc-100 p-6 shadow-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-mono text-xs tracking-wider uppercase font-bold">
                <FileCheck className="w-4 h-4" />
                // RESTORE WORKSPACE
              </div>
              <DialogTitle className="text-lg font-bold tracking-tight text-zinc-100">
                Import "{importFileName}"?
              </DialogTitle>
              <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
                {validationResult?.valid
                  ? "Valid backup detected. Review the contents below before restoring."
                  : "Invalid backup file structure. Cannot restore."}
              </DialogDescription>
            </DialogHeader>

            {validationResult && !validationResult.valid && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Validation Error</p>
                  <p className="text-zinc-400">{validationResult.error}</p>
                </div>
              </div>
            )}

            {validationResult?.valid && validationResult.preview && (
              <div className="space-y-3 py-2 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Projects</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.projectsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Quests</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.questsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Quest Steps</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.questStepsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Focus Sessions</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.focusSessionsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Side Quests</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.sideQuestsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-md">
                    <span className="text-zinc-500 block text-[10px] uppercase font-mono">Total XP / Level</span>
                    <span className="text-zinc-100 font-bold font-mono text-base">
                      {validationResult.preview.totalXp} <span className="text-xs text-zinc-400 font-normal">(Lv {validationResult.preview.level})</span>
                    </span>
                  </div>
                </div>

                {validationResult.preview.exportedAt && (
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Exported: {new Date(validationResult.preview.exportedAt).toLocaleString()}
                  </p>
                )}

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-md text-amber-300 text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Warning: Restoring will overwrite current workspace data.</span>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsImportConfirmOpen(false);
                  setPendingImportContent(null);
                  setValidationResult(null);
                }}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!validationResult?.valid}
                onClick={handleConfirmImport}
                className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5 font-medium disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" />
                Confirm & Restore
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Onboarding Dialog */}
        <FirstRunOnboarding
          open={isOnboardingOpen}
          onOpenChange={setIsOnboardingOpen}
        />
      </PageContainer>
    </AnimatedPage>
  );
}
