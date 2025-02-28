import { Link } from "react-router-dom";

import { MiniProblemPublic } from "@/api";
import { useProjectId } from "@/features/projects/hooks/use-id";

type OwnProps = {
  problem: MiniProblemPublic;
};

const ViewProblemButton = ({ problem }: OwnProps) => {
  const projectId = useProjectId();
  return (
    <Link
      to={`/projects/${projectId}/problems/${problem.id}`}
      className="text-ellipsis text-nowrap hover:text-purple-300 hover:underline"
    >
      {problem.name}
    </Link>
  );
};

export default ViewProblemButton;
