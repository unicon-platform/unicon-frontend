import { useQuery } from "@tanstack/react-query";
import { useNodeConnections, useNodesData } from "@xyflow/react";
import {
  CircleXIcon,
  MessageCircleMoreIcon,
  MessageCircleXIcon,
  ParenthesesIcon,
  RefreshCcw,
  TriangleAlert,
} from "lucide-react";
import { useContext, useState } from "react";

import { File as UniconFile, InputStep, PyRunFunctionStep } from "@/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import InfoTooltip from "@/components/ui/info-tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GraphActionType, GraphDispatchContext } from "@/features/problems/components/tasks/graph-context";
import { getFunctions } from "@/features/problems/queries";
import { isUniconFile, uuid } from "@/lib/utils";

type OwnProps = {
  step: PyRunFunctionStep;
  editable: boolean;
};

const PyRunMetadata: React.FC<OwnProps> = ({ step, editable }) => {
  const dispatch = useContext(GraphDispatchContext)!;

  const [functionIdentifier, setFunctionIdentifier] = useState<string | null>(step.function_identifier ?? null);

  const [allowError, setAllowError] = useState(step.allow_error || false);
  const [propagateStdout, setPropagateStdout] = useState(step.propagate_stdout || false);
  const [propagateStderr, setPropagateStderr] = useState(step.propagate_stderr || false);

  // We find the python file by tracing the connection from the file's input (with import_as_module = true)
  // to the input step's socket containing the file.
  const fileInput = step.inputs.find((input) => input.import_as_module);
  const connections = useNodeConnections({
    handleType: "target",
    handleId: fileInput?.id ?? "",
    id: step.id,
  });
  const connection = connections[0];
  const inputNode = useNodesData(connection?.source);
  const fileSocket = (inputNode?.data as InputStep | undefined)?.outputs.find(
    (output) => output.id === connection.sourceHandle,
  );
  const fileContent = fileSocket && isUniconFile(fileSocket.data) ? (fileSocket.data as UniconFile).content : undefined;

  const { data: functionSignatures } = useQuery({ ...getFunctions(fileContent ?? ""), enabled: !!fileContent });

  const onChange = (newFunctionIdentifier: string | null) => {
    const newFunctionSignature = functionSignatures?.find((signature) => signature.name === newFunctionIdentifier) ?? {
      args: [],
      kwargs: [],
      name: "",
      star_args: false,
      star_kwargs: false,
    };

    // Length of inputs array (args + kwargs) + 2 (function_identifier and allow_error) + 2 (output and error)
    const uuidsNeeded = newFunctionSignature.args.length + newFunctionSignature.kwargs.length + 4;
    const uuids = Array.from({ length: uuidsNeeded }, uuid);
    dispatch({
      type: GraphActionType.UpdatePyRunFunctionStep,
      payload: {
        stepId: step.id,
        functionIdentifier: newFunctionIdentifier,
        functionSignature: newFunctionSignature,
        allowError: allowError,
        propagateStdout: propagateStdout,
        propagateStderr: propagateStderr,
        uuids: uuids,
      },
    });
  };

  const onAllowErrorChange = () => {
    const uuids = [uuid()];
    setAllowError((allowError) => {
      dispatch({
        type: GraphActionType.UpdatePyRunFunctionStep,
        payload: {
          stepId: step.id,
          functionIdentifier,
          allowError: !allowError,
          propagateStdout: propagateStdout,
          propagateStderr: propagateStderr,
          uuids: uuids,
        },
      });
      return !allowError;
    });
  };
  const onPropagateStdoutChange = () => {
    const uuids = [uuid()];
    setPropagateStdout((propagateStdout) => {
      dispatch({
        type: GraphActionType.UpdatePyRunFunctionStep,
        payload: {
          stepId: step.id,
          functionIdentifier,
          allowError: allowError,
          propagateStdout: !propagateStdout,
          propagateStderr: propagateStderr,
          uuids: uuids,
        },
      });
      return !propagateStdout;
    });
  };

  const onPropagateStderrChange = () => {
    const uuids = [uuid()];
    setPropagateStderr((propagateStderr) => {
      dispatch({
        type: GraphActionType.UpdatePyRunFunctionStep,
        payload: {
          stepId: step.id,
          functionIdentifier,
          allowError: allowError,
          propagateStdout: propagateStdout,
          propagateStderr: !propagateStderr,
          uuids: uuids,
        },
      });
      return !propagateStderr;
    });
  };

  const isFunctionMissing =
    functionIdentifier && !functionSignatures?.filter((signature) => signature.name === functionIdentifier).length;

  return editable ? (
    <div className="flex flex-col gap-2 border-b-2 border-zinc-800 px-3 pb-4 font-mono">
      <div className="flex items-center gap-2">
        <label className="text-nowrap font-mono text-sm text-zinc-400">Function Identifier:</label>
        <Select
          value={functionIdentifier ?? "-"}
          onValueChange={(newFunctionIdentifier) => {
            if (newFunctionIdentifier === "-") {
              setFunctionIdentifier(null);
              onChange(null);
            } else {
              setFunctionIdentifier(newFunctionIdentifier);
              onChange(newFunctionIdentifier);
            }
          }}
        >
          <SelectTrigger className="h-8 min-w-[120px] text-xs">
            <SelectValue placeholder="Select a function" className="p-2" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-">No function (Just run file)</SelectItem>
            {functionSignatures?.map((signature) => (
              <SelectItem key={signature.name} value={signature.name}>
                {signature.name}
              </SelectItem>
            ))}
            {isFunctionMissing && functionIdentifier && (
              <SelectItem value={functionIdentifier}>{functionIdentifier}</SelectItem>
            )}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          {isFunctionMissing && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TriangleAlert className="h-4 w-4 text-yellow-500" />
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                  <TriangleAlert className="h-4 w-4 text-yellow-600" /> Function not found. Please check the file.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button
            size="icon"
            variant="ghost"
            type="button"
            onClick={() => {
              onChange(functionIdentifier);
            }}
          >
            <RefreshCcw />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="font-mono text-sm text-zinc-400">Capture Error:</label>
        <Checkbox
          className="inline h-5 w-5 border-zinc-400 bg-transparent text-xs"
          checked={allowError}
          onCheckedChange={onAllowErrorChange}
        />
        <InfoTooltip content="When enabled, errors from the function do not terminate the program and can be piped to other nodes (via the output labeled 'Error')." />
      </div>
      <div className="flex items-center gap-4">
        <label className="font-mono text-sm text-zinc-400">Capture Stdout:</label>
        <Checkbox
          className="inline h-5 w-5 border-zinc-400 bg-transparent text-xs"
          checked={propagateStdout}
          onCheckedChange={onPropagateStdoutChange}
        />
        <InfoTooltip content="When enabled, stdout (e.g. from using `print`) can be piped to other nodes." />
      </div>
      <div className="flex items-center gap-4">
        <label className="font-mono text-sm text-zinc-400">Capture Stderr:</label>
        <Checkbox
          className="inline h-5 w-5 border-zinc-400 bg-transparent text-xs"
          checked={propagateStderr}
          onCheckedChange={onPropagateStderrChange}
        />
        <InfoTooltip content="When enabled, stderr (e.g. from using `print(..., file=sys.stderr)`) can be piped to other nodes." />
      </div>
    </div>
  ) : (
    <div className="min-w-[280px] px-2">
      <div className="flex items-center gap-3">
        <ParenthesesIcon size={20} className="text-zinc-400" />
        <div className="flex flex-col">
          <span className="text-xs text-zinc-400">Function Identifier</span>
          <span className="font-mono font-medium text-white">
            {(step as PyRunFunctionStep).function_identifier ?? "- (Run file)"}
          </span>
        </div>
      </div>
      <div className="my-4 flex flex-col items-start gap-2">
        <Badge className="flex overflow-hidden bg-transparent p-0 text-xs" variant="outline">
          <div className="flex h-full items-center gap-1 bg-pyrun px-2 py-1 text-slate-800">
            <CircleXIcon className="h-4 w-4" />
            <span className="font-medium">On error</span>
          </div>
          <div className="flex h-full items-center gap-2 break-all px-2 py-1 font-mono font-medium">
            {(step as PyRunFunctionStep).allow_error ? "Captured" : "Terminate program"}
          </div>
        </Badge>
        <Badge className="flex overflow-hidden bg-transparent p-0 text-xs" variant="outline">
          <div className="flex h-full items-center gap-1 bg-pyrun px-2 py-1 text-slate-800">
            <MessageCircleMoreIcon className="h-4 w-4" />
            <span className="font-medium">Stdout</span>
          </div>
          <div className="flex h-full items-center gap-2 break-all px-2 py-1 font-mono font-medium">
            {(step as PyRunFunctionStep).propagate_stdout ? "Captured" : "Ignored"}
          </div>
        </Badge>
        <Badge className="flex overflow-hidden bg-transparent p-0 text-xs" variant="outline">
          <div className="flex h-full items-center gap-1 bg-pyrun px-2 py-1 text-slate-800">
            <MessageCircleXIcon className="h-4 w-4" />
            <span className="font-medium">Stderr</span>
          </div>
          <div className="flex h-full items-center gap-2 break-all px-2 py-1 font-mono font-medium">
            {(step as PyRunFunctionStep).propagate_stderr ? "Captured" : "Ignored"}
          </div>
        </Badge>
      </div>
    </div>
  );
};

export default PyRunMetadata;
