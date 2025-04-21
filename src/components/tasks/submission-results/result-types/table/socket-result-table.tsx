import { columns, Result } from "@/components/tasks/submission-results/result-types/table/columns";
import { DataTable } from "@/components/ui/data-table";

type OwnProps = {
  data: Result[];
};

const SocketResultTable: React.FC<OwnProps> = ({ data }) => {
  data.forEach((result) => {
    result.className = result.correct ? "bg-green-800/30 hover:bg-green-800/0" : "bg-red-800/30 hover:bg-red-800/0";
  });
  return <DataTable columns={columns} data={data} hidePagination />;
};

export default SocketResultTable;
