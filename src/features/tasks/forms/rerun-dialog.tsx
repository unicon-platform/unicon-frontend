import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type OwnProps = {
  onClose: () => void;
  onSaveWithRerun: () => void;
  onSaveWithoutRerun: () => void;
  isSafe: boolean;
};
const RerunDialog: React.FC<OwnProps> = ({ onClose, onSaveWithRerun, onSaveWithoutRerun }) => {
  const title = "Rerun past attempts?";
  const description =
    "If you do not rerun, users will need to manually rerun their own submissions. This also wipes the leaderboard for this task.";

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <div className="flex space-x-2">
            <Button variant="destructive" onClick={onSaveWithoutRerun}>
              Save only
            </Button>
            <AlertDialogAction onClick={onSaveWithRerun}>Save and rerun</AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RerunDialog;
