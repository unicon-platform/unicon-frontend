import { parseISO } from "date-fns";

import { TimeDisplay } from "@/components/ui/time-display";

type ProblemSubmissionInfoProps = {
  submittedAt: string;
};

export const ProblemSubmissionInfo: React.FC<ProblemSubmissionInfoProps> = ({ submittedAt }) => {
  return (
    <div className="flex text-green-400">
      <TimeDisplay label="Submitted At" datetime={parseISO(submittedAt!)} iconName="circle-check-big" />
    </div>
  );
};
