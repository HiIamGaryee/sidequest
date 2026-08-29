import * as React from "react";
import { Terminal, ChevronDown, ChevronRight, Play, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { useWebMcp } from "@/hooks/useWebMcp";
import { Button } from "@/components/ui/button";

export function WebMcpDevInspector() {
  // Only render in development mode
  if (!import.meta.env.DEV) return null;

  const { registeredTools, isSupported } = useWebMcp();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedToolName, setSelectedToolName] = React.useState<string | null>(null);
  const [testResult, setTestResult] = React.useState<string | null>(null);
  const [isRunning, setIsRunning] = React.useState(false);

  const selectedTool = registeredTools.find((t) => t.name === selectedToolName) || registeredTools[0];

  const handleTestExecute = async () => {
    if (!selectedTool) return;
    setIsRunning(true);
    setTestResult(null);
    try {
      // Execute with empty object as test input
      const res = await selectedTool.execute({});
      setTestResult(typeof res === "string" ? res : JSON.stringify(res, null, 2));
    } catch (err: any) {
      setTestResult(JSON.stringify({ error: err?.message || String(err) }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="border border-[#27272a] rounded-lg bg-[#09090b] overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between hover:bg-[#18181b]/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-mono font-bold text-[#fafafa]">
            DEV TOOL INSPECTOR (WebMCP)
          </span>
          <span className="text-[10px] font-mono text-[#71717a]">
            [{registeredTools.length} tools registered]
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              isSupported
                ? "bg-[#22c55e]/10 text-[#22c55e]"
                : "bg-amber-500/10 text-amber-400"
            }`}
          >
            {isSupported ? "BROWSER WEBMCP DETECTED" : "FALLBACK / DEV MODE"}
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 text-[#71717a]" /> : <ChevronRight className="w-4 h-4 text-[#71717a]" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-[#27272a] space-y-3 bg-[#09090b]">
          {/* Tool selector pills */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#71717a]">REGISTERED TOOLS:</span>
            <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto p-1 bg-[#18181b] rounded-md border border-[#27272a]">
              {registeredTools.map((tool) => {
                const isSelected = (selectedToolName || registeredTools[0]?.name) === tool.name;
                const isReadOnly = tool.annotations?.readOnlyHint;
                return (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => {
                      setSelectedToolName(tool.name);
                      setTestResult(null);
                    }}
                    className={`px-2 py-0.8 rounded text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? "bg-sky-500 text-black font-bold"
                        : "bg-[#09090b] text-[#a1a1aa] hover:text-[#fafafa] border border-[#27272a]"
                    }`}
                  >
                    <span>{tool.name}</span>
                    {isReadOnly && <span className="opacity-60 text-[8px]">RO</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Tool Details */}
          {selectedTool && (
            <div className="p-3 rounded-lg border border-[#27272a] bg-[#18181b] space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-[#fafafa] text-xs flex items-center gap-2">
                    {selectedTool.name}
                    {selectedTool.annotations?.readOnlyHint && (
                      <span className="text-[9px] px-1 rounded bg-[#09090b] text-sky-400 border border-sky-500/30">
                        readOnly
                      </span>
                    )}
                  </h5>
                  <p className="text-[11px] text-[#a1a1aa] font-sans pt-0.5">
                    {selectedTool.description}
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={handleTestExecute}
                  disabled={isRunning}
                  className="h-7 px-2.5 text-[11px] bg-white text-black hover:bg-neutral-200 cursor-pointer shrink-0"
                >
                  <Play className="w-3 h-3 mr-1" />
                  {isRunning ? "Running..." : "Test Execute"}
                </Button>
              </div>

              {/* JSON Input Schema Preview */}
              {selectedTool.inputSchema && (
                <div className="space-y-1">
                  <span className="text-[9px] text-[#71717a]">INPUT SCHEMA:</span>
                  <pre className="p-2 rounded bg-[#09090b] border border-[#27272a] text-[10px] text-[#a1a1aa] overflow-x-auto max-h-28">
                    {JSON.stringify(selectedTool.inputSchema, null, 2)}
                  </pre>
                </div>
              )}

              {/* Test Run Output */}
              {testResult && (
                <div className="space-y-1 pt-1">
                  <span className="text-[9px] text-[#22c55e] font-bold">TOOL OUTPUT:</span>
                  <pre className="p-2 rounded bg-[#09090b] border border-[#22c55e]/30 text-[10px] text-[#fafafa] overflow-x-auto max-h-44">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
