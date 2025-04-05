import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ProjectPublicWithProblems, UserPublicWithRolesAndGroups } from "@/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getProjectRolesById, useRemoveProjectUser, useUpdateProjectUsers } from "@/features/projects/queries";
import { useUserStore } from "@/store/user/user-store-provider";

type UserManagementTableProps = {
  project: ProjectPublicWithProblems;
  users: UserPublicWithRolesAndGroups[];
};

export const UserManagementTable: React.FC<UserManagementTableProps> = ({ project, users: originalUsers }) => {
  const { data: projectRoles } = useSuspenseQuery(getProjectRolesById(project.id));
  const [users, setUsers] = useState(originalUsers);
  const loggedInUser = useUserStore((store) => store.user)!;

  const removeUserMutation = useRemoveProjectUser(project.id);
  const changeUserRoleMutation = useUpdateProjectUsers(project.id);

  if (!projectRoles) {
    // This cannot happen, a suspense query always succeeds.
    return <div>Something went wrong.</div>;
  }

  const handleRemoveUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId));
  };

  const handleUserRoleChange = (userId: number, roleId: number) => {
    const usersCopy = [...users];
    const userIndex = usersCopy.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      const user = usersCopy[userIndex];
      const newRole = projectRoles.find((role) => role.id === roleId);
      if (newRole) {
        usersCopy[userIndex] = {
          ...user,
          roles: [newRole],
        };
        setUsers(usersCopy);
      }
    }
  };

  const deletedUsers = originalUsers.filter((user) => !users.some((u) => u.id === user.id));
  const roleChangedUsers = users.filter((user) => {
    const originalUser = originalUsers.find((u) => u.id === user.id);
    if (originalUser) {
      const originalRoleId = originalUser.roles
        .map((role) => role.id)
        .filter((roleId) => projectRoles.some((r) => r.id === roleId))[0];
      const newRoleId = user.roles
        .map((role) => role.id)
        .filter((roleId) => projectRoles.some((r) => r.id === roleId))[0];
      return originalRoleId !== newRoleId;
    }
    return false;
  });

  const handleSave = () => {
    deletedUsers.forEach((user) => {
      removeUserMutation.mutate(user.id);
    });

    changeUserRoleMutation.mutate(
      roleChangedUsers.map((user) => {
        const userRole = projectRoles.filter((role) => user.roles.some((userRole) => userRole.id === role.id))[0];
        return {
          user_id: user.id,
          role_id: userRole.id,
        };
      }),
    );
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const userRole = projectRoles.filter((role) => user.roles.some((userRole) => userRole.id === role.id))[0];
            return (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Select
                    value={userRole.id.toString()}
                    onValueChange={(newRoleId) => handleUserRoleChange(user.id, parseInt(newRoleId))}
                  >
                    <SelectTrigger className="h-8 w-fit text-xs">
                      <SelectValue placeholder="Select a role" className="p-2" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectRoles.map((role) => (
                        <SelectItem key={role.id} value={role.id.toString()}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button variant={"secondary"} onClick={() => handleRemoveUser(user.id)}>
                    {user.id === loggedInUser.id ? "Leave" : "Remove"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button className="w-fit" onClick={handleSave}>
        Save changes
      </Button>
    </>
  );
};
