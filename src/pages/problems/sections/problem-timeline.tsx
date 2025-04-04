import { parseISO } from "date-fns";

import { TimeDisplay } from "@/components/ui/time-display";

type ProblemTimelineProps = {
  startedAt?: string | null;
  endedAt?: string | null;
  closedAt?: string | null;
};

export const ProblemTimeline: React.FC<ProblemTimelineProps> = ({ startedAt, endedAt, closedAt }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-medium">Timeline</div>
      <div className="flex flex-wrap items-center gap-2">
        {startedAt && <TimeDisplay label="Release Date" datetime={parseISO(startedAt)} iconName="calendar" />}
        {endedAt && <TimeDisplay label="Due Date" datetime={parseISO(endedAt)} iconName="alarm-clock" />}
        {closedAt && <TimeDisplay label="Lock Date" datetime={parseISO(closedAt)} iconName="lock-keyhole" />}
      </div>
    </div>
  );
};
