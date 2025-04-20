import { addMilliseconds, differenceInMilliseconds, format, parseISO } from "date-fns";
import { CheckIcon, ClockIcon } from "lucide-react";

import { TaskAttemptPublic, TaskEvalStatus, TaskResult } from "@/api";
import MultipleChoiceResult from "@/components/tasks/submission-results/result-types/multiple-choice-result";
import MultipleResponseResult from "@/components/tasks/submission-results/result-types/multiple-response-result";
import ProgrammingResult from "@/components/tasks/submission-results/result-types/programming-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressInterval } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskEvalStatusColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatIntervalDuration, relativeTime } from "@/utils/date";

type StatusIndicatorProps = {
  color: string;
  pulse?: boolean;
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ color, pulse }) => {
  return (
    <span className="relative flex h-4 w-4">
      <span className={cn("absolute inline-flex h-full w-full rounded-full", color, { "animate-ping": pulse })} />
      <span className={cn("absolute inline-flex h-full w-full rounded-full", color)} />
    </span>
  );
};

const ATTEMPT_STATUS_MESSAGE: Record<TaskEvalStatus, string> = {
  PENDING: "Hold tight! Your submission is being evaluated... ⏳",
  SKIPPED: "Hmm, this needs a human touch! 👀 Your submission requires manual grading by an instructor.",
  FAILED: "Oh no! Something went wrong 😭 It is not your fault though, please contact an administrator for help.",
  // NOTE: This is placeholder for type safety, if the attempt runs successfully, we will show the actual result
  SUCCESS: "",
} as const;

type TaskResultCardProps = {
  problemId: number;
  taskAttempt: TaskAttemptPublic;
  attemptResult: TaskResult;
  title: string;
};

const TaskResultCard: React.FC<TaskResultCardProps> = ({ problemId, taskAttempt, attemptResult, title }) => {
  const getCompletedAtEstimate = () => {
    const elapsedTimeMsList = taskAttempt.task_results
      .filter((taskResult) => taskResult.completed_at !== null)
      .map((taskResult) =>
        differenceInMilliseconds(parseISO(taskResult.completed_at), parseISO(taskResult.started_at)),
      );

    const avgeElapsedTimeMs =
      elapsedTimeMsList.reduce((acc, elapsedTimeMs) => acc + elapsedTimeMs, 0) / elapsedTimeMsList.length;

    return addMilliseconds(parseISO(attemptResult.started_at), avgeElapsedTimeMs);
  };

  const completedAt: Date = attemptResult.completed_at
    ? parseISO(attemptResult.completed_at)
    : getCompletedAtEstimate();

  const renderTiming = () => {
    const startedAtDate = parseISO(attemptResult.started_at);
    return (
      <div className="flex items-center gap-4 text-sm font-normal text-zinc-400">
        <Tooltip>
          <TooltipTrigger>
            <span>{relativeTime(startedAtDate)}</span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <span className="text-sm">Submitted at {format(startedAtDate, "dd MMM yyyy, HH:mm:ss")}</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-1 rounded-md border bg-zinc-800 px-2 py-1">
              <ClockIcon size={15} />
              {!attemptResult.completed_at && "ETA: "}
              {formatIntervalDuration(startedAtDate, completedAt)}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <p className="text-sm font-medium">
              {!attemptResult.completed_at ? "Estimated completion: " : "Completed at "}
              {format(completedAt, "dd MMM yyyy, HH:mm:ss")}
            </p>
            <p className="text-wrap text-xs">
              Round trip time from submission to completion, including testcase execution and queue time.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  };

  const renderResult = () => {
    if (attemptResult.status !== "SUCCESS") {
      return (
        <>
          <span className="font-mono text-sm text-zinc-400">{ATTEMPT_STATUS_MESSAGE[attemptResult.status]}</span>
          {attemptResult.status === "PENDING" && (
            <ProgressInterval start={attemptResult.started_at} end={completedAt} className="mt-6" />
          )}
        </>
      );
    }

    switch (taskAttempt.task.type) {
      case "PROGRAMMING_TASK":
        return <ProgrammingResult taskAttempt={taskAttempt} problemId={problemId} />;
      case "MULTIPLE_CHOICE_TASK":
        return <MultipleChoiceResult taskAttempt={taskAttempt} />;
      case "SHORT_ANSWER_TASK":
        return (
          <pre className="whitespace-pre-wrap rounded-md bg-gray-900 p-4 text-gray-100">
            {JSON.stringify(attemptResult.result, null, 2)}
          </pre>
        );
      case "MULTIPLE_RESPONSE_TASK":
        return <MultipleResponseResult taskAttempt={taskAttempt} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-4">
          <StatusIndicator
            color={attemptResult ? TaskEvalStatusColorMap[attemptResult.status] : "bg-purple-400"}
            pulse={attemptResult && attemptResult.status == "PENDING"}
          />
          <span className="text-lg font-medium">{title}</span>
          {taskAttempt.marked_for_submission && (
            <Tooltip>
              <TooltipTrigger>
                <CheckIcon className="text-green-500" />
              </TooltipTrigger>
              <TooltipContent side="top" align="center">
                <p>The attempt is chosen for submission</p>
              </TooltipContent>
            </Tooltip>
          )}
          {attemptResult && renderTiming()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {attemptResult ? (
          renderResult()
        ) : (
          <div className="flex flex-col gap-2">
            <span className="font-medium">No results found for this attempt 🥺</span>
            <p className="text-zinc-300">
              Fret not, this is not your fault. The adminstrator might have made a change to the task which invalidated
              your attempt. All you have to do is to submit a new attempt or re-run this attempt by clicking the
              "Re-run" button right above, and you will be good to go!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskResultCard;
