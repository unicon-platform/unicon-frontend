import {
  BaseEdge,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Node,
  OnSelectionChangeFunc,
  Position,
  useOnSelectionChange,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useCallback, useContext, useState } from "react";

import {
  GraphActionType,
  GraphContext,
  GraphDispatchContext,
} from "@/features/problems/components/tasks/graph-context";
import { Step } from "@/features/problems/components/tasks/types";
import { areSocketsCompatible } from "@/lib/compute-graph";

export const StepEdge: React.FC<EdgeProps> = ({
  id,
  source,
  sourceHandleId,
  target,
  targetHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition: Position.Right,
    targetX,
    targetPosition: Position.Left,
    targetY,
  });

  const dispatch = useContext(GraphDispatchContext)!;
  const { steps, edit } = useContext(GraphContext)!;

  const handleDelete = useCallback(() => {
    if (edit) dispatch({ type: GraphActionType.DeleteEdge, payload: { id } });
  }, [dispatch, edit, id]);

  // Edge validation
  const outgoingSocket = steps.find((s) => s.id === source)?.outputs?.find((s) => s.id === sourceHandleId);
  const incomingSocket = steps.find((s) => s.id === target)?.inputs?.find((s) => s.id === targetHandleId);
  const isValidEdge = areSocketsCompatible(outgoingSocket, incomingSocket);

  // Conditional rendering of delete button
  const [isEdgeSelected, setIsEdgeSelected] = useState(false);

  const onChange: OnSelectionChangeFunc<Node<Step>, Edge> = useCallback(
    ({ edges }) => {
      setIsEdgeSelected(edges.some((edge) => edge.id === id));
    },
    [id],
  );

  useOnSelectionChange({
    onChange,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={isValidEdge ? {} : { stroke: "red" }} />
      {edit && isEdgeSelected && (
        <EdgeLabelRenderer>
          <button
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
            type="button"
            onClick={handleDelete}
          >
            <X className="stroke-red-600" />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default StepEdge;
