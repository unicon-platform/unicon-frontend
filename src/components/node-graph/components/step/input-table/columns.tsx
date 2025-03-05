import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";

import { InputSocket, InputStep } from "@/api";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import { getProblemById } from "@/features/problems/queries";
import { useProblemId } from "@/features/projects/hooks/use-id";
import { isUniconFile } from "@/lib/utils";

import ViewFileButton from "./view-file-button";

const ValueDisplay: React.FC<{ row: InputSocket & { step: InputStep } }> = ({ row }) => {
  const data = row.data;
  const problemId = useProblemId();
  const { data: problem } = useQuery(getProblemById(problemId));
  const censored = !row.public && !problem?.view_hidden_details;

  if (censored) {
    return <span className="italic text-zinc-500">-Redacted-</span>;
  }
  return (
    <div>{data && isUniconFile(data) ? <ViewFileButton socket={row} step={row.step} /> : JSON.stringify(data)}</div>
  );
};

export const columns: ColumnDef<InputSocket & { step: InputStep }>[] = [
  {
    accessorFn: (row) => row.label,
    header: "Label",
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
