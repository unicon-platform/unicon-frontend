import { ClassValue } from "clsx";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { parseSocketDataString } from "@/lib/compute-graph";
import { cn } from "@/lib/utils";

type SocketLabelInputProps = {
  className?: ClassValue[];
  value: string | undefined;
  canEdit: boolean;
  onChange: (newValue: string) => void;
};

export const SocketLabelInput: React.FC<SocketLabelInputProps> = ({
  className = [],
  value: externalValue,
  canEdit,
  onChange,
}) => {
  const [localValue, setLocalValue] = useState(externalValue ?? "");
  const debouncedOnChange = useDebouncedCallback(onChange, 300);

  useEffect(() => setLocalValue(externalValue ?? ""), [externalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  return canEdit ? (
    <input
      type="text"
      className={cn(
        "nodrag inline max-w-fit rounded-sm border border-gray-500/50 bg-transparent px-2 py-1 text-xs",
        ...className,
      )}
      value={localValue}
      onChange={handleChange}
      size={localValue.length}
      aria-label="Node Label Input"
      placeholder="Enter label..."
    />
  ) : (
    <span className={cn([...className])}>{localValue}</span>
  );
};

type SocketDataInputProps = {
  className?: ClassValue[];
  value: string | boolean | number | null | undefined;
  canEdit: boolean;
  onChange: (newValue: string | boolean | number | null) => void;
};

export const SocketDataInput: React.FC<SocketDataInputProps> = ({
  className = [],
  value: externalValue,
  canEdit,
  onChange,
}) => {
  const [inputString, setInputString] = useState(() =>
    externalValue !== null && externalValue !== undefined ? JSON.stringify(externalValue) : "",
  );

  // Reference to track blur and focus state
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when external value changes
  useEffect(() => {
    setInputString(externalValue !== null && externalValue !== undefined ? JSON.stringify(externalValue) : "");
  }, [externalValue]);

  const parseAndUpdate = (inputStr: string) => {
    const parsed = parseSocketDataString(inputStr);
    onChange(parsed);
    // Update the input display with the stringified parsed value
    setInputString(parsed !== null ? JSON.stringify(parsed) : "");
  };

  // Just update the raw input string while typing, don't parse yet
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInputString(e.target.value);
  // Only parse when the input loses focus
  const handleBlur = () => parseAndUpdate(inputString);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      parseAndUpdate(inputString);
      inputRef.current?.blur();
    }
  };

  return canEdit ? (
    <input
      ref={inputRef}
      type="text"
      className={cn(
        "nodrag inline max-w-fit rounded-sm border border-gray-500/50 bg-transparent px-2 py-1 font-mono text-xs",
        ...className,
      )}
      value={inputString}
      onChange={handleChange}
      onBlur={handleBlur}
      size={inputString.length}
      onKeyDown={handleKeyDown}
      placeholder="Enter value..."
    />
  ) : (
    <span className={cn([...className])}>{JSON.stringify(externalValue)}</span>
  );
};
