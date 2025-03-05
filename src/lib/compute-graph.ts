import {
  File as UniconFile,
  IfElseStep,
  InputStep,
  LoopStep,
  ObjectAccessStep,
  OutputStep,
  PyRunFunctionSocket,
  PyRunFunctionStep,
  SocketType,
  StepSocket,
  StepType,
  StringMatchStep,
  UniconType,
} from "@/api";
import { Step } from "@/features/problems/components/tasks/types";
import { isUniconFile, uuid } from "@/lib/utils";

export const parseSocketDataString = (data: string): string | number | boolean | null => {
  let parsed: string | boolean | number | null = data;

  // Empty string = no data = null
  if (data === "") parsed = null;
  // Surrounded by quotes = string
  else if (data.startsWith('"') && data.endsWith('"')) parsed = data.slice(1, -1);
  // Lowercase true/false = boolean
  else if (data.toLowerCase() === "true") parsed = true;
  else if (data.toLowerCase() === "false") parsed = false;
  // Number = number
  else if (!isNaN(Number(data))) parsed = Number(data);

  return parsed;
};

export const getDataType = (data: string | number | boolean | null | unknown): UniconType => {
  if (data === null) return "null";
  else if (isUniconFile(data)) return "UniconFile";
  else if (typeof data === "string") return "text";
  else if (typeof data === "number") return "number";
  else if (typeof data === "boolean") return "boolean";
  return "unknown";
};

export const isRequiredInputStep = (step: Step): boolean => {
  return step.type === "INPUT_STEP" && ((step as InputStep).is_user ?? false);
};

export const createSocket = (
  type: SocketType,
  label?: string,
  data: string | number | boolean | UniconFile | null = null,
  dataType?: UniconType | null,
  dataTypeMetadata?: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
) => {
  if (dataType === undefined && type === "DATA") {
    // We make a guess for the type.
    if (dataTypeMetadata !== undefined) dataType = "PythonObject";
    else if (typeof data === "string") dataType = "text";
    else if (typeof data === "number") dataType = "number";
    else if (typeof data === "boolean") dataType = "boolean";
    else if (data === null) dataType = "null";
    else if (isUniconFile(data)) dataType = "UniconFile";
    else dataType = "unknown";
  }
  return { id: uuid(), type, label, data, data_type: dataType, data_type_metadata: dataTypeMetadata };
};

const createBaseStep = (type: StepType, inputs: StepSocket[], outputs: StepSocket[]) => ({
  id: uuid(),
  type,
  inputs: [createSocket("CONTROL"), ...inputs],
  outputs: [createSocket("CONTROL"), ...outputs],
});

export const createDefaultStep = (type: StepType) => {
  switch (type) {
    case "INPUT_STEP":
      return {
        ...createBaseStep(type, [], [createSocket("DATA")]),
        is_user: false,
      } as InputStep;
    case "OUTPUT_STEP":
      // TODO: Change type when expected changes
      return createBaseStep(type, [createSocket("DATA")], []) as OutputStep;
    case "PY_RUN_FUNCTION_STEP":
      return {
        ...createBaseStep(
          type,
          [{ ...createSocket("DATA", "Module", null, "UniconFile"), import_as_module: true }] as PyRunFunctionSocket[],
          [],
        ),
        function_identifier: "",
        allow_error: false,
      } as PyRunFunctionStep;
    case "OBJECT_ACCESS_STEP":
      return {
        ...createBaseStep(
          type,
          [createSocket("DATA", "Object", null, "PythonObject", { name: "dict" })],
          [createSocket("DATA", "Value", null, "unknown")],
        ),
        key: "",
      } as ObjectAccessStep;
    case "STRING_MATCH_STEP":
      return createBaseStep(
        type,
        [createSocket("DATA", "Operand 1", null, "unknown"), createSocket("DATA", "Operand 2", null, "unknown")],
        [createSocket("DATA", "Match?", null, "boolean")],
      ) as StringMatchStep;
    case "LOOP_STEP":
      return createBaseStep(
        type,
        [createSocket("CONTROL", "Predicate")],
        [createSocket("CONTROL", "Body")],
      ) as LoopStep;
    case "IF_ELSE_STEP":
      return createBaseStep(
        type,
        [createSocket("CONTROL", "Predicate")],
        [createSocket("CONTROL", "If"), createSocket("CONTROL", "Else")],
      ) as IfElseStep;
  }
};

export const isResultSocket = (socket: PyRunFunctionSocket) =>
  socket.type === "DATA" && !socket.handles_error && !socket.handles_stderr && !socket.handles_stdout;
