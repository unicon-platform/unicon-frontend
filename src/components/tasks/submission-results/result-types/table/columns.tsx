import { ColumnDef } from "@tanstack/react-table";

import { OutputSocket, Testcase } from "@/api";
import { OutputRenderer } from "@/components/tasks/submission-results/result-types/table/output-renderer";

export type Comparison = {
  operator: "<" | "=" | ">";
  value: boolean;
};

export type SocketMetadata = {
  id: string;
  label: string;
  comparison?: Comparison;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  public: boolean;
};

export type Result = {
  value: unknown;
  socketMetadata: OutputSocket;
  testcase: Testcase;
  id: string;
  correct: boolean;
  className?: string;
};

export const columns: ColumnDef<Result>[] = [
  {
    accessorKey: "socketMetadata.label",
    header: "Label",
  },
  {
    accessorFn: ({ value }) => JSON.stringify(value, null, 2),
    header: "Got",
    cell: ({ getValue }) => <OutputRenderer output={getValue<string>()} />,
  },
  {
    id: "operator",
    header: "",
    cell: ({ row }) => {
      return <div>{row.original.socketMetadata.comparison?.operator ?? ""}</div>;
    },
  },
  {
    id: "expected",
    header: "Expected",
    cell: ({ row }) => {
      const socketMetadata = row.original.socketMetadata;
      if (!socketMetadata.comparison) {
        return <div></div>;
      }
      return <OutputRenderer output={JSON.stringify(socketMetadata.comparison.value)} />;
    },
  },
];
