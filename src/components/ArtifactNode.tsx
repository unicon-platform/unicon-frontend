import { ArtifactNodeData } from "../lib/types";
import { NodeSlot } from "./NodeSlot";

export function ArtifactNode({ fileType }: Pick<ArtifactNodeData, "fileType">) {
  return (
    <>
      <div className="px-2">.{fileType}</div>
      <NodeSlot id="Group.Out" label="" type="target" />
    </>
  );
}
