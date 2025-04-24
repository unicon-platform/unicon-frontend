import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";

import { ProblemPublic } from "@/api";
import { Button } from "@/components/ui/button";
import { DraftBadge, RestrictedBadge } from "@/features/problems/components/badges";

type ProblemHeaderProps = {
  problem: ProblemPublic;
  projectId: number;
  canEdit: boolean;
};

export const ProblemHeader: React.FC<ProblemHeaderProps> = ({ problem, projectId, canEdit }) => {
  const { name, id, published, restricted } = problem;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="flex items-center gap-4 text-3xl font-medium">
        <span>{name}</span>
        {restricted && <RestrictedBadge />}
        {!published && <DraftBadge />}
      </h1>
      {canEdit && (
        <div className="flex items-center gap-2">
          {canEdit && (
            <Link to={`/projects/${projectId}/problems/${id}/edit`}>
              <Button variant="outline">
                <Pencil /> Edit problem
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};
