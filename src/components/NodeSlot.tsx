import { HandleType, Position as HandlePosition, Handle } from "@xyflow/react";

interface NodeSlotProps {
  id: string;
  label: string;
  type: HandleType;
}

export function NodeSlot({ id, label, type }: NodeSlotProps) {
  return (
    <div className={`flex ${type === "target" ? "flex-row-reverse" : ""} my-1`}>
      <Handle
        className="h-3 w-3 bg-slate-300 rounded-full relative"
        id={id}
        type={type}
        position={
          type === "source" ? HandlePosition.Left : HandlePosition.Right
        }
      />
      {label}
    </div>
  );
}
