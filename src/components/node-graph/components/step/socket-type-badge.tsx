import { FileIcon } from "lucide-react";

import { StepSocket } from "@/api";
import { Badge } from "@/components/ui/badge";
import { IconDeviconPlainPython } from "@/components/ui/icon-devicon-plain-python";

type OwnProps = {
  socket: StepSocket;
};

const SocketTypeBadge: React.FC<OwnProps> = ({ socket }) => {
  return (
    <Badge className={"w-fit border-dashed border-blue-300 text-[0.5rem] leading-[0.75rem]"} variant={"outline"}>
      {socket.data_type === "PythonObject" ? (
        <>
          <IconDeviconPlainPython className="mr-1" />
          {socket.data_type_metadata && (
            <>
              - <code className="ml-1">{socket.data_type_metadata.name as string}</code>
            </>
          )}
        </>
      ) : socket.data_type === "UniconFile" ? (
        <>
          <FileIcon className="mr-1 h-2 w-2" /> - File
        </>
      ) : (
        <>{socket.data_type}</>
      )}
    </Badge>
  );
};

export default SocketTypeBadge;
