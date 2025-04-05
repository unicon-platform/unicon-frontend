import { createContext, Dispatch } from "react";
import { ImmerReducer } from "use-immer";

import {
  Comparison,
  GraphEdgeStr as GraphEdge,
  InputSocket,
  InputStep,
  ParsedFunction,
  PyRunFunctionSocket,
  PyRunFunctionStep,
  StepSocket,
  UniconType,
} from "@/api";
import { File as UniconFile } from "@/api";
import { Step } from "@/features/problems/components/tasks/types";
import {
  areSocketsCompatible,
  createSocket,
  getDataType,
  isRequiredInputStep,
  isResultSocket,
} from "@/lib/compute-graph";
import { isUniconFile } from "@/lib/utils";

export type GraphState = {
  id: string;
  steps: Step[];
  edges: GraphEdge[];
  selectedStepId: string | null;
  selectedSocketId: string | null;
  edit: boolean;
  files: UniconFile[];
};

export enum GraphActionType {
  // Step/Node actions
  AddStep = "ADD_STEP",
  DeleteStep = "DELETE_STEP",
  UpdateStepMetadata = "UPDATE_STEP_METADATA",
  // Socket actions
  AddSocket = "ADD_SOCKET",
  DeleteSocket = "DELETE_SOCKET",
  UpdateSocketData = "UPDATE_SOCKET_DATA",
  UpdateSocketLabel = "UPDATE_SOCKET_LABEL",
  UpdateSocketMetadata = "UPDATE_SOCKET_METADATA",
  // Edge actions
  AddEdge = "ADD_EDGE",
  DeleteEdge = "DELETE_EDGE",
  // Select/Focus actions
  SelectSocket = "SELECT_SOCKET",
  DeselectSocket = "DESELECT_SOCKET",
  // Special actions
  UpdateUserInputStep = "UPDATE_USER_INPUT_STEP",
  UpdatePyRunFunctionStep = "UPDATE_FUNCTION_IDENTIFIER_STEP",
  UpdateFiles = "UPDATE_FILES",
}

