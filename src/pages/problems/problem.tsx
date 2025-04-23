import { useQuery } from "@tanstack/react-query";

import { TaskAttemptPublic, UserPublicWithRolesAndGroups } from "@/api";
import { getProblemById } from "@/features/problems/queries";
import { useProblemId, useProjectId } from "@/features/projects/hooks/use-id";
import { ProblemDescription } from "@/pages/problems/sections/problem-description";
import { ProblemFiles } from "@/pages/problems/sections/problem-files";
import { ProblemHeader } from "@/pages/problems/sections/problem-header";
import { ProblemSubmissionInfo } from "@/pages/problems/sections/problem-submission-info";
import { ProblemTabs } from "@/pages/problems/sections/problem-tabs";
import { ProblemTaskList } from "@/pages/problems/sections/problem-task-list";
import { ProblemTimeline } from "@/pages/problems/sections/problem-timeline";

type ProblemProps = {
  id?: number;
  submissionId?: number;
  submissionUser?: UserPublicWithRolesAndGroups;
  submissionAttempts?: TaskAttemptPublic[];
};

const Problem = ({ id, submissionId, submissionAttempts, submissionUser }: ProblemProps) => {
  const isSubmissionView = submissionId !== undefined;

  const projectId = useProjectId();
  const urlProblemId = useProblemId();
  const problemId = id ?? urlProblemId;

  const { data: problem } = useQuery(getProblemById(problemId));
  if (!problem) return;

  const { edit: canEdit, description, supporting_files } = problem;

  return (
    <div className="flex w-full flex-col gap-4">
      <ProblemHeader problem={problem} projectId={projectId} canEdit={!isSubmissionView && canEdit} />
      {!isSubmissionView && (
        <ProblemTabs
          leaderboardEnabled={problem.leaderboard_enabled ?? false}
          problemId={problemId}
          projectId={projectId}
        />
      )}
      <div className="flex flex-col gap-8">
        <ProblemTimeline startedAt={problem.started_at} endedAt={problem.ended_at} closedAt={problem.closed_at} />
        {isSubmissionView && submissionUser && (
          <ProblemSubmissionInfo projectId={projectId} submissionUser={submissionUser} />
        )}
        <ProblemDescription description={description} />
        <ProblemFiles files={supporting_files} />
        <ProblemTaskList
          problem={problem}
          projectId={projectId}
          isSubmissionView={isSubmissionView}
          submissionAttempts={submissionAttempts}
        />
      </div>
    </div>
  );
};

export default Problem;
