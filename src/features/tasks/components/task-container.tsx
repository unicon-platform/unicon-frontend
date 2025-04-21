import "katex/dist/katex.min.css";

import { PropsWithChildren } from "react";

import TaskSection from "@/features/tasks/components/task-section";
import TaskSectionHeader from "@/features/tasks/components/task-section-header";
import { renderKatex } from "@/utils/katex";

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
        <span className="text-zinc-100">{title}</span>
      </TaskSection>
      {description && (
        <TaskSection>
          <TaskSectionHeader content="Description" />
          <div
            className="prose whitespace-pre-line text-sm text-zinc-100 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderKatex(description) }}
          ></div>
        </TaskSection>
      )}
      {children}
    </div>
  );
};

export default TaskContainer;
