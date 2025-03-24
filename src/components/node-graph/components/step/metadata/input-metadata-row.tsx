import { Trash } from "lucide-react";
import { useContext } from "react";

import { InputSocket, InputStep } from "@/api";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import ViewFileButton from "@/components/node-graph/components/step/input-table/view-file-button";
import { SocketDataInput, SocketLabelInput } from "@/components/node-graph/components/step/node-input";
import SocketTypeBadge from "@/components/node-graph/components/step/socket-type-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { GraphContext } from "@/features/problems/components/tasks/graph-context";
import { cn, isUniconFile } from "@/lib/utils";

type OwnProps = {
  socket: InputSocket;
  onDelete: () => void;
  onEditSocketLabel: (newValue: string) => void;
  onChangeValue: (newValue: string | number | boolean | null) => void;
  step: InputStep;
  // note: this does not control whether you can connect an edge to this socket
  // connection is always allowed
  isEditable: boolean;
  onUpdateSocketMetadata: (newMetadata: Partial<InputSocket>) => void;
};

const InputMetadataRow: React.FC<OwnProps> = ({
  socket,
  onDelete,
  onEditSocketLabel,
  onChangeValue,
  step,
  isEditable,
  onUpdateSocketMetadata,
}) => {
  const { selectedSocketId, selectedStepId } = useContext(GraphContext)!;
  const rowIsSelected = selectedSocketId === socket.id && selectedStepId === step.id;
  return (
    <TableRow className={cn({ "!bg-emerald-900 hover:bg-emerald-800": rowIsSelected })}>
      <TableCell>
        {isEditable && (
          <Button size={"sm"} className="h-fit w-fit px-1 py-1" variant="secondary" onClick={onDelete} type="button">
            <Trash className="h-2 w-2" />
          </Button>
        )}
      </TableCell>
      <TableCell>
        <SocketLabelInput value={socket.label} onChange={onEditSocketLabel} canEdit={isEditable} />
      </TableCell>
      <TableCell>
        <SocketTypeBadge socket={socket} />
      </TableCell>

      <TableCell>
        {socket.data && isUniconFile(socket.data) ? (
          <div className="flex items-center gap-2">
            <ViewFileButton step={step} socket={socket} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SocketDataInput value={socket.data} onChange={onChangeValue} canEdit={isEditable} />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div>
          <Checkbox
            className="rounded-sm border border-gray-500/50"
            checked={socket.public || false}
            onCheckedChange={() => onUpdateSocketMetadata({ public: !socket.public })}
          />
        </div>
      </TableCell>
      <TableCell>
        <NodeSlot
          handleStyle={{ width: "20px", borderRadius: "10px", right: "-12px" }}
          socket={socket}
          type="source"
          hideLabel
          hideType
        />
      </TableCell>
    </TableRow>
  );
};

export default InputMetadataRow;
