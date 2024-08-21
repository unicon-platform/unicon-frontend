import { ArtifactNodeData } from "../lib/types";
import { NodeSlot } from "./NodeSlot";

export function ArtifactNode({ fileType }: Pick<ArtifactNodeData, "fileType">) {
  return (
    <>
      <div className="px-2">.{fileType}</div>
      <div className="flex flex-row justify-between py-2">
        {/* In Handles */}
        <div className="flex flex-col grow-0 font-mono">
        </div>
        {/* Out Handles */}
        <div className="flex flex-col grow-0 py-1">
          <NodeSlot id="Group.Out" label="" type="target" />
        </div>
      </div>
    </>
  );
}
