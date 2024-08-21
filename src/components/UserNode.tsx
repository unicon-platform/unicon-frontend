import { UserNodeData } from "../lib/types";
import { NodeSlot } from "./NodeSlot";

export function UserNode({ course }: Pick<UserNodeData, "course">) {
  return (
    <>
      <div className="px-2 text-slate-300 font-mono">{course}</div>
      {/* Out Handles */}
      <div className="flex flex-row-reverse py-2">
        <div className="flex flex-col grow-0">
          <NodeSlot id="User.Out" label="" type="target" />
        </div>
      </div>
    </>
  );
}
