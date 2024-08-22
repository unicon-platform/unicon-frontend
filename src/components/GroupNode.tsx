import { GroupNodeData } from "../lib/types";
import { NodeSlot, NodeSlotGroup } from "./NodeSlot";
import { IoPeopleCircle } from "react-icons/io5";

export function GroupNode({
  minUsers,
  maxUsers,
}: Pick<GroupNodeData, "minUsers" | "maxUsers">) {
  return (
    <>
      <div className="flex items-center px-2 mb-2">
        <IoPeopleCircle className="mr-1" />
        {minUsers}-{maxUsers}
      </div>
      <div className="flex flex-row justify-between">
        <NodeSlotGroup>
          {[...Array(maxUsers)].map((_, i) => (
            <NodeSlot
              id={`Group.In.${i}`}
              label={`User ${i + 1}`}
              type="source"
            />
          ))}
        </NodeSlotGroup>
        <NodeSlotGroup>
          <NodeSlot id="Group.Out" label="" type="target" />
        </NodeSlotGroup>
      </div>
    </>
  );
}
