import { RolePublicWithInvitationKeys } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteInvitationKey } from "@/features/projects/queries";

type OwnProps = {
  role: RolePublicWithInvitationKeys;
};

const DeleteInvitationKeyButton: React.FC<OwnProps> = ({ role }) => {
  const deleteInvitationKeyMutation = useDeleteInvitationKey(role.project_id, role.id);

  return (
    <ConfirmationDialog onConfirm={() => deleteInvitationKeyMutation.mutate()}>
      <Button variant="destructive">delete</Button>
    </ConfirmationDialog>
  );
};

export default DeleteInvitationKeyButton;
