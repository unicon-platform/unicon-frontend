import {
  type NodeProps as FlowNodeProps,
  type Node as FlowNode,
} from "@xyflow/react";
import { NodeData, NodeType } from "../lib/types";
import { GoDotFill } from "react-icons/go";
import { NodeColorMap } from "../lib/colors";
import { UserNode } from "./UserNode";
import { GroupNode } from "./GroupNode";
import { TaskNode } from "./TaskNode";
import { ArtifactNode } from "./ArtifactNode";

export function Node({ data }: FlowNodeProps<FlowNode<NodeData>>) {
  return (
    <div className="flex min-w-48 flex-col rounded bg-[#141414] pb-2 font-mono text-slate-300 outline outline-[0.08rem] outline-neutral-500">
      {/* Node header */}
      <div className="mb-2 flex items-center rounded-t px-2 py-1 text-sm font-medium uppercase">
        <GoDotFill
          style={{ color: `${NodeColorMap[data.type]}` }}
          className="mr-1"
        />
        {data.label}
      </div>
      {/* Node body */}
      <div className="text-xs font-light">
        {data.type === NodeType.USER ? (
          <UserNode course={data.course} />
        ) : data.type === NodeType.GROUP ? (
          <GroupNode minUsers={data.minUsers} maxUsers={data.maxUsers} />
        ) : data.type === NodeType.TASK ? (
          <TaskNode
            participants={data.participants}
            numArtifacts={data.numArtifacts}
          />
        ) : data.type === NodeType.ARTIFACT ? (
          <ArtifactNode fileType={data.fileType} />
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
