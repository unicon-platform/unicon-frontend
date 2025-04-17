import { ProgrammingTask, TaskAttemptPublic } from "@/api";
import { ProgrammingEnvironment } from "@/components/tasks/programming-environment";
import ProgrammingSubmitForm from "@/components/tasks/programming-submit";
import TestcaseTabs from "@/features/problems/components/tasks/testcase-tabs";
import TaskContainer from "@/features/tasks/components/task-container";
import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";

export function Programming({
  problemId,
  task,
  canSubmit,
  canSubmitWithoutLimit,
  canEdit,
  submissionAttempt,
}: {
  problemId: number;
  task: ProgrammingTask;
  canSubmit: boolean;
  canSubmitWithoutLimit: boolean;
  canEdit: boolean;
  submissionAttempt?: TaskAttemptPublic;
}) {
  return (
    <TaskContainer title={task.title} description={task.description}>
      <TaskSection>
        <TaskSectionHeader content="Environment" />
        <ProgrammingEnvironment environment={task.environment} />
      </TaskSection>
      <TaskSection>
        <TaskSectionHeader content="Testcases" />
        <div className="flex flex-col gap-2 text-gray-300">
          <TestcaseTabs testcases={task.testcases} edit={false} taskFiles={task.files} />
        </div>
      </TaskSection>
      {!canEdit && (
        <ProgrammingSubmitForm
          problemId={problemId}
          task={task}
          canSubmit={canSubmit}
          canSubmitWithoutLimit={canSubmitWithoutLimit}
          submissionAttempt={submissionAttempt}
        />
      )}
    </TaskContainer>
  );
}
