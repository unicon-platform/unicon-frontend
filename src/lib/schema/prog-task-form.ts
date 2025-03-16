import { z } from "zod";

import { ProgrammingTask, PythonVersion, Testcase } from "@/api/types.gen";
import { TaskFormZ } from "@/lib/schema/task-form";
import { isUniconFile } from "@/lib/utils";

export const DEFAULT_PY_VERSION: PythonVersion = "3.11.9";

const positiveLimitZ = (label: string) => z.coerce.number().positive(`${label} must be greater than 0!`);

const FileZ = z.object({
  id: z.string(),
  path: z.string().nonempty("File name cannot be empty!"),
  content: z.string(),
  trusted: z.boolean().optional(),
  key: z.string().optional().nullable(),
  on_minio: z.boolean().optional(),
  size_limit: z.number(),
});

export type FileT = z.infer<typeof FileZ>;

const RequiredInputZ = z.object({
  id: z.string().nonempty("Input ID cannot be empty!"),
  label: z.string().nonempty("Input Label cannot be empty!"),
  data: z.union([z.string(), z.number(), z.boolean(), FileZ]),
});

export type RequiredInputT = z.infer<typeof RequiredInputZ>;

const SlurmOptionZ = z
  .string()
  .nonempty("Slurm option cannot be empty!")
  .refine((value) => !value.includes(" "), {
    message: "Slurm option cannot contain spaces!",
  });

export const ProgTaskFormZ = TaskFormZ.extend({
  environment: z.object({
    language: z.literal("Python"),
    extra_options: z.object({
      version: z.custom<PythonVersion>(() => true),
      requirements: z.array(z.string().nonempty("Package name cannot be empty!")).default([]),
    }),
    time_limit_secs: positiveLimitZ("Time limit"),
    memory_limit_mb: positiveLimitZ("Memory limit"),
    slurm: z.boolean().default(true),
    slurm_options: z.array(SlurmOptionZ),
    slurm_use_system_py: z.boolean().optional().default(false),
  }),
  required_user_inputs: z.array(RequiredInputZ),
  testcases: z.array(z.custom<Testcase>(() => true)),
  files: z.array(FileZ),
}).superRefine((values, context) => {
  // If `slurm` is not enabled, `slurm_options` should be empty
  if (!values.environment.slurm && values.environment.slurm_options.length) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "There should no be Slurm options when Slurm is disabled!",
      path: ["slurm_options"],
    });
  }
});

export type ProgTaskFormT = z.infer<typeof ProgTaskFormZ>;

export const toProgrammingTask = (form: ProgTaskFormT): Omit<ProgrammingTask, "order_index"> => ({
  id: -1,
  type: "PROGRAMMING_TASK",
  title: form.title,
  description: form.description,
  autograde: form.autograde,
  max_attempts: form.max_attempts ?? null,
  environment: {
    ...form.environment,
    language: "PYTHON",
    extra_options: {
      version: form.environment.extra_options.version,
      requirements: form.environment.extra_options.requirements,
    },
  },
  required_inputs: form.required_user_inputs,
  testcases: form.testcases,
  files: form.files,
});

export const fromProgrammingTask = (progTask: ProgrammingTask): ProgTaskFormT => ({
  title: progTask.title,
  description: progTask.description ?? "",
  max_attempts: progTask.max_attempts,
  environment: {
    ...progTask.environment,
    language: "Python",
    extra_options: {
      version: progTask.environment.extra_options?.version ?? DEFAULT_PY_VERSION,
      requirements: progTask.environment.extra_options?.requirements ?? [],
    },
    slurm: progTask.environment.slurm ?? false,
    slurm_options: progTask.environment.slurm_options ?? [],
    slurm_use_system_py: progTask.environment.slurm_use_system_py ?? false,
  },
  required_user_inputs: progTask.required_inputs.map((input) => ({
    id: input.id,
    label: input.label ?? "",
    data: isUniconFile(input.data) ? { ...input.data, size_limit: input.data.size_limit ?? 0 } : input.data,
  })),
  testcases: progTask.testcases,
  files: progTask.files.map((file) => ({ ...file, size_limit: file.size_limit ?? 0 })),
});
