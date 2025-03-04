import { HandleType, useUpdateNodeInternals } from "@xyflow/react";
import { PlusIcon, TrashIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useCallback, useContext, useEffect } from "react";

import { PyRunFunctionSocket, PyRunFunctionStep, StepSocket, StepType } from "@/api";
import { NodeSlot } from "@/components/node-graph/components/node-slot";
import StepMetadata from "@/components/node-graph/components/step/metadata/step-metadata";
import { Button } from "@/components/ui/button";
import {
  GraphActionType,
  GraphContext,
  GraphDispatchContext,
  SocketDir,
} from "@/features/problems/components/tasks/graph-context";
import { Step } from "@/features/problems/components/tasks/types";
import { createSocket, isRequiredInputStep } from "@/lib/compute-graph";
import { StepNodeColorMap, StepTypeAliasMap, StepTypeIconMap } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PyRunSocketSlots } from "./py-run-socket-slots";

const NodeHeader = ({ type, edit, deleteStep }: { type: StepType; edit: boolean; deleteStep: () => void }) => {
  return (
    <div
      className="w-content flex items-center justify-between gap-10 rounded-t border-2 p-2"
      style={{ borderColor: StepNodeColorMap[type] }}
    >
      <div className="flex items-center gap-2">
        <DynamicIcon size={20} name={StepTypeIconMap[type]} color={StepNodeColorMap[type]} />
        <span className="text-sm font-medium capitalize">{StepTypeAliasMap[type]}</span>
      </div>
      {edit && (
        <Button className="h-fit w-fit bg-transparent px-2" variant="secondary" onClick={deleteStep} type="button">
          <TrashIcon />
        </Button>
      )}
    </div>
  );
};

export function NodeSlotGroup({
  type,
  sockets,
  onEditData,
  onEditLabel,
  onDelete,
  children,
  forceUneditable = () => false,
}: {
  type: HandleType;
  sockets: StepSocket[];
  onEditData?: (socketId: string) => (newSocketData: string | number | boolean | null) => void;
  onEditLabel?: (socketId: string) => (newSocketLabel: string) => void;
  onDelete?: (socketId: string) => () => void;
  // Hide all edit/delete functions for this socket if this function returns true.
  forceUneditable?: (socket: PyRunFunctionSocket) => boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {sockets.map((s) => {
        const notEditable = forceUneditable(s as PyRunFunctionSocket);
        return (
          <NodeSlot
            key={s.id}
            type={type}
            socket={s}
            onEditData={onEditData && !notEditable ? onEditData(s.id) : undefined}
            onEditLabel={onEditLabel && !notEditable ? onEditLabel(s.id) : undefined}
            onDelete={onDelete && !notEditable ? onDelete(s.id) : undefined}
          />
        );
      })}
      {children}
    </div>
  );
}