interface BaseGraphAction {
  type: GraphActionType;
  payload?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface AddStepAction extends BaseGraphAction {
  type: GraphActionType.AddStep;
  payload: { step: Step };
}

interface DeleteStepAction extends BaseGraphAction {
  type: GraphActionType.DeleteStep;
  payload: { id: string };
}

interface UpdateStepMetadataAction extends BaseGraphAction {
  type: GraphActionType.UpdateStepMetadata;
  payload: { id: string; stepMetadata: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export enum SocketDir {
  Input = "INPUT",
  Output = "OUTPUT",
}

interface AddSocketAction extends BaseGraphAction {
  type: GraphActionType.AddSocket;
  payload: { stepId: string; socketDir: SocketDir; socket: StepSocket | InputSocket };
}

interface DeleteSocketAction extends BaseGraphAction {
  type: GraphActionType.DeleteSocket;
  payload: { stepId: string; socketId: string };
}

interface UpdateSocketLabelAction extends BaseGraphAction {
  type: GraphActionType.UpdateSocketLabel;
  payload: { stepId: string; socketId: string; newSocketLabel: string };
}

interface UpdateSocketMetadataAction extends BaseGraphAction {
  type: GraphActionType.UpdateSocketMetadata;
  payload: {
    stepId: string;
    socketId: string;
    socketMetadata: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
}

interface UpdateSocketDataAction extends BaseGraphAction {
  type: GraphActionType.UpdateSocketData;
  payload: {
    stepId: string;
    socketId: string;
    data: string | number | boolean | null;
  };
}

interface AddEdgeAction extends BaseGraphAction {
  type: GraphActionType.AddEdge;
  payload: {
    id: string;
    from_node_id: string;
    from_socket_id: string;
    to_node_id: string;
    to_socket_id: string;
  };
}

interface DeleteEdgeAction extends BaseGraphAction {
  type: GraphActionType.DeleteEdge;
  payload: { id: string };
}

interface SelectSocketAction extends BaseGraphAction {
  type: GraphActionType.SelectSocket;
  payload: { stepId: string; socketId: string };
}

interface DeselectSocketAction extends BaseGraphAction {
  type: GraphActionType.DeselectSocket;
}

interface DeselectSocketAction extends BaseGraphAction {
  type: GraphActionType.DeselectSocket;
}

interface UpdateUserInputStepAction extends BaseGraphAction {
  type: GraphActionType.UpdateUserInputStep;
  payload: { step: InputStep };
}

interface UpdatePyRunFunctionStepAction extends BaseGraphAction {
  type: GraphActionType.UpdatePyRunFunctionStep;
  payload: {
    stepId: string;
    functionIdentifier: string | null;
    functionSignature?: ParsedFunction;
    propagateStdout: boolean;
    propagateStderr: boolean;
    allowError: boolean;
    // UUIDs are currently generate when dispatching the action to synchronise with
    // the testcase that is also replaying actions to track the graph changes.
    uuids: string[];
  };
}

interface UpdateFilesAction extends BaseGraphAction {
  type: GraphActionType.UpdateFiles;
  payload: { files: UniconFile[] };
}

export type GraphAction =
  | AddStepAction
  | DeleteStepAction
  | UpdateStepMetadataAction
  | AddSocketAction
  | DeleteSocketAction
  | UpdateSocketDataAction
  | UpdateSocketLabelAction
  | UpdateSocketMetadataAction
  | AddEdgeAction
  | DeleteEdgeAction
  | SelectSocketAction
  | DeselectSocketAction
  | UpdateUserInputStepAction
  | UpdatePyRunFunctionStepAction
  | UpdateFilesAction;

const _filterInvalidEdges = (state: GraphState) => {
  state.edges = state.edges.filter((edge) => {
    const fromNode = state.steps.find((node) => node.id === edge.from_node_id);
    const toNode = state.steps.find((node) => node.id === edge.to_node_id);
    const fromSocket = fromNode?.outputs?.find((socket) => socket.id === edge.from_socket_id);
    const toSocket = toNode?.inputs?.find((socket) => socket.id === edge.to_socket_id);
    return areSocketsCompatible(fromSocket, toSocket);
  });

  return state;
};

const updateUserInputStep = (state: GraphState, { payload }: UpdateUserInputStepAction) => {
  const userInputStepIdx = state.steps.findIndex(isRequiredInputStep);
  if (userInputStepIdx !== -1) Object.assign(state.steps[userInputStepIdx], { outputs: payload.step.outputs });
  return state;
};

const sameFunctionSignature = (a: PyRunFunctionSocket[], b: PyRunFunctionSocket[]) => {
  if (a.length !== b.length) return false;
  return a.every((socket, index) => {
    const other = b[index];
    return (
      socket.type === other.type &&
      socket.label === other.label &&
      socket.arg_metadata?.position === other.arg_metadata?.position &&
      socket.arg_metadata?.arg_name === other.arg_metadata?.arg_name &&
      socket.data_type === other.data_type &&
      socket.data_type_metadata === other.data_type_metadata &&
      // In the case where one is null and the other is undefined - consider them the same
      ((!socket.kwarg_name && !other.kwarg_name) || socket.kwarg_name === other.kwarg_name)
    );
  });
};

const updatePyRunFunctionStep = (state: GraphState, { payload }: UpdatePyRunFunctionStepAction) => {
  const stepIndex = state.steps.findIndex((node) => node.id === payload.stepId);
  const step = state.steps[stepIndex] as PyRunFunctionStep;

  const getUuid = (() => {
    let index = 0;
    return () => {
      const uuid = payload.uuids[index];
      if (!uuid) throw new Error("UUIDs are empty");
      index++;
      return uuid;
    };
  })();

  // Detect changes
  const functionIdentifierChanged = step.function_identifier !== payload.functionIdentifier;
  const functionSignatureChanged = payload.functionSignature !== undefined;
  const allowErrorChanged = !!step.allow_error !== !!payload.allowError;
  const propagateStdoutChanged = !!step.propagate_stdout !== !!payload.propagateStdout;
  const propagateStderrChanged = !!step.propagate_stderr !== !!payload.propagateStderr;

  if (functionIdentifierChanged) {
    // 1. Update the identifier.
    state.steps[stepIndex] = {
      ...state.steps[stepIndex],
      function_identifier: payload.functionIdentifier,
    } as PyRunFunctionStep;
  }

  // This if statement has all logic regarding the INPUTS of the py-run-function-step
  if (functionSignatureChanged && payload.functionSignature) {
    // If args/kwargs have changed, we need to:
    //   1. Replace the input sockets with arguments of the new function signature.
    //   2. Remove all edges and replace args/kwargs connected to the node except the file edge
    // Otherwise, become a no-op.

    const functionArgs: PyRunFunctionSocket[] = payload.functionSignature.args.map((arg, index) => {
      // Check if the socket is pre-filled with data
      const pythonType = arg.type;
      const existingSocket = step.inputs.find((socket) => socket.arg_metadata?.position === index);
      return {
        ...createSocket(
          "DATA",
          arg.name + (arg.default ? ` (default:${arg.default})` : ""),
          existingSocket?.data ?? null,
          "PythonObject",
          { name: pythonType },
        ),
        id: getUuid(),
        arg_metadata: {
          position: index,
          arg_name: arg.name,
        },
      };
    });

    const functionKwargs: PyRunFunctionSocket[] = payload.functionSignature.kwargs.map((kwarg) => {
      const pythonType = kwarg.type;
      const existingSocket = step.inputs.find((socket) => socket.kwarg_name === kwarg.name);

      return {
        ...createSocket(
          "DATA",
          kwarg.name + (kwarg.default ? ` = ${kwarg.default}` : ""),
          existingSocket?.data ?? null,
          "PythonObject",
          { name: pythonType },
        ),
        id: getUuid(),
        kwarg_name: kwarg.name,
      };
    });

    if (
      !sameFunctionSignature(
        step.inputs.filter((input) => !input.import_as_module && input.type !== "CONTROL"),
        [...functionArgs, ...functionKwargs],
      )
    ) {
      const fileSocket = step.inputs.find((socket) => socket.import_as_module);
      state.edges = state.edges.filter(
        (edge) => edge.to_node_id !== payload.stepId || edge.to_socket_id === fileSocket?.id,
      );

      state.steps[stepIndex] = {
        ...state.steps[stepIndex],
        inputs: [
          { ...createSocket("CONTROL"), id: getUuid() },
          {
            ...createSocket("DATA", "Module", null, "UniconFile"),
            id: fileSocket?.id ?? getUuid(),
            import_as_module: true,
          },
          ...functionArgs,
          ...functionKwargs,
        ],
      } as PyRunFunctionStep;
    }
  }

  const pushOutputSocket = (
    label: string,
    properties: Partial<PyRunFunctionSocket>,
    dataType: UniconType = "text",
    dataTypeMetadata?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    (state.steps[stepIndex] as PyRunFunctionStep).outputs.push({
      ...createSocket("DATA", label, null, dataType, dataTypeMetadata),
      id: getUuid(),
      ...properties,
    });
  };

  const removeOutputSocket = (property: "handles_error" | "handles_stderr" | "handles_stdout" | "result") => {
    const outputSocketId =
      property === "result"
        ? step.outputs.find(isResultSocket)?.id
        : step.outputs.find((socket) => socket[property])?.id;
    if (!outputSocketId) {
      return;
    }
    state.steps[stepIndex].outputs = step.outputs.filter((socket) => socket.id !== outputSocketId);
    state.edges = state.edges.filter(
      (edge) => edge.from_node_id !== payload.stepId || edge.from_socket_id !== outputSocketId,
    );
  };

  if (allowErrorChanged) {
    // If allow error is changed to true, add a new output socket.
    // If allow error is changed to false, remove the output socket and outgoing edges.
    state.steps[stepIndex] = {
      ...state.steps[stepIndex],
      allow_error: payload.allowError,
    } as PyRunFunctionStep;
    if (payload.allowError) {
      pushOutputSocket("Error", { handles_error: true }, "PythonObject", { name: "Exception" });
    } else {
      removeOutputSocket("handles_error");
    }
  }

  if (propagateStdoutChanged) {
    // If propagate stdout is changed to true, add a new output socket.
    // If propagate stdout is changed to false, remove the output socket and outgoing edges.
    state.steps[stepIndex] = {
      ...state.steps[stepIndex],
      propagate_stdout: payload.propagateStdout,
    } as PyRunFunctionStep;
    if (payload.propagateStdout) {
      pushOutputSocket("Stdout", { handles_stdout: true });
    } else {
      removeOutputSocket("handles_stdout");
    }
  }

  if (propagateStderrChanged) {
    // If propagate stderr is changed to true, add a new output socket.
    // If propagate stderr is changed to false, remove the output socket and outgoing edges.
    state.steps[stepIndex] = {
      ...state.steps[stepIndex],
      propagate_stderr: payload.propagateStderr,
    } as PyRunFunctionStep;
    if (payload.propagateStderr) {
      pushOutputSocket("Stderr", { handles_stderr: true });
    } else {
      removeOutputSocket("handles_stderr");
    }
  }

  if (!payload.functionIdentifier) {
    // If there is a result socket, remove it.
    removeOutputSocket("result");
  } else {
    // If there is no result socket, add one. Otherwise, fix the type.
    if (!step.outputs.find(isResultSocket)) {
      pushOutputSocket("Result", {}, "PythonObject", { name: payload.functionSignature?.return_type ?? "Any" });
    } else {
      const resultSocket = step.outputs.find(isResultSocket);
      resultSocket!.data_type = "PythonObject";
      resultSocket!.data_type_metadata = { name: payload.functionSignature?.return_type ?? "Any" };
    }
  }

  // Order of sockets: control, result, stdout?, stderr?, error?
  (state.steps[stepIndex] as PyRunFunctionStep).outputs?.sort((a, b) => {
    if (a.type === "CONTROL") return -1;
    if (b.type === "CONTROL") return 1;
    // Result socket
    if (isResultSocket(a)) return -1;
    if (isResultSocket(b)) return 1;
    // Stdout socket
    if (a.handles_stdout) return -1;
    if (b.handles_stdout) return 1;
    // Stderr socket
    if (a.handles_stderr) return -1;
    if (b.handles_stderr) return 1;
    // Error socket
    if (a.handles_error) return -1;
    if (b.handles_error) return 1;
    return 0;
  });

  return state;
};

const updateFiles = (state: GraphState, { payload }: UpdateFilesAction) => {
  const idToFile: Record<string, UniconFile> = payload.files.reduce((acc, file) => ({ ...acc, [file.id]: file }), {});
  state.steps = state.steps.map((node) => {
    if (node.type !== "INPUT_STEP") return node;
    const outputs = (node as InputStep).outputs.map((output) =>
      isUniconFile(output.data) && output.data.id in idToFile ? { ...output, data: idToFile[output.data.id] } : output,
    );
    return { ...node, outputs };
  });
  return state;
};

const addStep = (state: GraphState, { payload }: AddStepAction) => {
  state.steps.push(payload.step);
  return state;
};

const deleteStep = (state: GraphState, { payload }: DeleteStepAction) => {
  state.steps = state.steps.filter((node) => node.id !== payload.id);
  state.edges = state.edges.filter((edge) => edge.from_node_id !== payload.id && edge.to_node_id !== payload.id);

  if (state.selectedStepId === payload.id) {
    state.selectedStepId = null;
    state.selectedSocketId = null;
  }

  return state;
};

const updateStepMetadata = (state: GraphState, { payload }: UpdateStepMetadataAction) => {
  const stepIndex = state.steps.findIndex((node) => node.id === payload.id);
  state.steps[stepIndex] = {
    ...state.steps[stepIndex],
    ...payload.stepMetadata,
  };
  return state;
};

// Note: we only create data sockets with this method.
// All control sockets are created on initialisation and should not be changed
const addSocket = (state: GraphState, { payload }: AddSocketAction) => {
  const step = state.steps.find((node) => node.id === payload.stepId);
  if (!step) return state;

  (payload.socketDir === SocketDir.Input ? step.inputs : step.outputs)?.push(payload.socket);
  return state;
};

const deleteSocket = (state: GraphState, { payload }: DeleteSocketAction) => {
  const step = state.steps.find((node) => node.id === payload.stepId);
  if (!step) return state;

  step.inputs = step.inputs?.filter((socket) => socket.id !== payload.socketId);
  step.outputs = step.outputs?.filter((socket) => socket.id !== payload.socketId);

  state.edges = state.edges.filter(
    (edge) =>
      !(
        [edge.from_node_id, edge.to_node_id].includes(payload.stepId) &&
        [edge.from_socket_id, edge.to_socket_id].includes(payload.socketId)
      ),
  );

  state.selectedStepId = state.selectedStepId === payload.stepId ? null : state.selectedStepId;
  state.selectedSocketId = state.selectedSocketId === payload.socketId ? null : state.selectedSocketId;

  return state;
};

const updateSocketData = (state: GraphState, { payload }: UpdateSocketDataAction) => {
  const stepIndex = state.steps.findIndex((node) => node.id === payload.stepId);
  if (stepIndex === -1) return state;

  const step = state.steps[stepIndex];
  const socket =
    step.inputs?.find((socket) => socket.id === payload.socketId) ||
    step.outputs?.find((socket) => socket.id === payload.socketId);
  if (socket === undefined) return state;

  socket.data = payload.data;
  if (step.type === "INPUT_STEP") {
    socket.data_type = getDataType(payload.data);
  }
  return state;
};

const updateSocketLabel = (state: GraphState, { payload }: UpdateSocketLabelAction) => {
  const stepIndex = state.steps.findIndex((node) => node.id === payload.stepId);
  if (stepIndex === -1) return state;

  const step = state.steps[stepIndex];
  const socket =
    step.inputs?.find((socket) => socket.id === payload.socketId) ||
    step.outputs?.find((socket) => socket.id === payload.socketId);
  if (socket === undefined) return state;

  socket.label = payload.newSocketLabel;
  if (isUniconFile(socket.data)) {
    socket.data.path = payload.newSocketLabel;
  }

  return state;
};

const updateSocketMetadata = (state: GraphState, { payload }: UpdateSocketMetadataAction) => {
  const step = state.steps.find((node) => node.id === payload.stepId);
  if (!step) return state;

  const socket =
    step.inputs?.find((socket) => socket.id === payload.socketId) ||
    step.outputs?.find((socket) => socket.id === payload.socketId);
  if (!socket) return state;

  Object.assign(socket, payload.socketMetadata);
  if (payload.socketMetadata.data !== undefined && step.type === "INPUT_STEP") {
    socket.data_type = getDataType(payload.socketMetadata.data);
  } else if (payload.socketMetadata.comparison !== undefined) {
    const comparison = payload.socketMetadata.comparison as Comparison;
    // This is when the user just creates an expected value (click '+') but has not set a value.
    // Do not toggle to null, otherwise the types won't match and user cannot connect things.
    if (!(comparison.value === null && socket.data_type === "unknown")) {
      socket.data_type = comparison.value !== null ? getDataType(comparison.value) : "unknown";
    }
  }

  return state;
};

const selectSocket = (state: GraphState, { payload }: SelectSocketAction) => {
  const selectedStep = state.steps.find((node) => node.id === payload.stepId);
  if (!selectedStep) return state;

  // NOTE: This is used only for `InputStep` so far, so this is okay
  const selectedSocket = selectedStep.outputs?.find((socket) => socket.id === payload.socketId);

  if (!selectedSocket) return state;

  state.selectedStepId = selectedStep.id;
  state.selectedSocketId = selectedSocket.id;

  return state;
};

const deselectSocket = (state: GraphState, _action: DeselectSocketAction) => {
  state.selectedStepId = null;
  state.selectedSocketId = null;
  return state;
};

const addEdge = (state: GraphState, { payload }: AddEdgeAction) => {
  state.edges.push({ ...payload });
  return state;
};

const deleteEdge = (state: GraphState, { payload }: DeleteEdgeAction) => {
  state.edges = state.edges.filter((edge) => edge.id !== payload.id);
  return state;
};

const actionHandlers = {
  [GraphActionType.AddStep]: addStep,
  [GraphActionType.DeleteStep]: deleteStep,
  [GraphActionType.UpdateStepMetadata]: updateStepMetadata,
  [GraphActionType.AddSocket]: addSocket,
  [GraphActionType.DeleteSocket]: deleteSocket,
  [GraphActionType.UpdateSocketData]: updateSocketData,
  [GraphActionType.UpdateSocketLabel]: updateSocketLabel,
  [GraphActionType.UpdateSocketMetadata]: updateSocketMetadata,
  [GraphActionType.SelectSocket]: selectSocket,
  [GraphActionType.DeselectSocket]: deselectSocket,
  [GraphActionType.AddEdge]: addEdge,
  [GraphActionType.DeleteEdge]: deleteEdge,
  [GraphActionType.UpdateUserInputStep]: updateUserInputStep,
  [GraphActionType.UpdatePyRunFunctionStep]: updatePyRunFunctionStep,
  [GraphActionType.UpdateFiles]: updateFiles,
};

export const graphReducer: ImmerReducer<GraphState, GraphAction> = (
  state: GraphState,
  action: GraphAction,
): GraphState => {
  const newState = actionHandlers[action.type](state, action as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (
    [
      GraphActionType.UpdateSocketData,
      GraphActionType.UpdateSocketMetadata,
      GraphActionType.UpdatePyRunFunctionStep,
    ].includes(action.type)
  ) {
    return _filterInvalidEdges(newState);
  }
  return newState;
};

export const GraphContext = createContext<GraphState | null>(null);
export const GraphDispatchContext = createContext<Dispatch<GraphAction> | null>(null);
