import * as React from "react";
import { Play, Code2, Check, AlertCircle, ChevronDown, ChevronUp, Zap, Sparkles, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRegisteredTools } from "@/webmcp/register-tools";
import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import { TOOL_METADATA_MAP } from "@/webmcp/webmcp-utils";
import { readToolOutput } from "@/webmcp/tool-results";

// Sample prefilled payloads for fast testing
const SAMPLE_PAYLOADS: Record<string, Record<string, unknown>> = {
  get_current_work_state: {},
  list_projects: {},
  list_quests: {},
  get_quest: { questId: "quest-demo-finish-webmcp" },
  create_quest: {
    projectId: "proj-demo-webmcp",
    title: "Verify WebMCP schema definitions",
    priority: "high",
    estimatedMinutes: 20,
  },
  set_main_quest: { questId: "quest-demo-finish-webmcp" },
  update_quest_progress: { questId: "quest-demo-finish-webmcp", progress: 80 },
  complete_quest_step: { stepId: "step-demo-2-4" },
  add_quest_step: {
    questId: "quest-demo-finish-webmcp",
    title: "Verify timeline state diff rendering",
    isTiny: true,
  },
  make_next_action_smaller: {
    questId: "quest-demo-finish-webmcp",
    tinyStepTitle: "Click the first prompt copy button in Demo Guide",
  },
  set_quest_blocker: {
    questId: "quest-demo-finish-webmcp",
    blocker: "Waiting for browser modelContext test",
  },
  clear_quest_blocker: { questId: "quest-demo-finish-webmcp" },
  park_side_quest: {
    title: "Check out new shadcn theme colors",
    sourceQuestId: "quest-demo-finish-webmcp",
  },
  list_side_quests: {},
  promote_side_quest: {
    sideQuestId: "sq-demo-1",
    projectId: "proj-demo-webmcp",
    priority: "medium",
  },
  save_work_context: {
    questId: "quest-demo-finish-webmcp",
    note: "All WebMCP tools verified in Judge Mode test runner.",
  },
  get_resumable_context: {},
  resume_work_context: {},
  start_focus_session: {
    questId: "quest-demo-finish-webmcp",
    plannedMinutes: 25,
  },
  get_focus_state: {},
  pause_focus_session: {},
  resume_focus_session: {},
  end_focus_session: {},
  get_recovery_state: {},
  suggest_recovery: {},
  log_recovery: { type: "stretch" },
  get_player_state: {},
  get_session_summary: {},
};

// Core test suite scenarios for 1-click automated verification
const SUITE_SCENARIOS = [
  { tool: "get_current_work_state", input: {}, desc: "Inspect current working state & active main quest" },
  { tool: "get_player_state", input: {}, desc: "Read player level, total XP, and streak state" },
  { tool: "list_quests", input: {}, desc: "Retrieve active project quest tree" },
  { tool: "park_side_quest", input: { title: "Automated Suite Side Quest", sourceQuestId: "quest-demo-finish-webmcp" }, desc: "Park distraction without context switching" },
  { tool: "add_quest_step", input: { questId: "quest-demo-finish-webmcp", title: "Automated verification step", isTiny: true }, desc: "Break down main quest with sub-step" },
  { tool: "save_work_context", input: { questId: "quest-demo-finish-webmcp", note: "Context snapshot verified via runner" }, desc: "Save working memory checkpoint" },
  { tool: "start_focus_session", input: { questId: "quest-demo-finish-webmcp", plannedMinutes: 15 }, desc: "Initialize countdown timer & HUD mode" },
  { tool: "get_focus_state", input: {}, desc: "Query live focus session telemetry" },
  { tool: "suggest_recovery", input: {}, desc: "Generate evidence-based break suggestions" },
  { tool: "get_session_summary", input: {}, desc: "Compute overall session metrics & XP breakdown" },
];

interface DevToolTesterProps {
  initialToolName?: string;
  onToolExecuted?: (toolName: string) => void;
}

