import { format, formatDuration, formatRelative, intervalToDuration } from "date-fns";
import { TimerIcon } from "lucide-react";

import { TaskAttemptPublic, TaskResult } from "@/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskEvalStatusColorMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

import MultipleChoiceResult from "./result-types/multiple-choice-result";
import MultipleResponseResult from "./result-types/multiple-response-result";
import ProgrammingResult from "./result-types/programming-result";

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

type TaskResultCardProps = {
  problemId: number;
  taskAttempt: TaskAttemptPublic;
  title: string;
};

const TaskResultCard: React.FC<TaskResultCardProps> = ({ problemId, taskAttempt, title }) => {
  const attemptResult: TaskResult = taskAttempt.task_results[0];
  if (!attemptResult) return <></>;

  const renderTiming = () => {
    return (
      <div className="flex items-center gap-4 text-sm font-normal text-zinc-400">
        <Tooltip>
          <TooltipTrigger>
            <span>{formatRelative(attemptResult.started_at, new Date())}</span>
          </TooltipTrigger>
          <TooltipContent side="top" align="center">
            <span className="text-sm">{format(attemptResult.started_at, "dd MMM yyyy, HH:mm:ss")}</span>
          </TooltipContent>
        </Tooltip>
        {attemptResult.completed_at && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 rounded-md border bg-zinc-800 px-2 py-1">
                <TimerIcon size={15} />
                {formatDuration(
                  intervalToDuration({
                    start: attemptResult.started_at,
                    end: attemptResult.completed_at,
                  }),
                  { format: ["hours", "minutes", "seconds"] },
                )}
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
            color={TaskEvalStatusColorMap[attemptResult.status]}
            pulse={attemptResult.status == "PENDING"}
          />
          <span className="text-lg font-medium">{title}</span>
          {renderTiming()}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 font-mono">
        {attemptResult.status == "SKIPPED" ? (
          <span className="text-gray-300">Manual grading is required!</span>
        ) : (
          renderResult()
        )}
      </CardContent>
    </Card>
  );
};

export default TaskResultCard;
