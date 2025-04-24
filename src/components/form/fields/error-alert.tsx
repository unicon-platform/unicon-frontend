import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type OwnProps = {
  message: string;
  className?: string;
};

const ErrorAlert: React.FC<OwnProps> = ({ message, className }) => {
  return (
    <Alert variant="destructive" className={cn(className, "flex gap-4")}>
      <div>
        <CircleAlert className="h-5 w-5" />
      </div>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
