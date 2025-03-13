import React, { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { ProgrammingTask } from "@/api";
import { useUpdateTask } from "@/features/problems/queries";
import { useProjectId } from "@/features/projects/hooks/use-id";
import ProgrammingForm from "@/features/tasks/forms/programming-form";
import RerunDialog from "@/features/tasks/forms/rerun-dialog";
import { parseTaskValidationError } from "@/lib/errors";
import { fromProgrammingTask, ProgTaskFormT, toProgrammingTask } from "@/lib/schema/prog-task-form";
import { JSONstringifyOrder } from "@/lib/utils";
import { isSafeChangeForProgrammingTask } from "@/utils/task";

type OwnProps = {
  task: ProgrammingTask;
  problemId: number;
};

const EditProgramming: React.FC<OwnProps> = ({ task, problemId }) => {
  const projectId = useProjectId();

  const updateTaskMutation = useUpdateTask(problemId, task.id);
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState<ProgTaskFormT | null>(null);
  const [isSafe, setIsSafe] = useState<boolean>(false);
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  const updateTask = (form: ProgTaskFormT) => (rerun: boolean) => {
    updateTaskMutation.mutate(
      { task: { ...task, ...toProgrammingTask(form) }, rerun },
      {
        onSuccess: () => {
          navigate(`/projects/${projectId}/problems/${problemId}/edit`);
        },
        onError: (error) => setSubmitErrors(parseTaskValidationError(error)),
      },
    );
  };

  const onSubmit: SubmitHandler<ProgTaskFormT> = async (form: ProgTaskFormT) => {
    if (JSONstringifyOrder(form) === JSONstringifyOrder(fromProgrammingTask(task))) {
      navigate(`/projects/${projectId}/problems/${problemId}/edit`);
      return;
    }
    setOpenDialog(true);
    setForm(form);
    setIsSafe(isSafeChangeForProgrammingTask(task, toProgrammingTask(form)));
  };

  return (
    <>
      {openDialog && form && (
        <RerunDialog
          isSafe={isSafe}
          onClose={() => setOpenDialog(false)}
          onSaveWithoutRerun={() => updateTask(form)(false)}
          onSaveWithRerun={() => updateTask(form)(true)}
        />
      )}
      <ProgrammingForm
        title="Edit programming task"
        onSubmit={onSubmit}
        initialValue={fromProgrammingTask(task)}
        submitErrors={submitErrors}
      />
    </>
  );
};

export default EditProgramming;
