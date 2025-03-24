import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { FileIcon, Pencil } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { Link, useNavigate } from "react-router-dom";

import { TaskAttemptPublic } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DraftBadge, RestrictedBadge } from "@/features/problems/components/badges";
import { getProblemById, useCreateProblemSubmission } from "@/features/problems/queries";
import { useProblemId, useProjectId } from "@/features/projects/hooks/use-id";
import TaskCard from "@/features/tasks/components/task-card";
import { downloadFile } from "@/lib/files";
import { relativeTimeDetailed } from "@/utils/date";

const TimeDisplay = ({ label, datetime, iconName }: { label: string; datetime: Date; iconName: IconName }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-default">
        <div className="flex items-center gap-3 rounded-md bg-zinc-900 p-4">
          <DynamicIcon name={iconName} className="h-5 w-5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className={`text-sm font-medium`}>{format(datetime, "MMM d yyyy, hh:mm a")}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{relativeTimeDetailed(datetime)}</TooltipContent>
    </Tooltip>
  );
};

type ProblemProps = {
  id?: number;
  submissionId?: number;
  submissionAttempts?: TaskAttemptPublic[];
  submittedAt?: string;
};

const Problem = ({ id, submissionId, submissionAttempts, submittedAt }: ProblemProps) => {
  const isSubmissionView = submissionId !== undefined;

  const projectId = useProjectId();
  const problemId = useProblemId();

  const navigate = useNavigate();

  const createSubmission = useCreateProblemSubmission(id ?? problemId);
  const { data: problem } = useQuery(getProblemById(id ?? problemId));
  if (!problem) return;

  const {
    edit: canEdit,
    make_submission: canSubmit,
    make_submission_without_limit: canSubmitWithoutLimit,
    restricted,
    published,
    started_at,
    ended_at,
    closed_at,
    description,
    supporting_files,
  } = problem;

  const handleSubmit = async () => {
    createSubmission.mutate(undefined, {
      onSuccess: (response) => {
        navigate(`/projects/${projectId}/submissions/${response.data?.id}`);
      },
    });
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-4 text-3xl font-medium">
          <span>
            {problem.name} (<code>#{id ?? problemId}</code>)
          </span>
          {restricted && <RestrictedBadge />}
          {!published && <DraftBadge />}
        </h1>
        {!isSubmissionView && (
          <div className="flex items-center gap-2">
            {canEdit && (
              <Link to={`/projects/${projectId}/problems/${problemId}/edit`}>
                <Button variant="outline">
                  <Pencil /> Edit problem
                </Button>
              </Link>
            )}
            {canSubmit && (
              <ConfirmationDialog
                onConfirm={handleSubmit}
                title="Confirm Submission"
                description="Are you sure you want to submit?"
              >
                <Button variant="primary">Submit</Button>
              </ConfirmationDialog>
            )}
          </div>
        )}
      </div>
      {isSubmissionView && (
        <div className="flex text-green-400">
          <TimeDisplay label="Submitted At" datetime={parseISO(submittedAt!)} iconName="circle-check-big" />
        </div>
      )}
      <div className="flex flex-col gap-4">
        <div className="text-lg font-medium">Timeline</div>
        <div className="flex flex-wrap items-center gap-2">
          {started_at && <TimeDisplay label="Release Date" datetime={parseISO(started_at)} iconName="calendar" />}
          {ended_at && <TimeDisplay label="Due Date" datetime={parseISO(ended_at)} iconName="alarm-clock" />}
          {closed_at && <TimeDisplay label="Lock Date" datetime={parseISO(closed_at)} iconName="lock-keyhole" />}
        </div>
      </div>
      {description.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-lg font-medium">Description</div>
          <p className="whitespace-pre-line text-muted-foreground">{description}</p>
        </div>
      )}
      {supporting_files && supporting_files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-lg font-medium">Files</div>
          <div className="flex flex-wrap gap-2">
            {supporting_files.map((file) => (
              <a
                key={file.id}
                className="flex w-fit cursor-pointer items-center gap-2 rounded-md bg-zinc-800 p-4 px-8 transition-colors hover:bg-zinc-700 hover:underline"
                download={file.path}
                onClick={() => downloadFile(file.key)}
              >
                <FileIcon className="h-4 w-4" />
                {file.path}
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-col gap-8">
        {problem.tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            index={index}
            task={task}
            problemId={id ?? problemId}
            projectId={projectId}
            canEdit={false}
            canSubmit={!isSubmissionView && canSubmit}
            canSubmitWithoutLimit={!isSubmissionView && canSubmit && canSubmitWithoutLimit}
            submissionAttempt={submissionAttempts?.find((attempt) => attempt.task_id === task.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Problem;
