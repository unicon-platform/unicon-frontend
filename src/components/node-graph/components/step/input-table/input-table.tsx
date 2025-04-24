import { useContext } from "react";

import { InputStep, StepSocket } from "@/api";
import { columns } from "@/components/node-graph/components/step/input-table/columns";
import { DataTable } from "@/components/ui/data-table";
import { GraphContext } from "@/features/problems/components/tasks/graph-context";

type OwnProps = {
  step: InputStep;
  data: StepSocket[];
};

const InputTable: React.FC<OwnProps> = ({ data, step }) => {
  const { selectedSocketId, selectedStepId } = useContext(GraphContext)!;
  return (
    <DataTable
      columns={columns}
      data={data.map((row) => {
        const rowIsSelected = selectedSocketId === row.id && selectedStepId === step.id;
        return { ...row, step, className: rowIsSelected && "bg-primary/5 hover:bg-primary/10" };
      })}
      hidePagination
      hideOverflow
    />
  );
};

export default InputTable;
