import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import ConfirmationDialog from "@/components/confirmation-dialog";
import { LoadingPage } from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { useProjectId } from "@/features/projects/hooks/use-id";
import {
  getProjectById,
  getProjectUsersById,
  ProjectQueryKeys,
  useRemoveProjectUser,
} from "@/features/projects/queries";
import { UserManagementTable } from "@/features/projects/table/users/user-management-table";
import UsersTable from "@/features/projects/table/users/users-table";
import { useUserStore } from "@/store/user/user-store-provider";

const ProjectUsers = () => {
  const id = useProjectId();
  const { data: project } = useSuspenseQuery(getProjectById(Number(id)));
  const removeUserMutation = useRemoveProjectUser(id);
  const { data: users } = useQuery({
    ...getProjectUsersById(id),
    enabled: !removeUserMutation.isSuccess,
    retry: false,
  });

  const navigate = useNavigate();
  const user = useUserStore((store) => store.user)!;
  const queryClient = useQueryClient();

  if (!project) {
    return <div>Something went wrong.</div>;
  }
  if (!users) {
    return <LoadingPage />;
  }

  const { edit_roles } = project!;

  return (
    <div className="m-auto flex w-full flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Users</h2>
        {/* TODO: if we create a project "home page", move this leave button there */}
        <ConfirmationDialog
          onConfirm={() => {
            // Navigate first to prevent errors from trying to render inaccessible data
            removeUserMutation.mutate(user.id, {
              onSuccess: () => {
                navigate("/projects");
                queryClient.invalidateQueries({ queryKey: [ProjectQueryKeys.Project] });
              },
            });
          }}
          title="Leave project"
          description="Are you sure you want to leave this project?"
        >
          <Button variant="destructive">Leave project</Button>
        </ConfirmationDialog>
      </div>
      <div className="flex flex-col gap-4">
        {edit_roles ? <UserManagementTable project={project} users={users} /> : <UsersTable data={users} />}
      </div>
    </div>
  );
};

export default ProjectUsers;
