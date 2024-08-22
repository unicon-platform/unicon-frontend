import { TaskNodeData } from "../lib/types";
import { range } from "../utils";
import { NodeSlot, NodeSlotGroup } from "./NodeSlot";

export function TaskNode({
  participants,
  numArtifacts,
}: Pick<TaskNodeData, "participants" | "numArtifacts">) {
  const participantsType: string = participants.isGroup ? "Group" : "User";
  return (
    <>
      <div className="flex flex-row justify-between">
        <NodeSlotGroup>
          {range(participants.n).map((i: number) => (
            <NodeSlot
              id={`Task.In.${participantsType}.${i}`}
              label={`${participantsType} ${i + 1}`}
              type="source"
            />
          ))}
          {range(numArtifacts).map((i: number) => (
            <NodeSlot
              id={`Task.In.Artifact.${i}`}
              label={`Artifact ${i + 1}`}
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
