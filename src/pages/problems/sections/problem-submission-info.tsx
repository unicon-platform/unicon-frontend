import { UserIcon } from "lucide-react";

import { UserPublicWithRolesAndGroups } from "@/api";
import { Badge } from "@/components/ui/badge";

type ProblemSubmissionInfoProps = {
  projectId: number;
  submissionUser: UserPublicWithRolesAndGroups;
};

export const ProblemSubmissionInfo: React.FC<ProblemSubmissionInfoProps> = ({ projectId, submissionUser }) => {
  const userRole = submissionUser.roles.find((role) => role.project_id === projectId);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-medium">Submission Details</div>
      <div className="flex w-fit items-center gap-3 rounded-md bg-zinc-900 p-4">
        <UserIcon className="h-6 w-6" />
        <div className="flex flex-col gap-2">
          <span>{submissionUser.username}</span>
          <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 text-xs">
            {userRole?.name}
          </Badge>
        </div>
      </div>
    </div>
  );
};
