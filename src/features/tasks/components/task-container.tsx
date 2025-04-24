import { PropsWithChildren } from "react";

import { MarkdownRenderer } from "@/components/markdown/renderer";
import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";

type OwnProps = {
  title: string;
  description?: string | null;
};

type TaskContainerProps = OwnProps & PropsWithChildren;

const TaskContainer: React.FC<TaskContainerProps> = ({ title, description, children }) => {
  return (
    <div className="flex flex-col gap-6">
      <TaskSection>
        <TaskSectionHeader content="Title" />
        <span>{title}</span>
      </TaskSection>
      {description && (
        <TaskSection>
          <TaskSectionHeader content="Description" />
          <div className="prose max-w-none dark:prose-invert">
            <MarkdownRenderer markdown={description} />
          </div>
        </TaskSection>
      )}
      {children}
    </div>
  );
};

export default TaskContainer;
