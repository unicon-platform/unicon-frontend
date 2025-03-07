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

// Compute graph type checks

export const getDataType = (data: string | number | boolean | null | unknown): UniconType => {
  if (data === null) return "null";
  else if (isUniconFile(data)) return "UniconFile";
  else if (typeof data === "string") return "text";
  else if (typeof data === "number") return "number";
  else if (typeof data === "boolean") return "boolean";
  return "unknown";
};

type SocketDataType = Pick<StepSocket, "data_type" | "data_type_metadata">;

const convertPythonDataTypeToUniconType = (pythonType: string): UniconType => {
  switch (pythonType) {
    case "str":
      return "text";
    case "int":
    case "float":
      return "number";
    case "bool":
      return "boolean";
    case "NoneType":
      return "null";
    default:
      return "unknown";
  }
};

export const isTypeCompatible = (inputType: SocketDataType, outputType: SocketDataType): boolean => {
  // If either type is unknown, we suspect an error in the graph.
  // We warn the user, but allow the connection.
  if (!inputType.data_type || !outputType.data_type) {
    console.warn({
      inputType: inputType,
      outputType: outputType,
      message: "A type passed into isTypeCompatible is undefined.",
    });
    return true;
  }

  // If both types are PythonTypes, we can compare them directly.
  if (inputType.data_type === "PythonObject" && outputType.data_type === "PythonObject") {
    // If the types are Any on either side, allow the connection.
    const inputDataType = inputType.data_type_metadata?.name as string;
    const outputDataType = outputType.data_type_metadata?.name as string;
    if (inputDataType === "Any" || outputDataType === "Any") {
      return true;
    }

    // If the types are something we support, a direct comparison can be made.
    const supportedTypes = ["str", "int", "float", "bool", "NoneType"];
    if (!supportedTypes.includes(inputDataType) || !supportedTypes.includes(outputDataType)) {
      return inputDataType === outputDataType;
    }

    // Otherwise, at least one of the types are not yet comparable. Just allow the connection.
    return true;
  }

  const processedInputType =
    inputType.data_type === "PythonObject"
      ? convertPythonDataTypeToUniconType((inputType.data_type_metadata?.name as string) ?? "")
      : inputType.data_type;

  // Caveat: Since unicon only has a number type, if the PythonType actually takes in int/float,
  // we allow the connection for number.
  const processedOutputType =
    outputType.data_type === "PythonObject"
      ? convertPythonDataTypeToUniconType((outputType.data_type_metadata?.name as string) ?? "")
      : outputType.data_type;

  if (processedInputType === "unknown" || processedOutputType === "unknown") {
    return true;
  }

  // File type can be connected to text type (filepath)
  if (processedInputType === "UniconFile" && processedOutputType === "text") {
    return true;
  }

  return processedInputType === processedOutputType;
};
