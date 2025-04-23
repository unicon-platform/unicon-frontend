import { ArrowLeftRightIcon, Trash } from "lucide-react";
import { useContext } from "react";

import { InputSocket, InputStep } from "@/api";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import ViewFileButton from "@/components/node-graph/components/step/input-table/view-file-button";
import { SocketDataInput, SocketLabelInput } from "@/components/node-graph/components/step/node-input";
import SocketTypeBadge from "@/components/node-graph/components/step/socket-type-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table-overflow";
import { GraphContext } from "@/features/problems/components/tasks/graph-context";
import { cn, isUniconFile } from "@/lib/utils";

type OwnProps = {
  socket: InputSocket;
  onDelete: () => void;
  onEditSocketLabel: (newValue: string) => void;
  onChangeToFile: () => void;
  // this means changing from file to not file
  onChangeToValue: () => void;
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
  onChangeToFile,
  onChangeToValue,
  onChangeValue,
  step,
  isEditable,
  onUpdateSocketMetadata,
}) => {
  const { selectedSocketId, selectedStepId, files } = useContext(GraphContext)!;
  const isSharedTaskFile = files.some((file) => isUniconFile(socket.data) && file.id === socket.data?.id);
  const rowIsSelected = selectedSocketId === socket.id && selectedStepId === step.id;
  return (
    <TableRow className={cn({ "!bg-primary/5 hover:bg-primary/10": rowIsSelected })}>
      <TableCell>
        {isEditable && (
          <Button size={"sm"} className="h-fit w-fit px-1 py-1" variant="secondary" onClick={onDelete} type="button">
            <Trash className="h-2 w-2" />
          </Button>
        )}
      </TableCell>
      <TableCell>
        <SocketLabelInput value={socket.label} onChange={onEditSocketLabel} canEdit={isEditable && !isSharedTaskFile} />
      </TableCell>
      <TableCell>
        <SocketTypeBadge socket={socket} />
      </TableCell>

      <TableCell>
        {socket.data && isUniconFile(socket.data) ? (
          <div className="flex items-center gap-2">
            <ViewFileButton step={step} socket={socket} />
            {isEditable && !socket.data.on_minio && !isSharedTaskFile && (
              <ConfirmationDialog
                onConfirm={onChangeToValue}
                description="Are you sure you want to change this file to a primitive value?"
              >
                <Button size="sm" className="h-fit w-fit px-2 py-1" variant="secondary" type="button">
                  Value
                  <ArrowLeftRightIcon className="h-3 w-3" />
                </Button>
              </ConfirmationDialog>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <SocketDataInput value={socket.data} onChange={onChangeValue} canEdit={isEditable} />
            {isEditable && (
              <ConfirmationDialog
                onConfirm={onChangeToFile}
                description="Are you sure you want to change this value to a file?"
              >
                <Button size="sm" className="h-fit w-fit px-2 py-1" variant="secondary" type="button">
                  File
                  <ArrowLeftRightIcon className="h-3 w-3" />
                </Button>
              </ConfirmationDialog>
            )}
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
