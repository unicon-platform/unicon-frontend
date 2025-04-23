import { RolePublicWithInvitationKeys } from "@/api";
import { Button } from "@/components/ui/button";
import { useCreateInvitationKey } from "@/features/projects/queries";

type OwnProps = {
  role: RolePublicWithInvitationKeys;
};

const CreateInvitationKeyButton: React.FC<OwnProps> = ({ role }) => {
  const createInvitationKeyMutation = useCreateInvitationKey(role.project_id, role.id);

  return (
    <Button variant="outline" onClick={() => createInvitationKeyMutation.mutate()}>
      Create
    </Button>
  );
};

export default CreateInvitationKeyButton;
