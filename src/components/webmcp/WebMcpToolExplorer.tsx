import * as React from "react";
import {
  Code2,
  Copy,
  Check,
  Search,
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getRegisteredTools } from "@/webmcp/register-tools";
import type { WebMcpToolDefinition } from "@/types/webmcp.d";
import { TOOL_METADATA_MAP } from "@/webmcp/webmcp-utils";
import type { ToolCategory } from "@/types/webmcp";

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All (28)" },
  { id: "WORK", label: "Work & Quests" },
  { id: "FOCUS", label: "Focus Timer" },
  { id: "CONTEXT", label: "Context Keeper" },
  { id: "SIDE QUEST", label: "Side Quests" },
  { id: "RECOVERY", label: "Recovery" },
  { id: "PLAYER", label: "Player & XP" },
];

interface WebMcpToolExplorerProps {
  onSelectToolForTesting?: (toolName: string) => void;
}

export function WebMcpToolExplorer({ onSelectToolForTesting }: WebMcpToolExplorerProps) {
  const [tools, setTools] = React.useState<WebMcpToolDefinition<any, any>[]>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [expandedSchemaTool, setExpandedSchemaTool] = React.useState<string | null>(null);
  const [copiedToolName, setCopiedToolName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setTools(getRegisteredTools());
  }, []);

  const filteredTools = tools.filter((tool) => {
    const meta = TOOL_METADATA_MAP[tool.name] || { category: "WORK", actionType: "read" };
    const matchesCategory =
      selectedCategory === "all" || meta.category === selectedCategory;

    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.title && tool.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleCopySchema = (tool: WebMcpToolDefinition<any, any>) => {
    const schemaObj = {
      name: tool.name,
      title: tool.title,
      description: tool.description,
      annotations: tool.annotations,
      inputSchema: tool.inputSchema,
    };
    navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2)).then(() => {
      setCopiedToolName(tool.name);
      setTimeout(() => {
        setCopiedToolName(null);
      }, 2000);
    });
  };

  const toggleSchema = (toolName: string) => {
    setExpandedSchemaTool((prev) => (prev === toolName ? null : toolName));
  };

  return (
    <section
      id="webmcp-tool-explorer-panel"
      aria-labelledby="tool-explorer-heading"
      className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 dark:text-sky-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 id="tool-explorer-heading" className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-2">
              WebMCP Tool Explorer
              <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-500/20">
                28 Registered Tools
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Explore the exact JSON schema definitions exposed to browser agents via WebMCP.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            id="tool-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools or keywords..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-secondary/40 border border-border/70 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              id={`cat-filter-${cat.id.toLowerCase()}`}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? "bg-sky-500/15 border-sky-500/40 text-sky-500 dark:text-sky-400 font-semibold"
                  : "bg-secondary/20 border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTools.map((tool) => {
          const meta = TOOL_METADATA_MAP[tool.name] || { category: "WORK" as ToolCategory, actionType: "read" as const };
          const isMutation = meta.actionType === "mutation";
          const isExpanded = expandedSchemaTool === tool.name;
          const isCopied = copiedToolName === tool.name;
          const properties = tool.inputSchema?.properties || {};
          const propKeys = Object.keys(properties);

          return (
            <div
              key={tool.name}
              id={`tool-card-${tool.name}`}
              className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-secondary/10 transition-all flex flex-col justify-between gap-2.5"
            >
              <div className="space-y-2">
                {/* Header line */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {tool.name}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border/50">
                        {meta.category}
                      </span>
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                          isMutation
                            ? "bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/30"
                            : "bg-secondary/80 text-muted-foreground border border-border/40"
                        }`}
                      >
                        {isMutation ? "MUTATION" : "READ"}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-foreground/90">
                      {tool.title || tool.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      id={`copy-schema-${tool.name}`}
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopySchema(tool)}
                      className="h-6 px-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                      title="Copy tool JSON schema"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>

                {/* Properties Summary */}
                <div className="text-[11px] font-mono text-muted-foreground/90 bg-secondary/30 p-2 rounded-lg border border-border/40">
                  <span className="font-semibold text-foreground mr-1">Input Parameters:</span>
                  {propKeys.length === 0 ? (
                    <span className="text-muted-foreground italic">None (no arguments required)</span>
                  ) : (
                    <span>
                      {propKeys.map((key, i) => (
                        <span key={key}>
                          <code className="text-sky-500 dark:text-sky-400 font-semibold">{key}</code>
                          {i < propKeys.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => toggleSchema(tool.name)}
                  className="text-xs font-mono text-sky-500 hover:text-sky-400 flex items-center gap-1 cursor-pointer"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  {isExpanded ? "Hide JSON Schema" : "View JSON Schema"}
                </button>

                {onSelectToolForTesting && (
                  <Button
                    id={`test-tool-btn-${tool.name}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectToolForTesting(tool.name)}
                    className="h-6 px-2 text-[10px] font-mono border-sky-500/40 text-sky-500 hover:bg-sky-500/10 cursor-pointer"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Test Tool
                  </Button>
                )}
              </div>

              {/* Collapsible Schema */}
              {isExpanded && (
                <div className="pt-2 border-t border-border/40 animate-in fade-in duration-200">
                  <pre className="p-2.5 rounded-lg bg-background border border-border/60 text-[11px] font-mono overflow-x-auto text-muted-foreground max-h-48">
                    {JSON.stringify(
                      {
                        name: tool.name,
                        title: tool.title,
                        description: tool.description,
                        annotations: tool.annotations,
                        inputSchema: tool.inputSchema,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
