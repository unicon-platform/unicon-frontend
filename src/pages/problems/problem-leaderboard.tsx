import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { CheckIcon, EqualApproximatelyIcon, XIcon } from "lucide-react";

import { LeaderboardUser, LeaderboardUserTaskResult, ProgrammingTask, TaskAttemptPublic } from "@/api";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProblemById, getProblemLeaderboardById } from "@/features/problems/queries";
import { useProblemId, useProjectId } from "@/features/projects/hooks/use-id";
import { ProblemHeader } from "@/pages/problems/sections/problem-header";
import { ProblemTabs } from "@/pages/problems/sections/problem-tabs";
import { formatDateShort } from "@/utils/date";

type LeaderboardRowProps = {
  userResult: LeaderboardUser;
  tasks: ProgrammingTask[];
  rank: number;
};

const getLatestAttemptDate = (taskResults: LeaderboardUserTaskResult[]) => {
  if (taskResults.length === 0) return null;
  const latestAttemptDate = taskResults.reduce((latest, current) => {
    if (!current.latest_attempt_date) return latest;
    if (!latest) return current.latest_attempt_date;
    return new Date(current.latest_attempt_date) > new Date(latest) ? current.latest_attempt_date : latest;
  }, taskResults[0].latest_attempt_date);

  return latestAttemptDate ? formatDateShort(new Date(latestAttemptDate)) : "-";
};

const LeaderboardRow = ({ userResult, tasks, rank }: LeaderboardRowProps) => {
  return (
    <TableRow key={userResult.id}>
      <TableCell className="w-fit">
        <div className="flex gap-4">
          <span className="font-bold">{rank}</span>
          <span>{userResult.username}</span>
        </div>
      </TableCell>
      <TableCell>{userResult.solved}</TableCell>
      <TableCell>{userResult.task_results.reduce((acc, result) => acc + result.score, 0)}</TableCell>
      <TableCell>{getLatestAttemptDate(userResult.task_results)}</TableCell>
      {tasks.map((task) => {
        const taskAttempt = userResult.task_results.find((taskResult) => taskResult.task_id === task.id);
        if (!taskAttempt || taskAttempt?.attempts === 0) {
          return <TableCell key={task.id}>-</TableCell>;
        }

        const taskMaxScore = task.testcases.reduce((acc, testcase) => acc + (testcase.score ?? 0), 0);
        return (
          <TableCell key={task.id}>
            <div className="flex items-center gap-2">
              {taskAttempt.passed ? (
                <CheckIcon className="h-8 w-8 text-green-500" />
              ) : taskAttempt.score > 0 ? (
                <EqualApproximatelyIcon className="h-8 w-8 text-yellow-500" />
              ) : (
                <XIcon className="h-8 w-8 text-red-500" />
              )}
              <div className="flex flex-col">
                <span>
                  {taskAttempt.attempts} {taskAttempt.attempts === 1 ? "try" : "tries"}
                </span>
                <span>{taskAttempt ? `${taskAttempt.score} / ${taskMaxScore}` : "-"} pts</span>
              </div>
            </div>
          </TableCell>
        );
      })}
    </TableRow>
  );
};

type ProblemLeaderboardProps = {
  id?: number;
  submissionId?: number;
  submissionAttempts?: TaskAttemptPublic[];
  submittedAt?: string;
};

const ProblemLeaderboard = ({ id }: ProblemLeaderboardProps) => {
  const projectId = useProjectId();
  const urlProblemId = useProblemId();
  const problemId = id ?? urlProblemId;

  const { data: problem } = useQuery(getProblemById(problemId));
  const { data: leaderboard } = useSuspenseQuery(getProblemLeaderboardById(problemId));

  if (!problem) return;

  const { edit: canEdit } = problem;

  return (
    <div className="flex w-full flex-col gap-4">
      <ProblemHeader problem={problem} projectId={projectId} canEdit={canEdit} />
      <ProblemTabs
        leaderboardEnabled={problem.leaderboard_enabled ?? false}
        defaultValue="leaderboard"
        problemId={problemId}
        projectId={projectId}
      />
      <Table className="table-auto">
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Solved</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                Latest Attempt Date
                <InfoTooltip content="We count the latest date for the attempts needed to get the highest achieved score." />{" "}
              </div>
            </TableHead>
            {leaderboard?.tasks
              .sort((a, b) => a.order_index - b.order_index)
              .map((task, index) => (
                <TableHead key={task.id} className="text-center">
                  <div className="py-1">
                    <div className="flex items-center gap-2">
                      Task {index + 1} <InfoTooltip content={task.title} />
                    </div>
                    {task.min_score_to_pass !== null && (
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        {task.min_score_to_pass} point{task.min_score_to_pass !== 1 && "s"} to pass
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard?.results.map((userResult, index) => (
            <LeaderboardRow key={userResult.id} userResult={userResult} tasks={leaderboard.tasks} rank={index + 1} />
          ))}
          {leaderboard?.results.length === 0 && (
            <TableRow>
              <TableCell colSpan={leaderboard.tasks.length + 3} className="text-center">
                No results yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProblemLeaderboard;