export function StepNode({ data }: { data: Step }) {
  const updateNodeInternals = useUpdateNodeInternals();

  const { edit: inEditMode } = useContext(GraphContext)!;
  const dispatch = useContext(GraphDispatchContext)!;

  const inSockets = data.inputs ?? [];
  const outSockets = data.outputs ?? [];
  const filterSocketsByType = (sockets: StepSocket[], type: string) => sockets.filter((s) => s.type === type);

  const inControlSockets = filterSocketsByType(inSockets, "CONTROL");
  const outControlSockets = filterSocketsByType(outSockets, "CONTROL");

  const inDataSockets = filterSocketsByType(inSockets, "DATA");
  const outDataSockets = filterSocketsByType(outSockets, "DATA");

  const editable = inEditMode && !isRequiredInputStep(data);

  // `PyRunFunctionStep` is a special case where we don't allow the same level of socket editing
  // as the other steps. This is because the step has its own mechanism to determine the number of
  // inputs and outputs, along with the labels for each socket.
  const _isPyRunFunc = data.type === "PY_RUN_FUNCTION_STEP";
  const _isPyRunFuncWithNoFunction = _isPyRunFunc && !(data as PyRunFunctionStep).function_identifier;
  const editableLabel = editable && !_isPyRunFunc;
  const canAddSockets = editable && !_isPyRunFunc;
  const canDeleteSockets = editable && !_isPyRunFunc;

  // `Input` and `Output` steps have the sockets and handles in their custom metadata
  // components, so we there's no need to provide them with default sockets and handles
  // like the other steps
  const socketsInMetadata = ["OUTPUT_STEP", "INPUT_STEP"].includes(data.type);

  // We are programmatically updating the internal state of the node (e.g. adding more handles)
  // as such we will need to sync it with ReactFlow
  // Reference: https://reactflow.dev/learn/troubleshooting#008
  useEffect(() => updateNodeInternals(data.id), [data]);

  const _onEditLabel = (socketId: string) => (newSocketLabel: string) => {
    dispatch({
      type: GraphActionType.UpdateSocketLabel,
      payload: { stepId: data.id, socketId, newSocketLabel },
    });
  };
  const onEditLabel = editableLabel ? _onEditLabel : undefined;

  const _onEditData = (socketId: string) => (newSocketData: string | number | boolean | null) => {
    dispatch({
      type: GraphActionType.UpdateSocketData,
      payload: { stepId: data.id, socketId, data: newSocketData },
    });
  };
  const onEditData = inEditMode ? _onEditData : undefined;

  const _onDeleteSocket = (socketId: string) => () => {
    dispatch({
      type: GraphActionType.DeleteSocket,
      payload: { stepId: data.id, socketId },
    });
  };
  const onDeleteSocket = canDeleteSockets ? _onDeleteSocket : undefined;

  const addSocket = useCallback(
    (socketDir: SocketDir) => () => {
      dispatch({
        type: GraphActionType.AddSocket,
        payload: {
          stepId: data.id,
          socketDir,
          socket: {
            ...createSocket("DATA", ""),
          },
        },
      });
    },
    [data.id, dispatch],
  );

  if (data.type === "INPUT_STEP") {
    console.log(data.outputs);
  }

  const deleteStep = useCallback(
    () => dispatch({ type: GraphActionType.DeleteStep, payload: { id: data.id } }),
    [data.id, dispatch],
  );

  return (
    <div className="rounded-b-lg bg-[#141414]">
      <NodeHeader type={data.type} edit={editable} deleteStep={deleteStep} />
      <div className="flex min-w-52 flex-col gap-2 rounded-b-lg border-x-2 border-b-2 py-3">
        <div className={cn("flex flex-col gap-2", { "flex-col-reverse": !socketsInMetadata })}>
          <div className="flex flex-row justify-between gap-8">
            <NodeSlotGroup type="target" sockets={inControlSockets} />
            <NodeSlotGroup type="source" sockets={outControlSockets} />
          </div>
          <StepMetadata step={data} editable={editable} />
        </div>
        {!socketsInMetadata &&
          (!inEditMode || !_isPyRunFuncWithNoFunction ? (
            <div className="font-mono text-xs">
              <div className="flex flex-row justify-between gap-8">
                <NodeSlotGroup
                  type="target"
                  sockets={inDataSockets}
                  onEditData={onEditData}
                  onEditLabel={onEditLabel}
                  onDelete={onDeleteSocket}
                >
                  {canAddSockets && (
                    <Button
                      size={"sm"}
                      className="ml-2 h-fit w-fit px-1 py-1"
                      variant="secondary"
                      onClick={addSocket(SocketDir.Input)}
                      type="button"
                    >
                      <PlusIcon />
                    </Button>
                  )}
                </NodeSlotGroup>
                <NodeSlotGroup
                  type="source"
                  sockets={outDataSockets}
                  onEditData={onEditData}
                  onEditLabel={onEditLabel}
                  onDelete={onDeleteSocket}
                >
                  {canAddSockets && (
                    <Button
                      size={"sm"}
                      className="mr-2 h-fit w-fit self-end px-1 py-1"
                      variant="secondary"
                      onClick={addSocket(SocketDir.Output)}
                      type="button"
                    >
                      <PlusIcon />
                    </Button>
                  )}
                </NodeSlotGroup>
              </div>
            </div>
          ) : (
            <PyRunSocketSlots
              stepId={data.id}
              inDataSockets={inDataSockets}
              outDataSockets={outDataSockets}
              addSocket={addSocket}
              onEditData={_onEditData}
              onDeleteSocket={_onDeleteSocket}
            />
          ))}
      </div>
    </div>
  );
}
