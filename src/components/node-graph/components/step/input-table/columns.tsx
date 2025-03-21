import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { InputSocket, InputStep } from "@/api";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import ViewFileButton from "@/components/node-graph/components/step/input-table/view-file-button";
import SocketTypeBadge from "@/components/node-graph/components/step/socket-type-badge";
import { getProblemById } from "@/features/problems/queries";
import { useProblemId } from "@/features/projects/hooks/use-id";
import { isUniconFile } from "@/lib/utils";

const ValueDisplay: React.FC<{ row: InputSocket & { step: InputStep } }> = ({ row }) => {
  const data = row.data;
  const problemId = useProblemId();
  const { data: problem } = useQuery(getProblemById(problemId));
  const censored = !row.public && !problem?.view_hidden_details;

  if (censored) {
    return <span className="italic text-zinc-500">-Redacted-</span>;
  }
  return data && isUniconFile(data) ? (
    <ViewFileButton socket={row} step={row.step} />
  ) : (
    <span className="font-mono">{JSON.stringify(data)}</span>
  );
};

export const columns: ColumnDef<InputSocket & { step: InputStep }>[] = [
  {
    accessorFn: (row) => row.label,
    header: "Label",
  },
  {
    header: "Type",
    cell: ({ row }) => {
      return <SocketTypeBadge socket={row.original} />;
    },
  },
  {
    header: "Value",
    cell: ({ row }) => {
      return <ValueDisplay row={row.original} />;
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
          hideType
          handleStyle={{ width: "20px", borderRadius: "10px", right: "-12px" }}
        />
      );
    },
  },
];
