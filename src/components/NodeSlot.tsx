import { HandleType, Position as HandlePosition, Handle } from "@xyflow/react";

interface NodeSlotProps {
  id: string;
  label: string;
  type: HandleType;
}

export function NodeSlot({ id, label, type }: NodeSlotProps) {
  return (
    <div
      className={`${type === "target" ? "flex flex-row-reverse space-x-reverse" : "flex"} items-center my-1 space-x-2`}
    >
      <Handle
        style={{ border: "0", position: "static" }} // NOTE: Override default position to use flex positioning
        className={`h-4 w-2 bg-neutral-700 ${type === "target" ? "rounded-tl-full rounded-bl-full" : "rounded-tr-full rounded-br-full"}`}
        id={id}
        type={type}
        position={
          type === "source" ? HandlePosition.Left : HandlePosition.Right
        }
      />
      <span>{label}</span>
    </div>
  );
}

export function NodeSlotGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col grow-0">{children}</div>;
}
