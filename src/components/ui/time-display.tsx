import { format } from "date-fns/format";
import { DynamicIcon, IconName } from "lucide-react/dynamic";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { relativeTimeDetailed } from "@/utils/date";

export const TimeDisplay = ({ label, datetime, iconName }: { label: string; datetime: Date; iconName: IconName }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-default">
        <div className="flex items-center gap-3 rounded-md bg-zinc-900 p-4">
          <DynamicIcon name={iconName} className="h-5 w-5" />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400">{label}</span>
            <span className={`text-sm font-medium`}>{format(datetime, "MMM d yyyy, hh:mm a")}</span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{relativeTimeDetailed(datetime)}</TooltipContent>
    </Tooltip>
  );
};
