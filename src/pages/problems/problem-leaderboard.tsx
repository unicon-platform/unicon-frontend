import { useQuery } from "@tanstack/react-query";

import { TaskAttemptPublic } from "@/api";
import { getProblemById } from "@/features/problems/queries";
import { useProblemId, useProjectId } from "@/features/projects/hooks/use-id";
import { ProblemHeader } from "@/pages/problems/sections/problem-header";
import { ProblemTabs } from "@/pages/problems/sections/problem-tabs";

type ProblemProps = {
  id?: number;
  submissionId?: number;
  submissionAttempts?: TaskAttemptPublic[];
  submittedAt?: string;
};

const Problem = ({ id, submissionId }: ProblemProps) => {
  const isSubmissionView = submissionId !== undefined;

  const projectId = useProjectId();
  const urlProblemId = useProblemId();
  const problemId = id ?? urlProblemId;

  const { data: problem } = useQuery(getProblemById(problemId));
  if (!problem) return;

  const { edit: canEdit } = problem;

  return (
    <div className="flex w-full flex-col gap-4">
      <ProblemHeader problem={problem} projectId={projectId} canEdit={!isSubmissionView && canEdit} canSubmit={false} />
      {!isSubmissionView && (
        <ProblemTabs
          leaderboardEnabled={problem.leaderboard_enabled ?? false}
          problemId={problemId}
          projectId={projectId}
        />
      )}
      <div>Placeholder for leaderboard</div>
    </div>
  );
};

export default Problem;
