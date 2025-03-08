import { FileIcon } from "lucide-react";
import { AiOutlinePython } from "react-icons/ai";

import { StepSocket } from "@/api";
import { Badge } from "@/components/ui/badge";
import { getDataType } from "@/lib/compute-graph";

type OwnProps = {
  socket: StepSocket;
};

const SocketTypeBadge: React.FC<OwnProps> = ({ socket }) => {
  // This should not happen. If it does, we make a guess. If types are still missing, don't render a badge.
  if (socket.data && !socket.data_type) {
    socket.data_type = getDataType(socket.data);
  }

  if (!socket.data_type) {
    return null;
  }

  return (
    <Badge className={"w-fit border-dashed border-blue-300 text-[0.5rem] leading-[0.75rem]"} variant={"outline"}>
      {socket.data_type === "PythonObject" ? (
        <>
          <AiOutlinePython className="mr-1" />
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
