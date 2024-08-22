import { useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node as FlowNode,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Edge,
  Connection,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { Node } from "./components/Node";
import { NodeData, NodeType } from "./lib/types";

const nodeTypes = {
  custom: Node,
};

// TEMP: for testing
const initialNodes: FlowNode<NodeData>[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 0, y: 0 },
    data: { label: "User", type: NodeType.USER, course: "CS2109S" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 10, y: 0 },
    data: { label: "User", type: NodeType.USER, course: "CS3234" },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 20, y: 0 },
    data: {
      label: "Task",
      type: NodeType.TASK,
      participants: {
        n: 1,
        isGroup: true,
      },
      numArtifacts: 1,
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 30, y: 0 },
    data: {
      label: "Task",
      type: NodeType.TASK,
      participants: {
        n: 2,
        isGroup: false,
      },
      numArtifacts: 3,
    },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 40, y: 0 },
    data: { label: "Group", type: NodeType.GROUP, minUsers: 1, maxUsers: 3 },
  },
  {
    id: "6",
    type: "custom",
    position: { x: 50, y: 0 },
    data: { label: "Artifact", type: NodeType.ARTIFACT, fileType: "pdf" },
  },
  {
    id: "7",
    type: "custom",
    position: { x: 60, y: 0 },
    data: { label: "Artifact", type: NodeType.ARTIFACT, fileType: "py" },
  },
];

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes: NodeChange<FlowNode<NodeData>>[]) =>
        setNodes((nodes) => applyNodeChanges(changes, nodes))
      }
      onEdgesChange={(changes: EdgeChange<Edge>[]) =>
        setEdges((edges) => applyEdgeChanges(changes, edges))
      }
      onConnect={(connection: Connection) =>
        setEdges((edges) => addEdge(connection, edges))
      }
      colorMode="dark"
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
