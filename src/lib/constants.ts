import { IconName } from "lucide-react/dynamic";

import { TaskEvalStatus } from "@/api";

type ReadOnlyMap<K extends string | number | symbol, V> = { readonly [key in K]: V };

export type StepType =
  | "INPUT_STEP"
  | "OUTPUT_STEP"
  | "PY_RUN_FUNCTION_STEP"
  | "OBJECT_ACCESS_STEP"
  | "STRING_MATCH_STEP"
  | "LOOP_STEP"
  | "IF_ELSE_STEP";

export const StepNodeColorMap: ReadOnlyMap<StepType, string> = {
  INPUT_STEP: "#F5A623", // Golden Yellow
  OUTPUT_STEP: "#9013FE", // Vibrant Purple
  PY_RUN_FUNCTION_STEP: "#4A90E2", // Bright Blue
  OBJECT_ACCESS_STEP: "#50E3C2", // Turquoise
  STRING_MATCH_STEP: "#FF4081", // Pink
  LOOP_STEP: "#FF6B6B", // Coral Red
  IF_ELSE_STEP: "#4CAF50", // Emerald Green
};

export const StepTypeAliasMap: ReadOnlyMap<StepType, string> = {
  INPUT_STEP: "Input",
  OUTPUT_STEP: "Output",
  PY_RUN_FUNCTION_STEP: "Run Python Code",
  OBJECT_ACCESS_STEP: "Access Object",
  STRING_MATCH_STEP: "String Match",
  LOOP_STEP: "Loop",
  IF_ELSE_STEP: "If Else",
};

export const StepTypeIconMap: Record<StepType, IconName> = {
  INPUT_STEP: "text-cursor-input",
  OUTPUT_STEP: "eye",
  PY_RUN_FUNCTION_STEP: "play",
  OBJECT_ACCESS_STEP: "circle-dot",
  STRING_MATCH_STEP: "equal",
  LOOP_STEP: "infinity",
  IF_ELSE_STEP: "split",
};

export const TaskEvalStatusColorMap: ReadOnlyMap<TaskEvalStatus, string> = {
  SUCCESS: "bg-green-400",
  PENDING: "bg-yellow-400",
  PENDING_PUSH: "bg-orange-400",
  FAILED: "bg-red-400",
  SKIPPED: "bg-gray-400",
};
