import { useFormContext } from "react-hook-form";

import { NumberField } from "@/components/form/fields";
import FormSection from "@/components/form/form-section";
import { Switch } from "@/components/ui/switch";

export const AttemptLimitSection = () => {
  const form = useFormContext();
  const hasLimit = ["number", "string"].includes(typeof form.watch("max_attempts"));
  return (
    <FormSection title="Attempt limit">
      <div className="flex items-center gap-2">
        <Switch
          checked={!hasLimit}
          onCheckedChange={() => {
            form.setValue("max_attempts", hasLimit ? null : 20);
          }}
        />
        Unlimited attempts
      </div>
      {hasLimit && <NumberField name="max_attempts" />}
    </FormSection>
  );
};
