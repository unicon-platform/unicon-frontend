import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { Problem } from "@/api";
import { RichTextEditorAdvanced } from "@/components/editor";
import { DateTimeField, RadioBooleanField, TextField } from "@/components/form/fields";
import ErrorAlert from "@/components/form/fields/error-alert";
import UnsavedChangesHandler from "@/components/form/unsaved-changes-handler";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import EditProblemFilesSection, { BufferedFiles } from "@/features/problems/form/edit-problem-files";
import EditTasksDisplay from "@/features/problems/form/edit-tasks-display";
import { useAddFilesToProblem, useDeleteProblemFiles, useUpdateProblem } from "@/features/problems/queries";
import { useProjectId } from "@/features/projects/hooks/use-id";
import { useToast } from "@/hooks/use-toast";

type OwnProps = {
  id: number;
  problem: Problem;
};

const problemFormSchema = z
  .object({
    name: z.string().min(1, "Name cannot be empty"),
    description: z.string().min(1, "Description cannot be empty"),
    restricted: z.boolean(),
    published: z.boolean(),
    started_at: z.string().nullable(),
    ended_at: z.string().nullable(),
    closed_at: z.string().nullable(),
    leaderboard_enabled: z.boolean(),
  })
  .superRefine(({ started_at, ended_at, closed_at }, ctx) => {
    const startedDate = started_at ? parseISO(started_at) : new Date();
    const endedDate = ended_at ? parseISO(ended_at) : new Date(8.64e15);
    const closedDate = closed_at ? parseISO(closed_at) : new Date(8.64e15);
    if (endedDate < startedDate) {
      return ctx.addIssue({
        code: "custom",
        message: "Due date cannot be before release date (defaults to now if not set)",
        path: ["ended_at"],
      });
    }
    if (closedDate < endedDate) {
      return ctx.addIssue({
        code: "custom",
        message: "Lock date cannot be before due date",
      });
    }
  });

type ProblemFormType = z.infer<typeof problemFormSchema>;

const EditProblemForm: React.FC<OwnProps> = ({ id, problem }) => {
  const [error, setError] = useState("");
  const [content, setContent] = useState(problem.description);

  const updateProblemMutation = useUpdateProblem(id);

  const form = useForm<ProblemFormType>({
    resolver: zodResolver(problemFormSchema),
    defaultValues: problem,
  });

  useEffect(() => {
    form.setValue("description", content);
  }, [content, form]);

  const onChangeContent = (value: string) => {
    setContent(value);
  };

  const [bufferedFiles, setBufferedFiles] = useState<BufferedFiles>({ filesToAdd: [], fileIdsToRemove: [] });
  const hasBufferedFileState = bufferedFiles.filesToAdd.length > 0 || bufferedFiles.fileIdsToRemove.length > 0;

  const toast = useToast();
  const projectId = useProjectId();

  const [taskOrder, setTaskOrder] = useState(
    problem.tasks.map((task, index) => ({
      id: task.id,
      orderIndex: index,
    })),
  );

  useEffect(() => {
    setTaskOrder(
      problem.tasks.map((task, index) => ({
        id: task.id,
        orderIndex: index,
      })),
    );
  }, [problem.tasks]);

  const sortedTasks = taskOrder.map((order) => problem.tasks.find((task) => task.id === order.id)!);

  const addFilesToProblemMutation = useAddFilesToProblem(id);
  const deleteFilesFromProblemMutation = useDeleteProblemFiles(id);

  const onSubmit: SubmitHandler<ProblemFormType> = async (data) => {
    const now = new Date();
    // Save the buffered file changes
    if (bufferedFiles.filesToAdd.length > 0) {
      addFilesToProblemMutation.mutate(bufferedFiles.filesToAdd);
    }
    if (bufferedFiles.fileIdsToRemove.length > 0) {
      deleteFilesFromProblemMutation.mutate(bufferedFiles.fileIdsToRemove);
    }

    setBufferedFiles({ filesToAdd: [], fileIdsToRemove: [] });

    updateProblemMutation.mutate(
      {
        ...data,
        started_at: data.started_at ?? now.toISOString(),
        task_order: taskOrder.map((order) => ({
          id: order.id,
          order_index: order.orderIndex,
        })),
      },
      {
        onSettled: (response) => {
          if (!response) {
            // this should not happen
            return;
          }
          if (response.status !== 200) {
            setError(JSON.stringify(response.error));
          } else {
            toast.toast({
              title: "Problem updated",
              description: `"${problem.name}" has been updated successfully.`,
            });
            form.reset(data);
          }
        },
      },
    );
  };

  return (
    <Form {...form}>
      {/* We set isDirty to undefined to reuse the form dirty logic. (see UnsavedChangedHandler) */}
      <UnsavedChangesHandler form={form} isDirty={hasBufferedFileState ? true : undefined} />
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Edit problem</h1>
            <Button variant="primary">Save</Button>
          </div>
          {error && <ErrorAlert message={error} />}
          {/* Problem details */}
          <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-0">
            <div className="sticky top-0">
              <h2 className="min-w-[200px] text-lg font-medium">Problem details</h2>
            </div>
            <div className="flex w-full flex-col gap-4">
              <TextField label="Title" name="name" />
              <label>Description</label>
              <RichTextEditorAdvanced content={content} onChangeContent={onChangeContent} />
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DateTimeField name="started_at" label="Release Date" />
                <DateTimeField name="ended_at" label="Due Date" />
                <DateTimeField name="closed_at" label="Lock Date" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                <RadioBooleanField
                  label="Access control"
                  name="restricted"
                  trueLabel="Restricted"
                  falseLabel="Unrestricted"
                />
                <RadioBooleanField label="Visibility" name="published" trueLabel="Published" falseLabel="Draft" />
                <RadioBooleanField
                  label="Leaderboard"
                  name="leaderboard_enabled"
                  trueLabel="Enabled"
                  falseLabel="Disabled"
                />
              </div>
            </div>
          </div>
          <EditProblemFilesSection
            supportingFiles={problem.supporting_files!}
            bufferedFiles={bufferedFiles}
            setBufferedFiles={setBufferedFiles}
          />
          <EditTasksDisplay tasks={sortedTasks} problemId={id} projectId={projectId} handleUpdateOrder={setTaskOrder} />
        </div>
      </form>
    </Form>
  );
};

export default EditProblemForm;
