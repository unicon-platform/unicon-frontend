// Referenced from: https://ui.shadcn.com/blocks/sidebar#sidebar-11
import { ChevronRight, File, FileDigit, FilePlus, Folder, FolderPlus, X } from "lucide-react";
import * as React from "react";
import { useDrag, useDrop } from "react-dnd";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { DragItemType } from "@/lib/drag";
import { FileTreeType, isFolder, removeLeadingSlash, TreeFile, TreeFolder } from "@/lib/files";
import { cn } from "@/lib/utils";

type OwnProps = {
  files: FileTreeType;
  onCloseFileTree?: () => void;
  onPathChange?: (oldPath: string, newPath: string) => void;
  onFileAdd?: () => void;
  onFolderAdd?: () => void;
  onPathDelete?: (path: string) => void;
};

const DeleteContextMenu: React.FC<
  React.PropsWithChildren & { path: string; onPathDelete?: (path: string) => void }
> = ({ path, onPathDelete, children }) => {
  if (!onPathDelete) {
    return <>{children}</>;
  }
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onPathDelete(path)}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export function FileTree({
  onCloseFileTree,
  onPathChange,
  onFileAdd,
  onFolderAdd,
  onPathDelete,
  files,
  ...props
}: React.ComponentProps<typeof Sidebar> & OwnProps) {
  const [, drop] = useDrop<TreeFile | TreeFolder>(() => ({
    accept: DragItemType.File,
    drop: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if ("children" in draggedItem) {
        onPathChange?.(draggedItem.path, draggedItem.name + "/");
      } else {
        onPathChange?.(draggedItem.path, draggedItem.name);
      }
    },
  }));

  return (
    <Sidebar {...props} className="relative h-full w-[300px] rounded-md border" collapsible="none">
      <SidebarContent className="h-full overflow-y-auto" ref={drop}>
        <SidebarGroup className="relative h-full">
          {onCloseFileTree && (
            <SidebarGroupLabel>
              <div className="flex w-full items-center justify-between">
                <div>Files</div>
                <X className="h-4 w-4 cursor-pointer" onClick={onCloseFileTree} />
              </div>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className="h-full">
            {files && (
              <SidebarMenu>
                {files.map((item) => (
                  <Tree key={item.path} item={item} onPathChange={onPathChange} onPathDelete={onPathDelete} />
                ))}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {(onFileAdd || onFolderAdd) && (
        <SidebarFooter>
          <div className="flex items-center justify-end gap-2">
            {onFileAdd && (
              <Button variant="outline" className="h-8 w-8" type="button" onClick={onFileAdd}>
                <FilePlus />
              </Button>
            )}
            {onFolderAdd && (
              <Button variant="outline" className="h-8 w-8" type="button" onClick={onFolderAdd}>
                <FolderPlus />
              </Button>
            )}
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

function Tree({
  item,
  onPathChange,
  onPathDelete,
}: {
  item: TreeFolder | TreeFile;
  onPathChange?: (oldPath: string, newPath: string) => void;
  onPathDelete?: (path: string) => void;
}) {
  const isItemFolder = isFolder(item);
  // for file/folder name editing
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(item.name);

  const toast = useToast();

  const handleNameChange = (oldName: string, newName: string) => {
    if (!newName) {
      return;
    }
    if (oldName === newName) {
      return;
    }

    const isFolder = item.path.endsWith("/");
    const parts = item.path.split("/");

    // A folder is a path that ends with / while a file does not.
    // So the parts (split by /) have a "" at end for folders
    // If the item is a folder, we thus need to rename the SECOND LAST part (the last part is an empty string)
    // If the item is a file, we need to rename the LAST part.
    const newPath = isFolder
      ? parts.slice(0, -2).concat([newName, ""]).join("/")
      : removeLeadingSlash(parts.slice(0, -1).join("/") + "/" + newName);

    const success = onPathChange?.(item.path, newPath);
    if (!success) {
      toast.toast({
        title: `Error - Cannot rename ${item.path} to ${newPath}`,
        description: "Name already exists",
      });
      setName(oldName);
    } else {
      setName(newName);
    }
  };

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: DragItemType.File, // todo: refactor
      item,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [item],
  );

  const [, drop] = useDrop<TreeFile | TreeFolder>(
    () => ({
      accept: DragItemType.File,
      drop: (draggedItem, monitor) => {
        if (monitor.didDrop()) {
          return;
        }
        if (!isFolder(item)) {
          return;
        }
        if (draggedItem.path === item.path) {
          return;
        }

        const oldPath = draggedItem.path;
        if (isFolder(draggedItem) && oldPath[oldPath.length - 1] !== "/") {
          throw new Error("Folder path should end with /, " + JSON.stringify(draggedItem));
        }

        const newPath = item.path + draggedItem.name + (isFolder(draggedItem) ? "/" : "");
        onPathChange?.(oldPath, newPath);
      },
    }),
    [item],
  );

  if (!isItemFolder) {
    return (
      <DeleteContextMenu onPathDelete={onPathDelete} path={item.path}>
        <SidebarMenuButton
          className={cn({
            "bg-primary/10 hover:bg-primary/20": item.highlighted,
            "data-[active=true]:bg-transparent": !item.highlighted,
            "bg-destructive opacity-50": isDragging,
          })}
          type="button"
          size="lg"
          onClick={item.onClick}
          ref={drag}
        >
          {item.isBinary ? <FileDigit /> : <File />}
          {isEditing ? (
            <input
              type="text"
              className={cn(
                "nodrag inline max-w-fit rounded-sm border border-primary/30 bg-transparent p-1 font-mono text-xs",
              )}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setIsEditing(false);
                  handleNameChange(item.name, name);
                }
                if (e.key === "Escape") {
                  setIsEditing(false);
                  setName(item.name);
                }
              }}
              size={name.length}
            />
          ) : (
            <span
              className={cn("inline-block", { "border border-input px-1": isEditing })}
              spellCheck={false}
              onClick={(e) => {
                e.preventDefault();
                if (onPathChange) {
                  setIsEditing(true);
                  e.stopPropagation();
                }
              }}
            >
              {item.name}
            </span>
          )}
        </SidebarMenuButton>
      </DeleteContextMenu>
    );
  }

  return (
    <DeleteContextMenu onPathDelete={onPathDelete} path={item.path}>
      <SidebarMenuItem ref={drop}>
        <Collapsible className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton ref={drag}>
              <ChevronRight className="transition-transform" />
              <Folder />
              {isEditing ? (
                <input
                  type="text"
                  className={cn(
                    "nodrag inline max-w-fit rounded-sm border border-primary/30 bg-transparent p-1 font-mono text-xs",
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setIsEditing(false);
                      handleNameChange(item.name, name);
                    }
                    if (e.key === "Escape") {
                      setIsEditing(false);
                      setName(item.name);
                    }
                  }}
                  size={name.length}
                />
              ) : (
                <span
                  className={cn("inline-block", { "border border-input px-1": isEditing })}
                  onClick={(e) => {
                    if (onPathChange) {
                      setIsEditing(true);
                      e.stopPropagation();
                    }
                  }}
                >
                  {item.name}
                </span>
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          {item.children.length > 0 && (
            <CollapsibleContent>
              <SidebarMenuSub className="mr-0 pr-0">
                {item.children.map((subItem) => (
                  <Tree key={subItem.path} item={subItem} onPathChange={onPathChange} onPathDelete={onPathDelete} />
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          )}
        </Collapsible>
      </SidebarMenuItem>
    </DeleteContextMenu>
  );
}
