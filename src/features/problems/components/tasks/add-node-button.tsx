import { PlusIcon } from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import React, { useContext, useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { GraphActionType, GraphDispatchContext } from "@/features/problems/components/tasks/graph-context";
import { createDefaultStep } from "@/lib/compute-graph";
import { StepType, StepTypeAliasMap, StepTypeIconMap } from "@/lib/constants";

const AddNodeButton: React.FC = () => {
  const dispatch = useContext(GraphDispatchContext)!;
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" type="button" onClick={() => setOpen(true)}>
          <PlusIcon />
          Add node
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {Object.entries(StepTypeAliasMap).map(([stepType, alias], index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start p-2"
            onClick={() => {
              dispatch({ type: GraphActionType.AddStep, payload: { step: createDefaultStep(stepType as StepType) } });
              setOpen(false);
            }}
          >
            <DynamicIcon size={20} name={StepTypeIconMap[stepType as StepType]} />
            {alias}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
};

export default AddNodeButton;
