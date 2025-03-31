import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { getProblemById, useCreateTask } from "@/features/problems/queries";
import { useProblemId, useProjectId } from "@/features/projects/hooks/use-id";
import ProgrammingForm from "@/features/tasks/forms/programming-form";
import { parseTaskValidationError } from "@/lib/errors";
import { ProgTaskFormT, toProgrammingTask } from "@/lib/schema/prog-task-form";
import { Unauthorized } from "@/pages/error";

const CreateProgramming = () => {
  const [problemId, projectId] = [useProblemId(), useProjectId()];
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);

  const navigate = useNavigate();
  const createTaskMutation = useCreateTask(problemId);

  const { data } = useSuspenseQuery(getProblemById(problemId));
  if (data && !data.edit) throw Unauthorized;

  const onSubmit: SubmitHandler<ProgTaskFormT> = async (form) => {
    createTaskMutation.mutate(toProgrammingTask(form), {
      onSuccess: () => {
        navigate(`/projects/${projectId}/problems/${problemId}/edit`);
      },
      onError: (error) => setSubmitErrors(parseTaskValidationError(error)),
    });
  };

  return <ProgrammingForm title="New Programming Task" onSubmit={onSubmit} submitErrors={submitErrors} />;
};

export default CreateProgramming;