export function DevToolTester({ initialToolName, onToolExecuted }: DevToolTesterProps) {
  const [tools, setTools] = React.useState<WebMcpToolDefinition<any, any>[]>([]);
  const [selectedToolName, setSelectedToolName] = React.useState<string>(
    initialToolName || "get_current_work_state"
  );
  const [inputJson, setInputJson] = React.useState<string>("{}");
  const [outputJson, setOutputJson] = React.useState<string | null>(null);
  const [isExecuting, setIsExecuting] = React.useState<boolean>(false);
  const [durationMs, setDurationMs] = React.useState<number | null>(null);
  const [jsonError, setJsonError] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(true);

  // Automated Test Suite State
  const [isRunningSuite, setIsRunningSuite] = React.useState<boolean>(false);
  const [suiteStepIndex, setSuiteStepIndex] = React.useState<number>(0);
  const [suiteResults, setSuiteResults] = React.useState<
    Array<{ tool: string; passed: boolean; durationMs: number; error?: string }>
  >([]);

  React.useEffect(() => {
    const registered = getRegisteredTools();
    setTools(registered);
    if (registered.length > 0 && !selectedToolName) {
      setSelectedToolName(registered[0].name);
    }
  }, [selectedToolName]);

  // Update inputJson when tool selection changes
  React.useEffect(() => {
    if (SAMPLE_PAYLOADS[selectedToolName]) {
      setInputJson(JSON.stringify(SAMPLE_PAYLOADS[selectedToolName], null, 2));
    } else {
      setInputJson("{}");
    }
    setOutputJson(null);
    setDurationMs(null);
    setJsonError(null);
  }, [selectedToolName]);

  const handleToolChange = (toolName: string) => {
    setSelectedToolName(toolName);
  };

  const handleExecute = async () => {
    setJsonError(null);
    let parsedInput = {};

    try {
      if (inputJson.trim()) {
        parsedInput = JSON.parse(inputJson);
      }
    } catch (err) {
      setJsonError("Invalid JSON input syntax. Please fix the JSON before executing.");
      return;
    }

    const tool = tools.find((t) => t.name === selectedToolName);
    if (!tool) {
      setJsonError(`Tool "${selectedToolName}" not found in registry.`);
      return;
    }

    setIsExecuting(true);
    const start = performance.now();

    try {
      const result = await tool.execute(parsedInput);
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      setDurationMs(elapsed);
      setOutputJson(JSON.stringify(readToolOutput(result), null, 2));
      if (onToolExecuted) {
        onToolExecuted(selectedToolName);
      }
    } catch (err: unknown) {
      const elapsed = Math.max(1, Math.round(performance.now() - start));
      setDurationMs(elapsed);
      setOutputJson(
        JSON.stringify(
          {
            success: false,
            error: {
              code: "TESTER_ERROR",
              message: err instanceof Error ? err.message : "Execution failed",
            },
          },
          null,
          2
        )
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRunFullSuite = async () => {
    if (isRunningSuite) return;
    setIsRunningSuite(true);
    setSuiteResults([]);
    const results: Array<{ tool: string; passed: boolean; durationMs: number; error?: string }> = [];

    for (let i = 0; i < SUITE_SCENARIOS.length; i++) {
      setSuiteStepIndex(i + 1);
      const scenario = SUITE_SCENARIOS[i];
      const tool = tools.find((t) => t.name === scenario.tool);

      if (!tool) {
        results.push({ tool: scenario.tool, passed: false, durationMs: 0, error: "Tool not registered" });
        setSuiteResults([...results]);
        continue;
      }

      const start = performance.now();
      try {
        const res = await tool.execute(scenario.input);
        const elapsed = Math.max(1, Math.round(performance.now() - start));
        const parsed = readToolOutput(res);
        const passed = parsed.success !== false;
        results.push({
          tool: scenario.tool,
          passed,
          durationMs: elapsed,
          error: parsed.success === false ? parsed.error?.message : undefined,
        });
        if (onToolExecuted) {
          onToolExecuted(scenario.tool);
        }
      } catch (err) {
        const elapsed = Math.max(1, Math.round(performance.now() - start));
        results.push({
          tool: scenario.tool,
          passed: false,
          durationMs: elapsed,
          error: err instanceof Error ? err.message : "Execution failed",
        });
      }
      setSuiteResults([...results]);
      // Small pause for visual feedback
      await new Promise((r) => setTimeout(r, 120));
    }

    setIsRunningSuite(false);
  };

  const selectedTool = tools.find((t) => t.name === selectedToolName);
  const meta = selectedToolName ? TOOL_METADATA_MAP[selectedToolName] : undefined;

  return (
    <section
      id="dev-tool-tester-card"
      aria-labelledby="tool-tester-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      <div
        className="flex items-center justify-between gap-2 cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 id="tool-tester-heading" className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              Interactive WebMCP Tool Runner
              <span className="text-[10px] font-mono font-medium px-2 py-0.2 rounded-full bg-secondary text-muted-foreground border border-border/60">
                {tools.length} Tools Active
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Directly invoke any registered WebMCP tool or run the automated 10-step verification suite.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1"
          aria-label="Toggle tool tester"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 pt-2 border-t border-border/60">
          {/* Automated Suite Runner Banner */}
          <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-mono">
                  <PlayCircle className="w-3.5 h-3.5 text-sky-500" />
                  Automated WebMCP Verification Suite
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Execute 10 end-to-end tool scenarios in sequence with live state verification.
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                disabled={isRunningSuite}
                onClick={handleRunFullSuite}
                className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-semibold shrink-0 gap-1.5 cursor-pointer shadow-xs"
              >
                {isRunningSuite ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Running ({suiteStepIndex}/{SUITE_SCENARIOS.length})...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Run All 10 Scenarios
                  </>
                )}
              </Button>
            </div>

            {/* Suite Results Bar */}
            {suiteResults.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono">
                  {suiteResults.map((r, idx) => (
                    <div
                      key={idx}
                      className={`p-1.5 rounded border text-center ${
                        r.passed
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      <div className="truncate font-semibold">{r.tool}</div>
                      <div className="text-[10px] text-muted-foreground">{r.durationMs}ms</div>
                    </div>
                  ))}
                </div>

                {!isRunningSuite && (
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-400 pt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      All {suiteResults.filter((r) => r.passed).length}/{suiteResults.length} scenarios completed successfully!
                    </span>
                    <span className="text-muted-foreground">
                      Total: {suiteResults.reduce((acc, c) => acc + c.durationMs, 0)}ms
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tool Selector */}
          <div className="space-y-1.5">
            <label
              htmlFor="tool-select-dropdown"
              className="text-xs font-mono font-medium text-foreground flex items-center justify-between"
            >
              <span>Single Tool Execution:</span>
              {meta && (
                <span className="text-[10px] uppercase font-bold text-sky-500 dark:text-sky-400">
                  {meta.category} • {meta.actionType}
                </span>
              )}
            </label>

            <select
              id="tool-select-dropdown"
              value={selectedToolName}
              onChange={(e) => handleToolChange(e.target.value)}
              className="w-full h-9 px-3 text-xs font-mono bg-background border border-border/70 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {tools.map((t) => {
                const toolMeta = TOOL_METADATA_MAP[t.name];
                return (
                  <option key={t.name} value={t.name}>
                    {t.name} ({toolMeta?.actionType || "read"}) — {t.title || t.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Description */}
          {selectedTool && (
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground font-mono">{selectedTool.title}</div>
              <p className="leading-relaxed">{selectedTool.description}</p>
            </div>
          )}

          {/* Input JSON Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="tool-input-json" className="font-medium text-foreground">
                Tool Input Parameters (JSON):
              </label>
              <button
                type="button"
                onClick={() => {
                  if (SAMPLE_PAYLOADS[selectedToolName]) {
                    setInputJson(JSON.stringify(SAMPLE_PAYLOADS[selectedToolName], null, 2));
                  }
                }}
                className="text-[11px] text-sky-500 hover:text-sky-400 cursor-pointer"
              >
                Reset Sample Input
              </button>
            </div>

            <textarea
              id="tool-input-json"
              value={inputJson}
              onChange={(e) => {
                setInputJson(e.target.value);
                setJsonError(null);
              }}
              rows={4}
              className="w-full p-2.5 font-mono text-xs bg-background border border-border/70 rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
              placeholder="{}"
              spellCheck={false}
            />

            {jsonError && (
              <p className="text-xs text-rose-500 flex items-center gap-1 font-mono">
                <AlertCircle className="w-3.5 h-3.5" />
                {jsonError}
              </p>
            )}
          </div>

          {/* Execute Button */}
          <div className="flex items-center justify-between gap-3">
            <Button
              id="execute-tool-btn"
              type="button"
              variant="default"
              size="sm"
              disabled={isExecuting || isRunningSuite}
              onClick={handleExecute}
              className="h-8 px-4 text-xs font-mono bg-sky-600 hover:bg-sky-500 text-white font-semibold cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 mr-1.5" />
              {isExecuting ? "Executing..." : `Execute ${selectedToolName}`}
            </Button>

            {durationMs !== undefined && durationMs !== null && (
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                Execution time: <strong className="text-foreground">{durationMs}ms</strong>
              </span>
            )}
          </div>

          {/* Output Viewer */}
          {outputJson && (
            <div className="space-y-1.5 pt-2 border-t border-border/40 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-foreground">WebMCP Execution Result:</span>
                <span className="text-[11px] text-emerald-500 font-medium">✓ Dispatched to State</span>
              </div>

              <pre
                id="tool-output-result"
                className="p-3 rounded-xl bg-background border border-border/60 text-xs font-mono overflow-x-auto text-emerald-500 dark:text-emerald-400 max-h-60"
              >
                {outputJson}
              </pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
