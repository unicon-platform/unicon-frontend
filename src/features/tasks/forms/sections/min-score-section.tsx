import { useFormContext } from "react-hook-form";

import { NumberField } from "@/components/form/fields";
import FormSection from "@/components/form/form-section";
import { Switch } from "@/components/ui/switch";
import { ProgTaskFormT } from "@/lib/schema/prog-task-form";

export const MinScoreSection = () => {
  const form = useFormContext<ProgTaskFormT>();
  const hasMinScore = ["number", "string"].includes(typeof form.watch("min_score_to_pass"));

  const testcases = form.watch("testcases");
  const totalScore = testcases.reduce((acc, testcase) => acc + (testcase.score ?? 1), 0);
  return (
    <FormSection title="Passing Score" description="How many points from testcases are needed to pass?">
      <div className="flex items-center gap-2">
        <Switch
          checked={!hasMinScore}
          onCheckedChange={() => {
            form.setValue("min_score_to_pass", hasMinScore ? null : totalScore);
          }}
        />
        No passing score
      </div>
      {hasMinScore && (
        <div className="flex items-center gap-2">
          <NumberField name="min_score_to_pass" min={0} max={totalScore} className="w-fit" /> out of {totalScore}
        </div>
      )}
    </FormSection>
  );
};
