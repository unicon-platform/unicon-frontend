import React from "react";

import { ProblemPublic, TaskAttemptPublic } from "@/api";
import TaskCard from "@/features/tasks/components/task-card";

type TaskListProps = {
  problem: ProblemPublic;
  projectId: number;
  submissionAttempts?: TaskAttemptPublic[];
  isSubmissionView?: boolean;
};

export const ProblemTaskList: React.FC<TaskListProps> = ({
  problem,
  projectId,
  isSubmissionView,
  submissionAttempts,
}) => {
  const { make_submission: canSubmit, make_submission_without_limit: canSubmitWithoutLimit } = problem;
  return (
    <div className="flex flex-col gap-8">
      {problem.tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          index={index}
          task={task}
          problemId={problem.id!}
          projectId={projectId}
          canEdit={false}
          canSubmit={!isSubmissionView && canSubmit}
          canSubmitWithoutLimit={!isSubmissionView && canSubmit && canSubmitWithoutLimit}
          submissionAttempt={submissionAttempts?.find((attempt) => attempt.task_id === task.id)}
        />
      ))}
    </div>
  );
};
