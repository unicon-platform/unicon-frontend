import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { PlusIcon } from "lucide-react";

import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Button } from "@/components/ui/button";
import CreateTaskPopover from "@/features/problems/form/create-task-popover";
import { TaskType } from "@/features/problems/queries";
import TaskCard from "@/features/tasks/components/task-card";

export type Order = {
  id: number;
  orderIndex: number;
};

type OwnProps = {
  problemId: number;
  tasks: TaskType[];
  projectId: number;
  handleUpdateOrder: (newOrder: Order[]) => void;
};

const EditTasksDisplay: React.FC<OwnProps> = ({ tasks, problemId, projectId, handleUpdateOrder }) => {
  const onDragEnd: OnDragEndResponder<string> = ({ source, destination }) => {
    if (!destination) {
      return;
    }
    if (source.index === destination.index) {
      return;
    }

    const tasksCopy = [...tasks];
    const [removed] = tasksCopy.splice(source.index, 1);
    tasksCopy.splice(destination.index, 0, removed);
    handleUpdateOrder(tasksCopy.map((task, index) => ({ id: task.id, orderIndex: index })));
  };

  return (
    <div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tasks</h2>
          <CreateTaskPopover>
            <Button variant="outline" className="mt-2" type="button">
              <PlusIcon />
              Add task
            </Button>
          </CreateTaskPopover>
        </div>
      </div>
      {tasks.length === 0 && (
        <div className="mt-4">
          <EmptyPlaceholder description="You don't have any tasks." />
        </div>
      )}
      {tasks.length > 0 && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div className="mt-4 flex flex-col gap-6" ref={provided.innerRef} {...provided.droppableProps}>
                {tasks.map(
                  (task, index) =>
                    task && (
                      <Draggable draggableId={task.id.toString()} index={index} key={task.id}>
                        {(provided) => (
                          <TaskCard
                            index={index}
                            key={task.id}
                            task={task}
                            problemId={problemId}
                            projectId={projectId}
                            canEdit={true}
                            canSubmit={false}
                            canSubmitWithoutLimit={false}
                            provided={provided}
                          />
                        )}
                      </Draggable>
                    ),
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default EditTasksDisplay;
