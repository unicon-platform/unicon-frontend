import { columns, Result } from "@/components/tasks/submission-results/result-types/table/columns";
import { DataTable } from "@/components/ui/data-table";

type OwnProps = {
  data: Result[];
};

const SocketResultTable: React.FC<OwnProps> = ({ data }) => {
  data.forEach((result) => {
    result.className = result.correct
      ? "bg-success/30 hover:bg-success/40"
      : "bg-destructive/30 hover:bg-destructive/40";
  });
  return <DataTable columns={columns} data={data} hidePagination />;
};

export default SocketResultTable;
