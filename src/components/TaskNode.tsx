import { NodeSlot, NodeSlotGroup } from "./NodeSlot";

export function TaskNode() {
  return (
    <>
      <div className="flex flex-row justify-between">
        <NodeSlotGroup>
          <NodeSlot id="Task.In.1" label="Participant" type="source" />
          <NodeSlot id="Task.In.2" label="Submission 1 (Code)" type="source" />
          <NodeSlot
            id="Task.In.3"
            label="Submission 2 (Report)"
            type="source"
          />
        </NodeSlotGroup>
        <NodeSlotGroup>
          <NodeSlot id="Group.Out" label="" type="target" />
        </NodeSlotGroup>
      </div>
    </>
  );
}
