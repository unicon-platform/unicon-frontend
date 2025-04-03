import * as React from "react";

import { File as UniconFile, InputStep, Testcase as TestcaseApi } from "@/api";
import { GraphAction } from "@/features/problems/components/tasks/graph-context";
import NodeGraph from "@/features/problems/components/tasks/node-graph";
import { TestcaseSettingsType } from "@/features/problems/components/tasks/testcase-settings";

type TestcaseProps = {
  index: number;
  testcase: TestcaseApi;
  taskFiles: UniconFile[];
  // Node graph editor props
  edit: boolean;
  nodeGraphOnChange?: (action: GraphAction) => void;
  // Used during testcase creation where each testcase has the same user input
  // NOTE: If this is set, the nodes in the testcase will not contain the user input node
  sharedUserInput?: InputStep;
  onDelete?: (index: number) => () => void;
  // For testcase settings metadata (e.g. name, private)
  onSettingsChange?: (change: TestcaseSettingsType) => void;
  onDuplicateTestcase?: () => void;
};

const Testcase: React.FC<TestcaseProps> = ({
  index,
  testcase,
  edit,
  nodeGraphOnChange,
  sharedUserInput,
  onDelete,
  taskFiles,
  onSettingsChange,
  onDuplicateTestcase,
}) => {
  const settings = {
    name: testcase.name,
    isPrivate: testcase.is_private,
    showNodeGraph: testcase.show_node_graph,
    score: testcase.score ?? 1,
  };

  return (
    <NodeGraph
      edit={edit}
      id={testcase.id}
      key={testcase.id}
      taskFiles={taskFiles}
      sharedUserInput={sharedUserInput}
      steps={testcase.nodes}
      edges={testcase.edges}
      onChange={nodeGraphOnChange}
      // For testcase settings menu
      settings={settings}
      onDelete={onDelete && onDelete(index)}
      onSettingsChange={onSettingsChange}
      onDuplicateTestcase={onDuplicateTestcase}
    />
  );
};

export default Testcase;
