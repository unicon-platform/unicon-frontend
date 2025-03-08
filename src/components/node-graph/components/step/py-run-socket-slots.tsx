import { PlusIcon } from "lucide-react";
import { useContext } from "react";

import { PyRunFunctionSocket, UniconType } from "@/api";
import { NodeSlotGroup } from "@/components/node-graph/components/step/step-node";
import { Button } from "@/components/ui/button";
import { GraphActionType, GraphDispatchContext, SocketDir } from "@/features/problems/components/tasks/graph-context";

type OwnProps = {
  stepId: string;
  inDataSockets: PyRunFunctionSocket[];
  outDataSockets: PyRunFunctionSocket[];
  // These 3 actions do not differ from other steps.
  addSocket: (socketDir: SocketDir, dataType?: UniconType | null) => () => void;
  onEditData: (socketId: string) => (newSocketData: string | number | boolean | null) => void;
  onDeleteSocket: (socketId: string) => () => void;
};

// This is for PyRunFunctionStep's no-function socket editing.
// It is to support that for NO-FUNCTION steps, the kwargs are editable. (Nothing else is.)
export const PyRunSocketSlots: React.FC<OwnProps> = ({
  stepId,
  inDataSockets,
  outDataSockets,
  addSocket,
  onEditData,
  onDeleteSocket,
}) => {
  const dispatch = useContext(GraphDispatchContext)!;

  const onEditLabel = (socketId: string) => (newSocketLabel: string) => {
    dispatch({
      type: GraphActionType.UpdateSocketMetadata,
      payload: {
        stepId,
        socketId,
        socketMetadata: {
          label: newSocketLabel,
          kwarg_name: newSocketLabel,
        },
      },
    });
  };

  return (
    <div className="font-mono text-xs">
      <div className="flex flex-row justify-between gap-8">
        <NodeSlotGroup
          type="target"
          sockets={inDataSockets}
          onEditData={onEditData}
          onEditLabel={onEditLabel}
          onDelete={onDeleteSocket}
          forceUneditable={(s) => !!s.import_as_module}
        >
          <Button
            size={"sm"}
            className="ml-2 h-fit w-fit px-1 py-1"
            variant="secondary"
            onClick={addSocket(SocketDir.Input, "unknown")}
            type="button"
          >
            <PlusIcon />
          </Button>
        </NodeSlotGroup>
        <NodeSlotGroup type="source" sockets={outDataSockets} />
      </div>
    </div>
  );
};
