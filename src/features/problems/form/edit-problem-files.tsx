import { Trash } from "lucide-react";
import { useState } from "react";

import { FileOrm } from "@/api";
import FileInputButton from "@/components/form/inputs/file-input-button";
import EmptyPlaceholder from "@/components/layout/empty-placeholder";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table-overflow";
import { formatDateShort } from "@/utils/date";

export type BufferedFiles = {
  filesToAdd: File[];
  fileIdsToRemove: number[];
};

type OwnProps = {
  supportingFiles: FileOrm[];
  bufferedFiles: BufferedFiles;
  setBufferedFiles: React.Dispatch<React.SetStateAction<BufferedFiles>>;
};

const EditProblemFilesSection: React.FC<OwnProps> = ({ supportingFiles, bufferedFiles, setBufferedFiles }) => {
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [selectedBufferedFileIndexes, setSelectedBufferedFileIndexes] = useState<number[]>([]);

  const retainedFiles = supportingFiles.filter((file) => !bufferedFiles.fileIdsToRemove.includes(file.id!));
  const hasFiles = retainedFiles.length > 0 || bufferedFiles.filesToAdd.length > 0;
  const hasSelectedFiles = selectedFileIds.length > 0 || selectedBufferedFileIndexes.length > 0;

  return (
    <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:gap-0">
      <div className="sticky top-0">
        <h2 className="min-w-[200px] text-lg font-medium">Files</h2>
      </div>
      <div className="flex w-full flex-col gap-4">
        <div className="flex gap-2">
          <FileInputButton
            onFileChange={(filelist) =>
              filelist &&
              setBufferedFiles({ ...bufferedFiles, filesToAdd: [...bufferedFiles.filesToAdd, ...Array.from(filelist)] })
            }
            buttonText="Add file"
            buttonSize="default"
            className=""
            iconClassName=""
            multiple
          />
          {hasSelectedFiles && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setBufferedFiles({
                  filesToAdd: bufferedFiles.filesToAdd.filter(
                    (_, index) => !selectedBufferedFileIndexes.includes(index),
                  ),
                  fileIdsToRemove: [...bufferedFiles.fileIdsToRemove, ...selectedFileIds],
                });
                setSelectedFileIds([]);
                setSelectedBufferedFileIndexes([]);
              }}
            >
              <Trash />
              Delete selected
            </Button>
          )}
        </div>
        {/* File table */}
        {hasFiles && (
          <Table hideOverflow>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={hasSelectedFiles}
                    onClick={() => {
                      setSelectedFileIds(hasSelectedFiles ? [] : supportingFiles.map((file) => file.id!));
                      setSelectedBufferedFileIndexes(
                        hasSelectedFiles ? [] : Array.from({ length: bufferedFiles.filesToAdd.length }, (_, i) => i),
                      );
                    }}
                  />
                </TableHead>
                <TableHead>File name</TableHead>
                <TableHead>Date added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {retainedFiles
                // This should never happen.
                .filter((file) => file.id !== null && file.id !== undefined)
                .map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Checkbox
                        checked={file.id ? selectedFileIds.includes(file.id) : false}
                        onClick={() => {
                          setSelectedFileIds((prev) =>
                            prev.includes(file.id!) ? prev.filter((id) => id !== file.id) : [...prev, file.id!],
                          );
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <a
                        className="underline decoration-primary hover:decoration-primary/20"
                        href={import.meta.env.VITE_BACKEND_URL + "/files/" + file.key}
                        download={file.path.split("/").pop()!}
                      >
                        {file.path}
                      </a>
                    </TableCell>
                    <TableCell>{formatDateShort(file.created_at)}</TableCell>
                  </TableRow>
                ))}
              {bufferedFiles.filesToAdd.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBufferedFileIndexes.includes(index)}
                      onClick={() => {
                        setSelectedFileIds((prev) =>
                          prev.includes(index) ? prev.filter((id) => id !== index) : [...prev, index],
                        );
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <a
                      className="underline decoration-primary hover:decoration-primary/20"
                      href={URL.createObjectURL(file)}
                      download={file.name}
                    >
                      {file.name}
                    </a>
                  </TableCell>
                  <TableCell className="italic">[ Not yet saved ] </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!hasFiles && <EmptyPlaceholder description="No files uploaded." />}
      </div>
    </div>
  );
};

export default EditProblemFilesSection;
