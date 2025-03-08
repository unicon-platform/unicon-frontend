import { format, parseISO } from "date-fns";
import { TimerIcon } from "lucide-react";

import { TaskAttemptPublic, TaskEvalStatus, TaskResult } from "@/api";
import MultipleChoiceResult from "@/components/tasks/submission-results/result-types/multiple-choice-result";
import MultipleResponseResult from "@/components/tasks/submission-results/result-types/multiple-response-result";
import ProgrammingResult from "@/components/tasks/submission-results/result-types/programming-result";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  title: string;
};

const TaskResultCard: React.FC<TaskResultCardProps> = ({ problemId, taskAttempt, title }) => {
  const attemptResult: TaskResult = taskAttempt.task_results[0];

  const renderTiming = () => {
    const startedAtDate = parseISO(attemptResult.started_at);
    return (
      <div className="flex items-center gap-4 text-sm font-normal text-zinc-400">
        <Tooltip>
          <TooltipTrigger>
            <span>{relativeTime(startedAtDate)}</span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <span className="text-sm">Started at {format(startedAtDate, "dd MMM yyyy, HH:mm:ss")}</span>
          </TooltipContent>
        </Tooltip>
        {attemptResult.completed_at && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 rounded-md border bg-zinc-800 px-2 py-1">
                <TimerIcon size={15} />
                {formatIntervalDuration(startedAtDate, parseISO(attemptResult.completed_at))}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              <span className="text-sm">
                Completed at {format(attemptResult.completed_at, "dd MMM yyyy, HH:mm:ss")}
              </span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const renderResult = () => {
    if (attemptResult.status !== "SUCCESS") {
      return <span className="font-mono text-sm text-zinc-400">{ATTEMPT_STATUS_MESSAGE[attemptResult.status]}</span>;
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
