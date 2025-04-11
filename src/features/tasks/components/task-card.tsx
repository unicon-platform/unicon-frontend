import { DraggableProvided } from "@hello-pangea/dnd";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { CircleAlert, GripVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { TaskAttemptPublic } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Task } from "@/components/tasks/task";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getTaskById, getTaskVersionsById, TaskType, useDeleteTask } from "@/features/problems/queries";
import { AutogradedBadge, MaxAttemptsBadge, TaskTypeBadge } from "@/features/tasks/components/badges";

type OwnProps = {
  index: number;
  task: TaskType;
  problemId: number;
  projectId: number;
  canEdit: boolean;
  canSubmit: boolean;
  canSubmitWithoutLimit: boolean;
  submissionAttempt?: TaskAttemptPublic;
  provided?: DraggableProvided;
};

const TaskCard: React.FC<OwnProps> = ({
  index,
  // We assume this task is the most updated task version.
  task: updatedTask,
  problemId,
  projectId,
  canEdit,
  canSubmit,
  canSubmitWithoutLimit,
  submissionAttempt,
  provided,
}) => {
  const deleteTaskMutation = useDeleteTask(problemId, updatedTask.id);

  const { data: taskVersionIds } = useSuspenseQuery(getTaskVersionsById(problemId, updatedTask.id));
  const [selectedTaskVersionId, setSelectedTaskVersionId] = useState(taskVersionIds![0]!);

  const isSelectedVersionUpdated = selectedTaskVersionId === updatedTask.id;
  const { data: task, isLoading } = useQuery({
    ...getTaskById(problemId, selectedTaskVersionId),
    initialData: isSelectedVersionUpdated ? updatedTask : undefined,
    enabled: !isSelectedVersionUpdated,
  });
  const numberOfVersions = taskVersionIds?.length ?? 0;
  const isProgrammingTask = updatedTask.type === "PROGRAMMING_TASK";

  if (isLoading || !task) {
    return (
      <Card className="bg-inherit">
        <CardHeader>
          <CardTitle className="-mx-6 -mt-6 flex items-center justify-between rounded-t-xl bg-neutral-800 px-6 pb-4 pt-4">
            <div className="flex items-center gap-4">
              {canEdit && <GripVertical className="-mr-2" />}
              <span className="text-lg font-medium">Task #{index + 1}</span>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isProgrammingTask && taskVersionIds && taskVersionIds.length > 1 && (
                <Select
                  value={selectedTaskVersionId.toString()}
                  onValueChange={(newValue) => setSelectedTaskVersionId(+newValue)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a version" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskVersionIds.map((version, index) => (
                      <SelectItem key={version} value={version.toString()}>
                        <span className="text-sm font-medium">{`Version ${numberOfVersions - index} ${index === 0 ? " (Latest)" : ""}`}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {canEdit && (
                <>
                  <Button asChild variant="ghost" className="hover:text-purple-300">
                    <Link to={`/projects/${projectId}/problems/${problemId}/edit/tasks/${updatedTask.id}`}>
                      <Pencil />
                      Edit
                    </Link>
                  </Button>
                  <ConfirmationDialog onConfirm={deleteTaskMutation.mutate}>
                    <Button type="button" variant={"destructive"}>
                      <Trash />
                      Delete
                    </Button>
                  </ConfirmationDialog>
                </>
              )}
            </div>
          </CardTitle>
          <CardContent className="p-0 py-2">
            <Skeleton className="mt-4 h-96 w-full" />
          </CardContent>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-inherit" {...(provided?.draggableProps ?? {})} ref={provided?.innerRef}>
      <CardHeader>
        <CardTitle
          className="-mx-6 -mt-6 flex items-center justify-between rounded-t-xl bg-neutral-800 px-6 pb-4 pt-4"
          {...(provided?.dragHandleProps ?? {})}
        >
          <div className="flex items-center gap-4">
            {canEdit && <GripVertical className="-mr-2" />}
            <span className="text-lg font-medium">Task #{index + 1}</span>
            <div className="flex items-center gap-2">
              <TaskTypeBadge type={task.type} />
              <MaxAttemptsBadge maxAttempts={task.max_attempts ?? null} />
              {task.autograde && <AutogradedBadge />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isProgrammingTask && taskVersionIds && taskVersionIds.length > 1 && (
              <Select
                value={selectedTaskVersionId.toString()}
                onValueChange={(newValue) => setSelectedTaskVersionId(+newValue)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a version" />
                </SelectTrigger>
                <SelectContent>
                  {taskVersionIds.map((version, index) => (
                    <SelectItem key={version} value={version.toString()}>
                      <span className="text-sm font-medium">{`Version ${numberOfVersions - index} ${index === 0 ? " (Latest)" : ""}`}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {canEdit && (
              <>
                <Button asChild variant="ghost" className="hover:text-purple-300">
                  <Link to={`/projects/${projectId}/problems/${problemId}/edit/tasks/${updatedTask.id}`}>
                    <Pencil />
                    Edit
                  </Link>
                </Button>
                <ConfirmationDialog onConfirm={deleteTaskMutation.mutate}>
                  <Button type="button" variant={"destructive"}>
                    <Trash />
                    Delete
                  </Button>
                </ConfirmationDialog>
              </>
            )}
          </div>
        </CardTitle>
        <CardContent className="p-0 py-2">
          {!isSelectedVersionUpdated && (
            <Alert variant="warning" className="mb-2 flex items-center gap-2">
              <div>
                <CircleAlert className="h-4 w-4" />
              </div>
              <AlertDescription className="flex w-full items-center justify-between">
                <span>You're viewing an outdated version.</span>{" "}
                <Button
                  size="sm"
                  variant={"secondary"}
                  type="button"
                  onClick={() => setSelectedTaskVersionId(updatedTask.id)}
                >
                  View latest version
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <Task
            problemId={problemId}
            task={task}
            canEdit={canEdit}
            canSubmit={canSubmit}
            canSubmitWithoutLimit={canSubmitWithoutLimit}
            submissionAttempt={submissionAttempt}
          />
        </CardContent>
      </CardHeader>
    </Card>
  );
};
export default TaskCard;
