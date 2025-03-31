import { useSuspenseQuery } from "@tanstack/react-query";

import { useProjectId } from "@/features/projects/hooks/use-id";
import { getProjectById, getProjectUsersById } from "@/features/projects/queries";
import UsersTable from "@/features/projects/table/users/users-table";

const ProjectUsers = () => {
  const id = useProjectId();
  const { data: project } = useSuspenseQuery(getProjectById(Number(id)));
  const { data: users } = useSuspenseQuery(getProjectUsersById(id));

  if (!project) {
    return <div>Something went wrong.</div>;
  }

  return (
    <div className="m-auto flex w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users</h2>
      </div>
      <div className="flex flex-col gap-4">{users && <UsersTable data={users} />}</div>
    </div>
  );
};

export default ProjectUsers;
