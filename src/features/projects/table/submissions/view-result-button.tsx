import { EyeIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useProjectId } from "@/features/projects/hooks/use-id";

type OwnProps = {
  submissionId: number;
};

const ViewResultButton = ({ submissionId }: OwnProps) => {
  const projectId = useProjectId();
  return (
    <Button asChild variant="outline">
      <Link to={`/projects/${projectId}/submissions/${submissionId}`}>
        <EyeIcon />
        View
      </Link>
    </Button>
  );
};

export default ViewResultButton;
