import { ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { cn } from "@/lib/utils";

type SocketLabelInputProps = {
  className?: ClassValue[];
  value: string;
  onChange: (newValue: string) => void;
};

const SocketLabelInput: React.FC<SocketLabelInputProps> = ({ className = [], value: externalValue, onChange }) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  useEffect(() => setLocalValue(externalValue), [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return (
    <input
      type="text"
      className={cn(
        "nodrag inline max-w-fit rounded-sm border border-gray-500/50 bg-transparent p-1 text-xs",
        ...className,
      )}
      value={localValue}
      onChange={handleChange}
      size={localValue.length}
      aria-label="Node Label Input"
      placeholder="Enter label..."
    />
  );
};

export default SocketLabelInput;
