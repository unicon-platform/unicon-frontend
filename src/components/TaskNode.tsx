import { NodeSlot } from "./NodeSlot";

export function TaskNode() {
  return (
    <>
      <div className="flex flex-row justify-between py-2">
        {/* In Handles */}
        <div className="flex flex-col grow-0 font-mono">
          <NodeSlot id="Task.In.1" label="Participant" type="source" />
          <NodeSlot id="Task.In.2" label="Submission 1 (Code)" type="source" />
          <NodeSlot id="Task.In.3" label="Submission 2 (Report)" type="source" />
        </div>
        {/* Out Handles */}
        <div className="flex flex-col grow-0 py-1">
          <NodeSlot id="Group.Out" label="" type="target" />
        </div>
      </div>
    </>
  );
}
