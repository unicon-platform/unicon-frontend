import { InfoIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type OwnProps = {
  content: string;
};

const InfoTooltip: React.FC<OwnProps> = ({ content }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default InfoTooltip;
