import "@xyflow/react/dist/style.css";

import { ReactFlowProvider } from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { useImmerReducer } from "use-immer";

import { File as UniconFile, GraphEdgeStr as GraphEdge, InputStep } from "@/api";
import {
  GraphAction,
  GraphActionType,
  GraphContext,
  GraphDispatchContext,
  graphReducer,
} from "@/features/problems/components/tasks/graph-context";
import GraphEditor from "@/features/problems/components/tasks/graph-editor";
import { TestcaseSettingsType } from "@/features/problems/components/tasks/testcase-settings";
import { Step } from "@/features/problems/components/tasks/types";

type NodeGraphProps = {
  id: string;
  sharedUserInput?: InputStep;
  steps: Step[];
  edges: GraphEdge[];
  edit: boolean;
  onChange?: (action: GraphAction) => void;
  taskFiles: UniconFile[];

  // For testcase settings menu
  settings?: TestcaseSettingsType;
  onDelete?: () => void;
  onSettingsChange?: (change: TestcaseSettingsType) => void;
  onDuplicateTestcase?: () => void;
};

const NodeGraph: React.FC<NodeGraphProps> = ({
  id,
  sharedUserInput,
  steps,
  edges,
  edit,
  onChange,
  taskFiles,
  settings,
  onDelete,
  onSettingsChange,
  onDuplicateTestcase,
}) => {
  const [graph, dispatch] = useImmerReducer(graphReducer, {
    id,
    steps,
    edges,
    selectedSocketId: null,
    selectedStepId: null,
    edit,
    files: taskFiles,
  });
  useEffect(() => {
    if (!sharedUserInput) return;
    dispatch({
      type: GraphActionType.UpdateUserInputStep,
      payload: { step: sharedUserInput },
    });
  }, [sharedUserInput, dispatch]);

  const wrappedDispatch = useCallback(
    (action: GraphAction) => {
      dispatch(action);
      if (onChange) onChange(action);
    },
    [dispatch, onChange],
  );

  return (
    <ReactFlowProvider>
      <GraphContext.Provider value={{ ...graph, files: taskFiles }}>
        <GraphDispatchContext.Provider value={wrappedDispatch}>
          <GraphEditor
            graphId={id}
            className="h-[60vh]"
            settings={settings}
            onDelete={onDelete}
            onSettingsChange={onSettingsChange}
            onDuplicateTestcase={onDuplicateTestcase}
          />
        </GraphDispatchContext.Provider>
      </GraphContext.Provider>
    </ReactFlowProvider>
  );
};

export default NodeGraph;
