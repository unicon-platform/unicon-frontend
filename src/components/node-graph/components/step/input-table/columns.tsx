import { ColumnDef } from "@tanstack/react-table";

import { InputSocket, InputStep } from "@/api";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import { isUniconFile } from "@/lib/utils";

import ViewFileButton from "./view-file-button";

export const columns: ColumnDef<InputSocket & { step: InputStep }>[] = [
  {
    accessorFn: (row) => row.label,
    header: "Label",
  },
  {
    header: "Value",
    cell: ({ row }) => {
      const data = row.original.data;
      return (
        <div>
          {data && isUniconFile(data) ? (
            <ViewFileButton socket={row.original} step={row.original.step} />
          ) : (
            JSON.stringify(data)
          )}
        </div>
      );
    },
  },
  {
    header: "Public",
    cell: ({ row }) => {
      return <div>{row.original.public ? "Yes" : "No"}</div>;
    },
  },
  {
    id: "handle",
    header: "",
    cell: ({ row }) => {
      const socket = row.original;
      return (
        <NodeSlot
          key={socket.id}
          socket={socket}
          type="source"
          hideLabel
          handleStyle={{ width: "20px", borderRadius: "10px", right: "-12px" }}
        />
      );
    },
  },
];
