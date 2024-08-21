export enum NodeType {
  USER,
  GROUP,
  ARTIFACT,
  TASK,
}

interface INodeData extends Record<string, any> {
  label: string;
  type: NodeType;
}

export interface UserNodeData extends INodeData {
  label: "User";
  type: NodeType.USER;
  course: string;
}

export interface GroupNodeData extends INodeData {
  label: "Group";
  type: NodeType.GROUP;
  minUsers: number;
  maxUsers: number;
}

export interface ArtifactNodeData extends INodeData {
  label: "Artifact";
  type: NodeType.ARTIFACT;
  fileType: string;
}

export interface TaskNodeData extends INodeData {
  label: "Task";
  type: NodeType.TASK;
}

export type NodeData =
  | UserNodeData
  | GroupNodeData
  | TaskNodeData
  | ArtifactNodeData;
