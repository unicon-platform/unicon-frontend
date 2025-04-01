export const isTextFile = (f: File): boolean => f.type.startsWith("text") || f.type === "application/json";

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// File tree abstraction

type FileType = {
  id: string;
  path: string;
  content: string;
  isBinary: boolean;
  downloadUrl: string;
  onClick?: () => void;
};

export type TreeFile = FileType & {
  name: string;
  highlighted?: boolean;
};

export type TreeFolder = {
  name: string;
  path: string;
  children: (TreeFolder | TreeFile)[];
};

export const isFolder = (item: TreeFolder | TreeFile): item is TreeFolder => "children" in item;

export type FileTreeType = (TreeFolder | TreeFile)[];

export const removeLeadingSlash = (path: string) => path.replace(/^\//, "");

const sortFileTree = (files: FileTreeType) => {
  files.sort((a, b) => a.name.localeCompare(b.name));
  for (const item of files) if ("children" in item) sortFileTree(item.children);
};

export const convertFilesToFileTree = (files: FileType[]): FileTreeType => {
  const tree: FileTreeType = [];
  for (const file of files) {
    const unfilteredPathParts = file.path.split("/");
    // It is possible there are "folder/" files, so the last part could be "".
    // In that case, show the folder, but don't create a file.
    const pathParts = unfilteredPathParts.filter(
      (part, index) => !["", "."].includes(part) || index === unfilteredPathParts.length - 1,
    );
    let currentTree = tree;
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderName = pathParts[i];
      const folder = currentTree.find((item): item is TreeFolder => "children" in item && item.name === folderName);
      if (folder) {
        currentTree = folder.children;
      } else {
        const newFolder: TreeFolder = {
          name: folderName,
          path: pathParts.slice(0, i + 1).join("/") + "/",
          children: [],
        };
        currentTree.push(newFolder);
        currentTree = newFolder.children;
      }
    }
    const fileName = pathParts[pathParts.length - 1];
    if (fileName) currentTree.push({ name: fileName, ...file });
  }
  sortFileTree(tree);
  return tree;
};

export async function downloadFile(key: string) {
  const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/files/" + key, {
    credentials: "include",
  });
  if (!response.ok) throw new Error("Failed to download file");

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = key;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
}
