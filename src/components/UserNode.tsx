import { UserNodeData } from "../lib/types";
import { NodeSlot } from "./NodeSlot";

export function UserNode({ course }: Pick<UserNodeData, "course">) {
  return (
    <>
      <div className="px-2 font-mono text-slate-300">{course}</div>
      <NodeSlot id="User.Out" label="" type="target" />
    </>
  );
}
