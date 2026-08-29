import * as React from "react";
import { History as HistoryIcon, Calendar, Flame, CheckCircle2, Sparkles, HeartPulse, Filter } from "lucide-react";
import { AnimatedPage } from "@/components/shared/AnimatedPage";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useFocus } from "@/hooks/useFocus";
import { useQuests } from "@/hooks/useQuests";
import { useRecovery } from "@/hooks/useRecovery";
import { FocusSessionCard } from "@/components/focus/FocusSessionCard";
import { RecoveryHistoryItem } from "@/components/recovery/RecoveryHistoryItem";

const FILTER_TABS = ["All", "Focus", "Recovery"] as const;
const DATE_RANGES = ["All Time", "Today", "This Week"] as const;

function isWithinDateRange(dateString: string | undefined | null, range: (typeof DATE_RANGES)[number]): boolean {
  if (range === "All Time") return true;
  if (!dateString) return false;

  const itemDate = new Date(dateString);
  if (isNaN(itemDate.getTime())) return true;

  const now = new Date();
  
  if (range === "Today") {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return itemDate >= startOfToday;
  }

  if (range === "This Week") {
    const currentDay = now.getDay(); // 0 is Sunday
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distanceToMonday, 0, 0, 0, 0);
    return itemDate >= startOfWeek;
  }

  return true;
}

export function HistoryPage() {
  const [activeFilter, setActiveFilter] = React.useState<(typeof FILTER_TABS)[number]>("All");
  const [activeDateRange, setActiveDateRange] = React.useState<(typeof DATE_RANGES)[number]>("All Time");

  const { focusSessions } = useFocus();
  const { quests } = useQuests();
  const { recoveryLogs } = useRecovery();

  const completedQuests = quests.filter((q) => q.status === "completed");

  const filteredSessions = React.useMemo(() => {
    return focusSessions.filter((s) => isWithinDateRange(s.startedAt, activeDateRange));
  }, [focusSessions, activeDateRange]);

  const filteredRecoveryLogs = React.useMemo(() => {
    return recoveryLogs.filter((r) => isWithinDateRange(r.timestamp, activeDateRange));
  }, [recoveryLogs, activeDateRange]);

  const filteredCompletedQuests = React.useMemo(() => {
    return completedQuests.filter((q) => isWithinDateRange(q.completedAt || q.createdAt, activeDateRange));
  }, [completedQuests, activeDateRange]);

  const totalVictories = filteredSessions.length + filteredCompletedQuests.length + filteredRecoveryLogs.length;

  return (
    <AnimatedPage>
      <PageContainer maxWidth="2xl">
        <PageHeader
          title="History"
          description="Review completed work, focus sprints, and maintenance logs."
          badge={
            <StatusBadge
              status={totalVictories > 0 ? "complete" : "idle"}
              label={totalVictories > 0 ? `${totalVictories} RECORDS` : "NO RECORDS"}
            />
          }
        />

        {/* Filter Navigation Tabs & Date Range Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272a]/60">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#18181b] border border-[#27272a] rounded-lg">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1 text-xs font-mono rounded-md transition-all cursor-pointer ${
                  activeFilter === tab
                    ? "bg-white text-black font-bold shadow-xs"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Range Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#121214] border border-[#27272a] rounded-lg">
            <span className="text-[10px] font-mono text-[#71717a] px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Range:
            </span>
            {DATE_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setActiveDateRange(range)}
                className={`px-2.5 py-0.5 text-xs font-mono rounded transition-all cursor-pointer ${
                  activeDateRange === range
                    ? "bg-sky-600 text-white font-semibold"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* History Log Section */}
        <div className="space-y-6 pt-4">
          {/* Focus Sessions Log */}
          {(activeFilter === "All" || activeFilter === "Focus") && (
            <SectionCard
              title="Focus Sprints"
              description={`Focus sessions completed (${filteredSessions.length} in selected range).`}
              headerAction={
                filteredSessions.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#22c55e]">
                    <Flame className="w-3 h-3" />
                    {filteredSessions.length} logged
                  </span>
                ) : undefined
              }
            >
              {filteredSessions.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {filteredSessions.map((session) => (
                    <FocusSessionCard key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={HistoryIcon}
                  badgeText="No Sprints in Range"
                  title="No focus sessions match current filter"
                  description="Complete a focus sprint on your Main Quest to record your deep work log."
                />
              )}
            </SectionCard>
          )}

          {/* Recovery Maintenance Log */}
          {(activeFilter === "All" || activeFilter === "Recovery") && (
            <SectionCard
              title="Recovery & Maintenance"
              description={`Hydration, movement, and wellness resets logged (${filteredRecoveryLogs.length} in range).`}
              headerAction={
                filteredRecoveryLogs.length > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-white">
                    <HeartPulse className="w-3 h-3" />
                    {filteredRecoveryLogs.length} logged
                  </span>
                ) : undefined
              }
            >
              {filteredRecoveryLogs.length > 0 ? (
                <div className="space-y-2.5 pt-1">
                  {filteredRecoveryLogs.map((log) => (
                    <RecoveryHistoryItem key={log.id} log={log} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={HeartPulse}
                  badgeText="No Recovery in Range"
                  title="No maintenance logged in current range"
                  description="Log water, movement, eye breaks, or pauses to record your physical resets."
                />
              )}
            </SectionCard>
          )}

          {/* Completed Quests Archive */}
          {(activeFilter === "All" || activeFilter === "Focus") && filteredCompletedQuests.length > 0 && (
            <SectionCard
              title="Completed Quests"
              description={`Milestone objectives finished (${filteredCompletedQuests.length} in range).`}
            >
              <div className="space-y-2.5 pt-1">
                {filteredCompletedQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-3.5 bg-[#09090b] border border-[#27272a] rounded-lg flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-white truncate">{quest.title}</p>
                        {quest.description && (
                          <p className="text-[11px] text-[#71717a] truncate">
                            {quest.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-2 py-0.5 rounded shrink-0 font-bold">
                      100% DONE
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </PageContainer>
    </AnimatedPage>
  );
}
