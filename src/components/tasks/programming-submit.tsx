import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CheckIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  RefreshCcw,
  RefreshCwIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { createFile, File as UniconFile, ProgrammingTask, RequiredInput, TaskAttemptPublic } from "@/api";
import { ErrorAlert } from "@/components/form/fields";
import TaskResultCard from "@/components/tasks/submission-results/task-result";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { REFETCH_ATTEMPTS_INTERVAL_MS } from "@/constants";
import FileEditor from "@/features/problems/components/tasks/file-editor";
import {
  getTaskAttemptResults,
  getTaskVersionsById,
  useCreateTaskAttempt,
  useMarkTaskAttemptForSubmission,
  useRerunTaskAttempt,
  useUnmarkTaskAttemptForSubmission,
} from "@/features/problems/queries";
import { SelectedTaskIdContext } from "@/features/tasks/components/task-card";
import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";
import { downloadFile, formatFileSize, isTextFile } from "@/lib/files";
import { groupBy, isUniconFile } from "@/lib/utils";
import { useUserStore } from "@/store/user/user-store-provider";
import { formatDateShort } from "@/utils/date";

type FileCardProps = {
  file: File;
  onRemove: () => void;
};

const FileCard: React.FC<FileCardProps> = ({ file, onRemove }) => {
  return (
    <div className="w-fit rounded-md border p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-md bg-primary/10 p-4">
          <FileIcon className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between gap-4">
            <h3 className="text-lg font-medium">{file.name}</h3>
            <Button variant="ghost" size="icon" type="button" onClick={onRemove}>
              <XIcon />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Size</p>
              <p className="text-sm">{formatFileSize(file.size)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm">{file.type || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Modified</p>
              <p className="text-sm">{formatDateShort(file.lastModified)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type EditorProps = {
  fileName: string;
  currentContent: string | File | UniconFile | null;
  defaultContent: File | UniconFile;
  onFileContentChange: (newContent: string | File | UniconFile) => void;
  readOnly?: boolean;
};

const Editor: React.FC<EditorProps> = ({ fileName, currentContent, defaultContent, onFileContentChange, readOnly }) => {
  const [content, setContent] = useState<string | File | UniconFile>(currentContent ?? defaultContent);

  useEffect(() => {
    if (currentContent === null) return;
    setContent(currentContent);
    onFileContentChange(currentContent);
  }, [currentContent]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isTextFile(file)) {
      // If file is a text file, extract text content directly
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setContent(fileContent);
        onFileContentChange(fileContent);
      };
      reader.readAsText(file);
    } else {
      setContent(file);
      onFileContentChange(file);
    }
  };

  const resetFile = useCallback(() => {
    setContent(defaultContent);
    onFileContentChange(defaultContent);
  }, [onFileContentChange]);

  const onFileEditorContentChange = useDebouncedCallback((newContent: string) => {
    setContent(newContent);
    onFileContentChange(newContent);
  }, 300);

  const renderContent = (data: string | File | UniconFile) => {
    if (data instanceof File) {
      return <FileCard file={data} onRemove={resetFile} />;
    } else if (isUniconFile(data) && data.on_minio) {
      return (
        <div className="flex w-fit items-center gap-4 rounded-md border p-4">
          <div className="rounded-md bg-primary/10 p-4">
            <FileIcon className="h-4 w-4" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-medium">{data.path}</h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" type="button" onClick={() => downloadFile(data.key!)}>
                <DownloadIcon />
              </Button>
              <Button variant="ghost" size="icon" type="button" onClick={resetFile}>
                <XIcon />
              </Button>
            </div>
          </div>
        </div>
      );
    } else if (isUniconFile(data) && data.is_binary) {
      return (
        <div className="mt-2 flex w-fit items-center gap-2 text-sm">
          {readOnly ? (
            <span>No file is uploaded</span>
          ) : (
            <>
              <UploadIcon className="h-4 w-4" />
              <span>Click the upload button to select and upload your file</span>
            </>
          )}
        </div>
      );
    }

    return (
      <FileEditor
        className="h-[40vh]"
        fileName={fileName}
        fileContent={isUniconFile(data) ? data.content : data}
        onFileContentChange={onFileEditorContentChange}
        canEditFileContent={!readOnly}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileTextIcon size={20} />
          <h3 className="font-medium">{fileName}</h3>
        </div>
        {!readOnly && (
          <TooltipProvider>
            <Tooltip>
              <TooltipContent side="right" align="center">
                <p>
                  Upload a file<br></br>
                  The file name does not need to be same, it will be renamed automatically
                </p>
              </TooltipContent>
              <input type="file" style={{ display: "none" }} ref={fileInputRef} onChange={handleFileUpload} />
              <TooltipTrigger asChild type="button">
                {/* Proxy click event to HTML input element above */}
                <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <UploadIcon size={10} />
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        )}
        {!readOnly &&
          isUniconFile(defaultContent) &&
          defaultContent.size_limit !== undefined &&
          defaultContent.size_limit > 0 && (
            <span className="text-sm text-muted-foreground">
              Size limit: {formatFileSize(defaultContent.size_limit * 1024)}
            </span>
          )}
        {!readOnly && (
          <Button variant="ghost" className="rounded-full border px-3 text-xs" type="button" onClick={resetFile}>
            <RefreshCwIcon size={1} />
            Reset
          </Button>
        )}
      </div>
      {renderContent(content)}
    </div>
  );
};

type ProgrammingSubmitFormProps = {
  problemId: number;
  task: ProgrammingTask;
  canSubmit: boolean;
  canSubmitWithoutLimit: boolean;
  submissionAttempt?: TaskAttemptPublic;
};

export const ProgrammingSubmitForm: React.FC<ProgrammingSubmitFormProps> = ({
  problemId,
  task,
  canSubmit,
  canSubmitWithoutLimit,
  submissionAttempt,
}) => {
  const user = useUserStore((store) => store.user)!;

  const { data, refetch: refetchAttempts } = useQuery({
    ...getTaskAttemptResults(problemId, task.id, submissionAttempt ? submissionAttempt.user_id : user.id),
    refetchInterval: ({ state: { data } }) =>
      // Only refetch if there is a pending task result
      data?.some((taskAttempt) => taskAttempt.task_results.some((result) => result.status === "PENDING"))
        ? REFETCH_ATTEMPTS_INTERVAL_MS
        : false,
  });

  const attempts = data ?? [];
  // Sort attempts by recency (by ID which is monotonically increasing)
  const attemptsDesc = [...attempts].sort((a, b) => b.id - a.id).map((attempt, index) => ({ ...attempt, index }));

  // Filter required inputs to only include file inputs
  // NOTE: We assume that all required inputs needed for submission are files
  const requiredFileInputs: (Omit<RequiredInput, "data"> & { data: UniconFile })[] = task.required_inputs
    .filter((input) => isUniconFile(input.data))
    .map((input) => ({ ...input, data: input.data as UniconFile }));

  const [fileContents, setFileContents] = useState<Record<string, string | File | UniconFile>>(
    Object.fromEntries(requiredFileInputs.map(({ id, data }) => [id, data])),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedResultIdx, setSelectedResultIdx] = useState<number | null>(null);
  const [selectedAttemptIdx, setSelectedAttemptIdx] = useState<number | null>(null);

  // Always default to the latest attempt and the latest result
  useEffect(() => {
    if (attemptsDesc.length === 0) return;
    const submissionAttemptIdx = attemptsDesc.findIndex((attempt) => attempt.id === submissionAttempt?.id);
    setSelectedAttemptIdx(submissionAttemptIdx !== -1 ? submissionAttemptIdx : (selectedAttemptIdx ?? 0));
    setSelectedResultIdx(0);
  }, [attempts, submissionAttempt]);

  // When an attempt is selected, select the latest result
  useEffect(() => {
    if (selectedAttemptIdx === null) return;
    setSelectedResultIdx(0);
  }, [selectedAttemptIdx]);

  // Group by task_id
  const groupedAttempts = groupBy(attemptsDesc, (attempt) => attempt.task_id);
  const { data: taskVersionIds } = useQuery(getTaskVersionsById(problemId, task.id));
  const taskVersionCount = taskVersionIds?.length ?? 0;
  const selectedAttempt = selectedAttemptIdx !== null ? attemptsDesc[selectedAttemptIdx] : null;

  // Sort results by recency (by ID which is monotonically increasing)
  const attemptResultsDesc = [...(selectedAttempt?.task_results ?? [])].sort((a, b) => b.id - a.id);
  const selectedResult = selectedResultIdx !== null ? attemptResultsDesc[selectedResultIdx] : null;

  const selectAttemptUserInputs = selectedAttempt?.other_fields["user_input"] as Array<RequiredInput>;
  // Map of IDs to user inputs
  const userInputs = Object.fromEntries(selectAttemptUserInputs?.map((input) => [input.id, input.data]) ?? []);

  const createAttemptMut = useCreateTaskAttempt(problemId, task.id);

  const rerunAttemptMut = useRerunTaskAttempt(problemId);
  const { selectedTaskVersionId, setSelectedTaskVersionId } = useContext(SelectedTaskIdContext)!;
  const rerunAttempt = (attemptId: number) => {
    rerunAttemptMut.mutate(attemptId, {
      onError: () => setError("Failed to rerun attempt"),
      onSuccess: () => setError(""),
    });
  };

  const submitAttemptMut = useMarkTaskAttemptForSubmission(problemId);
  const unSubmitAttemptMut = useUnmarkTaskAttemptForSubmission(problemId);

  const submitAttempt = (attemptId: number) => {
    submitAttemptMut.mutate(attemptId, {
      onError: () => setError("Failed to mark attempt for submission"),
      onSuccess: () => setError(""),
    });
  };

  const unSubmitAttempt = (attemptId: number) => {
    unSubmitAttemptMut.mutate(attemptId, {
      onError: () => setError("Failed to unmark attempt for submission"),
      onSuccess: () => setError(""),
    });
  };

  const handleMarkForSubmission = (attemptId: number) => (checked: boolean) =>
    checked ? submitAttempt(attemptId) : unSubmitAttempt(attemptId);

  const debouncedSetFileContents = useDebouncedCallback(
    (fileId: string, newContent: string | File | UniconFile) =>
      setFileContents((prev) => ({ ...prev, [fileId]: newContent })),
    300,
  );
  const handleFileChange = (fileId: string) => (newContent: string | File | UniconFile) =>
    debouncedSetFileContents(fileId, newContent);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        const submissionPromises = requiredFileInputs.map(async (reqInput) => {
          const content = fileContents[reqInput.id];
          if (content instanceof File) {
            const response = await createFile({ body: { file: content } });
            return { ...reqInput, data: { ...reqInput.data, key: response.data, content: "", on_minio: true } };
          } else if (isUniconFile(content)) {
            return { ...reqInput, data: { ...content } };
          } else {
            return { ...reqInput, data: { ...reqInput.data, content } };
          }
        });
        const submissionData = await Promise.all(submissionPromises);
        createAttemptMut.mutate(
          { task_id: task.id, value: submissionData },
          {
            onSuccess: () => {
              setError("");
              setSelectedAttemptIdx(null);
              refetchAttempts();
            },
            onError: (error) => {
              setIsSubmitting(false);
              if (error instanceof AxiosError) {
                setError(error.response?.data?.detail ?? "An error occurred while submitting the task.");
              }
            },
            onSettled: () => setIsSubmitting(false),
          },
        );
      } catch (error) {
        console.error("Error during submission:", error);
        setIsSubmitting(false);
      }
    },
    [createAttemptMut, fileContents, requiredFileInputs, refetchAttempts, task.id],
  );

  useEffect(() => {
    if (selectedAttempt && selectedAttempt.task_id !== selectedTaskVersionId) {
      const newSelectedAttemptIdx = attemptsDesc.findIndex((attempt) => attempt.task_id === selectedTaskVersionId);
      setSelectedAttemptIdx(newSelectedAttemptIdx === -1 ? null : newSelectedAttemptIdx);
    }
  }, [selectedTaskVersionId, selectedAttempt, attemptsDesc]);

  const hasLimit = typeof task.max_attempts === "number";

  const attemptsLeft = hasLimit
    ? Math.max((task.max_attempts as number) - (attempts.filter((attempt) => !attempt.invalidated).length ?? 0), 0)
    : Number.MAX_SAFE_INTEGER;
  const isOutOfAttempts = !canSubmitWithoutLimit && attemptsLeft === 0;
  const isUpdatedTask = !task.updated_version_id;
  const submitLabel =
    "Run Code" +
    (hasLimit && !canSubmitWithoutLimit ? ` (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left)` : "");

  return (
    <div className="flex flex-col gap-6">
      <TaskSection>
        <TaskSectionHeader content="Submission" />
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            {requiredFileInputs.map(({ id, data: templateContent }) => (
              <Editor
                key={id}
                fileName={templateContent.path}
                currentContent={(userInputs[id] as UniconFile) ?? null}
                defaultContent={templateContent}
                onFileContentChange={handleFileChange(id)}
                readOnly={!canSubmit}
              />
            ))}
          </div>
          {canSubmit && error && <ErrorAlert message={error} className="mt-2 whitespace-pre font-mono" />}
          {canSubmit &&
            (isUpdatedTask ? (
              <Button
                className="mt-6"
                type="submit"
                disabled={createAttemptMut.isPending || isOutOfAttempts || !isUpdatedTask}
              >
                {isSubmitting ? "Submitting..." : submitLabel}
              </Button>
            ) : (
              <Button
                className="mt-6"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (taskVersionIds) {
                    setSelectedTaskVersionId(taskVersionIds[0]);
                  }
                }}
              >
                Switch to latest version to submit code
              </Button>
            ))}
        </form>
      </TaskSection>
      <TaskSection>
        <TaskSectionHeader content="Results" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedAttemptIdx?.toString() ?? ""}
              onValueChange={(value) => {
                setSelectedAttemptIdx(+value);
                setSelectedTaskVersionId(attemptsDesc[+value].task_id);
              }}
              disabled={attempts === undefined || attempts.length == 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an attempt" />
              </SelectTrigger>
              <SelectContent>
                {taskVersionIds?.map((taskId, index) => (
                  <SelectGroup key={taskId}>
                    <SelectLabel className="text-xs text-primary/50">
                      Version {taskVersionCount - index} {index === 0 ? " (Latest)" : ""}
                    </SelectLabel>
                    {(groupedAttempts[taskId] ?? []).length === 0 && (
                      <SelectItem disabled value="-1">
                        No attempts
                      </SelectItem>
                    )}
                    {groupedAttempts[taskId]?.map((attempt) => (
                      <SelectItem key={attempt.id} value={`${attempt.index}`}>
                        <div className="flex items-center gap-2">
                          Attempt #{attempts.length - attempt.index}{" "}
                          {attempt.marked_for_submission && <CheckIcon className="h-4 w-4 text-success" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            {selectedAttempt && attemptResultsDesc.length > 0 && (
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
                    <SelectItem key={taskResult.id} value={`${index}`}>
                      Result #{selectedAttempt.task_results.length - index}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedAttempt && (
              <Button type="button" onClick={() => rerunAttempt(selectedAttempt.id)}>
                <RefreshCcw />
                Rerun
              </Button>
            )}
            {!submissionAttempt && selectedAttempt && isUpdatedTask && (
              <div className="flex items-center gap-2">
                <span>Mark for submission</span>
                <Switch
                  id={`submit-toggle-${selectedAttempt.id}`}
                  checked={selectedAttempt.marked_for_submission}
                  onCheckedChange={handleMarkForSubmission(selectedAttempt.id)}
                />
              </div>
            )}
          </div>
          {/* When the task version first changes, it renders the task before the useEffect to change the task_attempt id.
            Hence `selectedAttempt.task_id === selectedTaskVersionId` is to make sure the website doesn't crash when that happens.
          */}
          {selectedAttemptIdx !== null && selectedAttempt && selectedAttempt.task_id === selectedTaskVersionId && (
            <TaskResultCard
              title={`Attempt ${attemptsDesc.length - selectedAttemptIdx}`}
              taskAttempt={{
                ...selectedAttempt,
                task: { ...task, problem_id: problemId, autograde: task.autograde ?? false, other_fields: { ...task } },
              }}
              attemptResult={selectedResult}
              attempts={attemptsDesc}
              problemId={problemId}
            />
          )}
        </div>
      </TaskSection>
    </div>
  );
};

export default ProgrammingSubmitForm;
