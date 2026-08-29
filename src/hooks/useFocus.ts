import { useFocusContext } from "@/stores/FocusContext";
import { formatTimer, formatOvertime, formatDurationHuman } from "@/lib/focus-utils";

export function useFocus() {
  const context = useFocusContext();

  const formattedTimer = formatTimer(
    context.isOvertime ? context.overtimeSeconds : context.remainingSeconds
  );
  const formattedOvertime = formatOvertime(context.overtimeSeconds);
  const formattedElapsed = formatDurationHuman(context.elapsedSeconds, true);

  return {
    ...context,
    formattedTimer,
    formattedOvertime,
    formattedElapsed,
  };
}
