import { InfoIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Option = {
  label: string;
  value: string;
};

interface SelectFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  options: Option[];
  disabled?: boolean;
}

function SelectField({ name, label, placeholder, description, options, disabled = false }: SelectFieldProps) {
  const { control } = useFormContext();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel className="!text-current">
              <div className="inline-flex items-center gap-2">
                {label}
                {description && (
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>{description}</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </FormLabel>
          )}
          <FormControl>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={`option-${option.value}-${option.label}`} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default SelectField;
