import { Pencil } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { ProblemPublic } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { DraftBadge, RestrictedBadge } from "@/features/problems/components/badges";
import { useCreateProblemSubmission } from "@/features/problems/queries";

type ProblemHeaderProps = {
  problem: ProblemPublic;
  projectId: number;
  canEdit: boolean;
  canSubmit: boolean;
};

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({ problem, projectId, canEdit, canSubmit }) => {
  const { name, id, published, restricted } = problem;

  const navigate = useNavigate();
  const createSubmission = useCreateProblemSubmission(id!);

  const handleSubmit = async () => {
    createSubmission.mutate(undefined, {
      onSuccess: (response) => {
        navigate(`/projects/${projectId}/submissions/${response.data?.id}`);
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="flex items-center gap-4 text-3xl font-medium">
        <span>
          {name} (<code>#{id}</code>)
        </span>
        {restricted && <RestrictedBadge />}
        {!published && <DraftBadge />}
      </h1>
      {(canEdit || canSubmit) && (
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link to={`/projects/${projectId}/problems/${id}/edit`}>
              <Button variant="outline">
                <Pencil /> Edit problem
              </Button>
            </Link>
          )}
          {canSubmit && (
            <ConfirmationDialog
              onConfirm={handleSubmit}
              title="Finalize Submission"
              description="Are you sure you want to submit? Ensure that you have mark your attempts for submission."
            >
              <Button variant="primary">Finalize</Button>
            </ConfirmationDialog>
          )}
        </div>
      )}
    </div>
  );
};
