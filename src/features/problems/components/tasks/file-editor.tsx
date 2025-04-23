import { Editor, OnChange as EditorContentOnChange } from "@monaco-editor/react";
import { FileIcon, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type FileTabProps = {
  fileName: string;
  onFileNameChange?: (newFileName: string) => void;
  onFileClosed?: () => void;
  canEdit?: boolean;
};

const FileTab: React.FC<FileTabProps> = ({ fileName, onFileNameChange, onFileClosed, canEdit = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(fileName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEditing = () => {
    if (!canEdit) return;
    setIsEditing(true);
    setEditValue(fileName);
  };

  const finishEditing = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== fileName && onFileNameChange) {
      onFileNameChange(editValue);
    } else {
      setEditValue(fileName);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      finishEditing();
    } else if (e.key === "Escape") {
      setEditValue(fileName);
      setIsEditing(false);
    }
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="group flex h-8 items-center gap-1.5 border px-3 text-primary">
      <FileIcon size={15} />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          className="h-6 w-32 border px-1 font-mono text-sm outline-none"
          autoFocus
        />
      ) : (
        <span
          className={cn("cursor-default select-none text-sm", canEdit && "cursor-text")}
          onClick={startEditing}
          title={fileName}
        >
          {fileName}
        </span>
      )}

      {onFileClosed && (
        <button
          className="ml-1 flex h-4 w-4 items-center justify-center rounded-sm opacity-0 transition-opacity hover:bg-secondary hover:opacity-100 focus:outline-none group-hover:opacity-70"
          onClick={onFileClosed}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

type FileEditorProps = {
  fileName: string;
  fileContent: string;
  onFileNameChange?: (newFileName: string) => void;
  onFileContentChange?: (newFileContent: string) => void;
  onFileClosed?: () => void;
  canEditFileName?: boolean;
  canEditFileContent?: boolean;
  className?: string;
};

// Assumes debouncing is handled by the parent component onUpdateFileName and onUpdateFileContent
const FileEditor: React.FC<FileEditorProps> = ({
  fileName,
  fileContent,
  onFileNameChange,
  onFileContentChange,
  onFileClosed,
  canEditFileName = false,
  canEditFileContent = false,
  className,
}) => {
  const { theme } = useTheme();

  const updateFileName = (newValue: string) => {
    if (onFileNameChange) onFileNameChange(newValue);
  };
  const updateFileContent: EditorContentOnChange = (newValue: string | undefined, _) => {
    if (onFileContentChange) onFileContentChange(newValue ?? "");
  };

  const fileExtension = fileName.split(".").pop() || "";

  return (
    <div className={cn("flex h-full grow flex-col", className)}>
      <div className="flex border-b">
        <FileTab
          fileName={fileName}
          onFileNameChange={updateFileName}
          onFileClosed={onFileClosed}
          canEdit={canEditFileName}
        />
      </div>
      <Editor
        theme={theme === "dark" ? "vs-dark" : "vs"}
        defaultLanguage="python"
        language={fileExtension}
        className="border"
        options={{
          padding: { top: 8 },
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
          fontFamily: "'Geist Mono', monospace",
          readOnly: !canEditFileContent,
          fontSize: 13,
          lineHeight: 1.5,
          hideCursorInOverviewRuler: true,
          overviewRulerBorder: false,
          smoothScrolling: true,
        }}
        value={fileContent}
        onChange={updateFileContent}
      />
    </div>
  );
};

export default FileEditor;
