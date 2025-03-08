import { ColumnDef } from "@tanstack/react-table";

import { RolePublicWithInvitationKeys } from "@/api";
import CreateInvitationKeyButton from "@/features/projects/table/roles/create-invitation-key-button";
import DeleteInvitationKeyButton from "@/features/projects/table/roles/delete-invitation-key-button";
import InvitationKeyDisplay from "@/features/projects/table/roles/invitation-key-display";

export const columns: ColumnDef<RolePublicWithInvitationKeys>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    cell: ({ row }) => {
      return <InvitationKeyDisplay invitationKey={row.original.invitation_keys[0]?.key} />;
    },
    header: "Invitation Key",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invitationKey = row.original.invitation_keys[0]?.key;

      return invitationKey === undefined ? (
        <CreateInvitationKeyButton role={row.original} />
      ) : (
        <DeleteInvitationKeyButton role={row.original} />
      );
    },
  },
];
