import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { DownloadIcon, FileIcon, FileTextIcon, RefreshCcw, UploadIcon, XIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { createFile, File as UniconFile, ProgrammingTask, RequiredInput } from "@/api";
import { ErrorAlert } from "@/components/form/fields";
import TaskResultCard from "@/components/tasks/submission-results/task-result";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FileEditor from "@/features/problems/components/tasks/file-editor";
import { getTaskAttemptResults, useCreateTaskAttempt, useRerunTaskAttempt } from "@/features/problems/queries";
import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";
import { downloadFile, formatFileSize, isTextFile } from "@/lib/files";
import { isUniconFile } from "@/lib/utils";
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
};

const Editor: React.FC<EditorProps> = ({ fileName, currentContent, defaultContent, onFileContentChange }) => {
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
    }

    return (
      <FileEditor
        className="h-[40vh]"
        fileName={fileName}
        fileContent={isUniconFile(data) ? data.content : data}
        onFileContentChange={onFileContentChange}
        canEditFileContent={true}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FileTextIcon size={20} />
          <h3 className="font-medium">{fileName}</h3>
        </div>
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
};

export const ProgrammingSubmitForm: React.FC<ProgrammingSubmitFormProps> = ({
  problemId,
  task,
  canSubmit,
  canSubmitWithoutLimit,
}) => {
  const { data, refetch: refetchAttempts } = useQuery({
    ...getTaskAttemptResults(problemId, task.id),
    refetchInterval: ({ state: { data } }) =>
      // Only refetch if there is a pending task result
      data?.some((taskAttempt) => taskAttempt.task_results.some((result) => result.status === "PENDING"))
        ? 5000
        : false,
  });

  const attempts = data ?? [];

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
    if (attempts.length === 0) return;
    // NOTE: If there is a selected attempt, we don't want to change it
    const latestAttemptIdx = selectedAttemptIdx ?? attempts.length - 1;
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

  // Sort attempts by recency (by ID which is monotonically increasing)
  const attemptsDesc = [...attempts].sort((a, b) => b.id - a.id);
  const selectedAttempt = selectedAttemptIdx !== null ? attempts[selectedAttemptIdx] : null;

  const attemptResults = selectedAttempt?.task_results ?? [];
  // Sort results by recency
  // NOTE: Results are stored in ascending (earliest -> latest) order (guaranteed by the API),
  // therefore we reverse the order
  const attemptResultsDesc = [...attemptResults].reverse();
  const selectedResult = selectedResultIdx !== null ? attemptResults[selectedResultIdx] : null;

  const selectAttemptUserInputs = selectedAttempt?.other_fields["user_input"] as Array<RequiredInput>;
  // Map of IDs to user inputs
  const userInputs = Object.fromEntries(selectAttemptUserInputs?.map((input) => [input.id, input.data]) ?? []);

  const rerunAttemptMut = useRerunTaskAttempt(problemId);
  const rerunAttempt = (attemptId: number) => {
    rerunAttemptMut.mutate(attemptId, {
      onError: () => setError("Failed to rerun attempt"),
      onSuccess: () => setError(""),
    });
  };
  const createAttemptMut = useCreateTaskAttempt(problemId, task.id);

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

  const hasLimit = typeof task.max_attempts === "number";
  const attemptsLeft = hasLimit
    ? Math.max((task.max_attempts as number) - (attempts?.length ?? 0), 0)
    : Number.MAX_SAFE_INTEGER;
  const isOutOfAttempts = !canSubmitWithoutLimit && attemptsLeft === 0;
  const submitLabel =
    "Submit" +
    (hasLimit && !canSubmitWithoutLimit ? ` (${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left)` : "");

  return (
    <div className="flex flex-col gap-6">
      {canSubmit && (
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
                />
              ))}
            </div>
            {error && <ErrorAlert message={error} className="mt-2 whitespace-pre font-mono" />}
            <Button className="mt-6" type="submit" disabled={createAttemptMut.isPending || isOutOfAttempts}>
              {isSubmitting ? "Submitting..." : submitLabel}
            </Button>
          </form>
        </TaskSection>
      )}
      <TaskSection>
        <TaskSectionHeader content="Results" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedAttemptIdx?.toString() ?? ""}
              onValueChange={(value) => setSelectedAttemptIdx(+value)}
              disabled={attempts === undefined || attempts.length == 0}
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
                    <SelectItem key={taskResult.id} value={`${attemptResultsDesc.length - index - 1}`}>
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
          </div>
          {selectedAttemptIdx !== null && selectedAttempt && (
            <TaskResultCard
              title={`Attempt ${selectedAttemptIdx + 1}`}
              taskAttempt={{
                ...selectedAttempt,
                task_results: selectedResult ? [selectedResult] : [],
                task: { ...task, problem_id: problemId, autograde: task.autograde ?? false, other_fields: { ...task } },
              }}
              problemId={problemId}
            />
          )}
        </div>
      </TaskSection>
    </div>
  );
};

export default ProgrammingSubmitForm;
