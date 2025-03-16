import { CircleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";

type OwnProps = {
  message: string;
  className?: string;
};

const ErrorAlert: React.FC<OwnProps> = ({ message, className }) => {
  return (
    <Alert variant="destructive" className={className}>
      <div>
        <CircleAlert className="h-5 w-5" />
      </div>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
