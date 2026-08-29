import { useRecoveryContext } from "@/stores/RecoveryContext";
import {
  formatRecoveryDuration,
  getMinutesSinceRecovery,
  getRecoveryStatusInfo,
} from "@/lib/recovery-utils";
import { RECOVERY_PRIORITY_ORDER, RECOVERY_INTERVALS } from "@/config/recovery";
import type { RecoveryType } from "@/types/recovery";

export function useRecovery() {
  const context = useRecoveryContext();

  const formattedRecoveryTimer = formatRecoveryDuration(context.timerSeconds);
  const minutesSinceMovement = getMinutesSinceRecovery(context.recoveryLogs, "movement");
  const minutesSinceWater = getMinutesSinceRecovery(context.recoveryLogs, "water");

  // Get status info for all types
  const statusInfoList = RECOVERY_PRIORITY_ORDER.map((type) =>
    getRecoveryStatusInfo(context.recoveryLogs, type)
  );

  // Check if any is due
  const dueItems = statusInfoList.filter((item) => item.isDue && context.preferences.enabled);
  const isDueAny = dueItems.length > 0;

  // Find the next closest check
  let nextCheckInfo: { type: RecoveryType; label: string; text: string } | null = null;
  for (const item of statusInfoList) {
    if (item.isDue) {
      nextCheckInfo = {
        type: item.type,
        label: item.label,
        text: `${item.label} due now`,
      };
      break;
    } else if (item.minutesSince !== null) {
      const interval = RECOVERY_INTERVALS[item.type];
      const remaining = Math.max(1, interval - item.minutesSince);
      if (!nextCheckInfo || remaining < 15) {
        nextCheckInfo = {
          type: item.type,
          label: item.label,
          text: `${item.label} in ~${remaining}m`,
        };
      }
    }
  }

  return {
    ...context,
    formattedRecoveryTimer,
    minutesSinceMovement,
    minutesSinceWater,
    statusInfoList,
    dueItems,
    isDueAny,
    nextCheckInfo,
  };
}
