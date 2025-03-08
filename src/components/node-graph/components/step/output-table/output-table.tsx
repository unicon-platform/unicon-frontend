import { OutputSocket } from "@/api";
import { columns } from "@/components/node-graph/components/step/output-table/columns";
import { DataTable } from "@/components/ui/data-table";

type OwnProps = {
  data: OutputSocket[];
};

const OutputTable: React.FC<OwnProps> = ({ data }) => {
  return <DataTable columns={columns} data={data} hidePagination hideOverflow />;
};

export default OutputTable;
