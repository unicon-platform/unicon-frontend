import { FileIcon } from "lucide-react";

import { FileOrm } from "@/api";
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
          <a
            key={file.id}
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md bg-zinc-800 p-4 px-8 transition-colors hover:bg-zinc-700 hover:underline"
            download={file.path}
            onClick={() => downloadFile(file.key)}
          >
            <FileIcon className="h-4 w-4" />
            {file.path}
          </a>
        ))}
      </div>
    </div>
  );
};
