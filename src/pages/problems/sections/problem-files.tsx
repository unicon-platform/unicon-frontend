import { FileIcon } from "lucide-react";

import { FileOrm } from "@/api";
import { Button } from "@/components/ui/button";
import { downloadFile } from "@/lib/files";

type ProblemFileProps = {
  files: FileOrm[] | undefined;
};

export const ProblemFiles: React.FC<ProblemFileProps> = ({ files }) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="text-lg font-medium">Files</div>
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <Button variant="outline" key={file.id} onClick={() => downloadFile(file.key)}>
            <FileIcon className="h-4 w-4" />
            {file.path}
          </Button>
        ))}
      </div>
    </div>
  );
};
