import * as ProgressPrimitive from "@radix-ui/react-progress";
import { DateArg, intervalToDuration } from "date-fns";
import * as React from "react";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  duration?: number;
}

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, duration, ...props }, ref) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          transition: `all ${duration || 0.2}s linear`,
        }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

type ProgressIntervalProps = {
  start: DateArg<Date>;
  end: DateArg<Date>;
  className: string;
};

const ProgressInterval: React.FC<ProgressIntervalProps> = ({ start, end, className }) => {
  const [progress, setProgress] = React.useState(0);

  const duration = intervalToDuration({ start, end });

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 100);
    return () => clearTimeout(timer);
  }, []);

  return <Progress value={progress} duration={duration.seconds} className={className} />;
};

export { Progress, ProgressInterval };
