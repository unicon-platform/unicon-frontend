import { useQuery } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { File as UniconFile, ProgrammingTask, RequiredInput, TaskAttemptResult } from "@/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FileEditor from "@/features/problems/components/tasks/file-editor";
import { getTaskAttemptResults, useCreateTaskAttempt, useRerunTaskAttempt } from "@/features/problems/queries";
import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";
import { isUniconFile } from "@/lib/utils";

import TaskResultCard from "./submission-results/task-result";

type AttemptResultsProps = {
  problemId: number; // The problem ID that the task belongs to
  task: ProgrammingTask; // The task that the attempts and results belong to
  attempts: TaskAttemptResult[]; // The task attempt results to display
  rerunAttempt?: (attemptId: number) => void;
};

const AttemptResults: React.FC<AttemptResultsProps> = ({ problemId, task, attempts, rerunAttempt }) => {
  const [selectedResultIdx, setSelectedResultIdx] = useState<number | null>(null);
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number | null>(null);

  // Always default to the latest attempt and the latest result
  useEffect(() => {
    if (attempts.length === 0) return;
    const latestAttemptIdx = attempts.length - 1;
    // NOTE: It is guaranteed that every attempt has at least one result
    const latestResultIdx = attempts[latestAttemptIdx].task_results.length - 1;
    setSelectedAttemptIdx(latestAttemptIdx);
    setSelectedResultIdx(latestResultIdx);
  }, [attempts]);

  // When an attempt is selected, select the latest result
  useEffect(() => {
    if (selectedAttemptIdx === null) return;
    const latestResultIdx = attempts[selectedAttemptIdx].task_results.length - 1;
    setSelectedResultIdx(latestResultIdx);
  }, [selectedAttemptIdx]);

  const selectedAttempt = selectedAttemptIdx !== null ? attempts[selectedAttemptIdx] : null;
  // Sort attempts by recency (by ID which is monotonically increasing)
  const attemptsDesc = [...attempts].sort((a, b) => b.id - a.id);

  const attemptResults = selectedAttempt?.task_results ?? [];
  // Sort results by recency
  // NOTE: Results are stored in ascending (earliest -> latest) order (guaranteed by the API),
  // therefore we reverse the order
  const attemptResultsDesc = [...attemptResults].reverse();
  const selectedResult = selectedResultIdx !== null ? attemptResults[selectedResultIdx] : null;

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex gap-4">
        <Select
          value={selectedAttemptIdx?.toString() ?? ""}
          onValueChange={(value) => setSelectedAttemptIdx(+value)}
          disabled={attempts.length == 0}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select an attempt" />
          </SelectTrigger>
          <SelectContent>
            {attemptsDesc.map((attempt, index) => (
              // The value is the index in reverse order since it is sorted by recency
              <SelectItem key={attempt.id} value={`${attempts.length - index - 1}`}>
                Attempt #{attempts.length - index}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAttempt && attemptResultsDesc && (
          <Select
            key={selectedAttempt.id}
            value={selectedResultIdx?.toString() ?? ""}
            onValueChange={(value) => setSelectedResultIdx(+value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a result" />
            </SelectTrigger>
            <SelectContent>
              {attemptResultsDesc.map((taskResult, index) => (
                // The value is the index in reverse order since it is sorted by recency
                <SelectItem key={taskResult.id} value={`${attemptResultsDesc.length - index - 1}`}>
                  Result #{selectedAttempt.task_results.length - index}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {rerunAttempt && selectedAttempt && (
          <Button onClick={() => rerunAttempt(selectedAttempt.id)}>
            <RefreshCcw />
            Rerun
          </Button>
        )}
      </div>
      {selectedAttemptIdx !== null && selectedAttempt && selectedResult && (
        <TaskResultCard
          title={`Attempt ${selectedAttemptIdx + 1}`}
          taskAttempt={{
            ...selectedAttempt,
            task_results: [selectedResult],
            task: { ...task, problem_id: problemId, autograde: task.autograde ?? false, other_fields: { ...task } },
          }}
          problemId={problemId}
        />
      )}
    </div>
  );
};

type ProgrammingSubmitFormProps = {
  problemId: number;
  task: ProgrammingTask;
  canSubmit: boolean;
};

export const ProgrammingSubmitForm: React.FC<ProgrammingSubmitFormProps> = ({ problemId, task, canSubmit }) => {
  const { data: attempts, refetch: refetchAttempts } = useQuery({
    ...getTaskAttemptResults(problemId, task.id),
    refetchInterval: ({ state: { data } }) =>
      // Only refetch if there is a pending task result
      data?.some((taskAttempt) => taskAttempt.task_results.some((result) => result.status === "PENDING"))
        ? 5000
        : false,
  });

  // Filter required inputs to only include file inputs
  // NOTE: We assume that all required inputs needed for submission are files
  const requiredFileInputs: (Omit<RequiredInput, "data"> & { data: UniconFile })[] = task.required_inputs
    .filter((input) => isUniconFile(input.data))
    .map((input) => ({ ...input, data: input.data as UniconFile }));

  const [fileContents, setFileContents] = useState<Record<string, string>>(
    Object.fromEntries(requiredFileInputs.map(({ id, data }) => [id, (data as UniconFile).content])),
  );

  const rerunAttemptMut = useRerunTaskAttempt(problemId);
  const createAttemptMut = useCreateTaskAttempt(problemId, task.id);

  const handleFileChange = useDebouncedCallback(
    (fileId: string, newContent: string) => setFileContents((prev) => ({ ...prev, [fileId]: newContent })),
    300,
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const submissionData = requiredFileInputs.map((reqInput) => ({
        ...reqInput,
        data: { ...reqInput.data, content: fileContents[reqInput.id] },
      }));
      createAttemptMut.mutate({ task_id: task.id, value: submissionData }, { onSuccess: () => refetchAttempts() });
    },
    [createAttemptMut, fileContents, requiredFileInputs, refetchAttempts],
  );

  return (
    <div className="flex flex-col gap-6">
      {canSubmit && (
        <TaskSection>
          <TaskSectionHeader content="Submission" />
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              {requiredFileInputs.map(({ id, data }) => (
                <FileEditor
                  key={id}
                  className="h-[40vh]"
                  fileName={data.path}
                  fileContent={fileContents[id] || data.content}
                  onFileContentChange={(newContent) => handleFileChange(id, newContent)}
                  canEditFileContent={true}
                />
              ))}
            </div>
            <Button className="mt-6" type="submit" disabled={createAttemptMut.isPending}>
              {createAttemptMut.isPending ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </TaskSection>
      )}
      <TaskSection>
        <TaskSectionHeader content="Results" />
        <AttemptResults
          problemId={problemId}
          task={task}
          attempts={attempts ?? []}
          rerunAttempt={rerunAttemptMut.mutate}
        />
      </TaskSection>
    </div>
  );
};

export default ProgrammingSubmitForm;
