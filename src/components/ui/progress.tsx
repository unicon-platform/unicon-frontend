import * as ProgressPrimitive from "@radix-ui/react-progress";
import { differenceInMilliseconds } from "date-fns";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Props for the base Progress component
 */
interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  duration?: number;
  indicatorClassName?: string;
}

/**
 * A customizable progress bar component built on Radix UI
 */
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value = 0, duration = 0.2, indicatorClassName, ...props }, ref) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.min(Math.max(value || 0, 0), 100);

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
        value={clampedValue}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1 bg-primary transition-all", indicatorClassName)}
          style={{
            transform: `translateX(-${100 - clampedValue}%)`,
            transition: `transform ${duration}s linear`,
          }}
        />
      </ProgressPrimitive.Root>
    );
  },
);

Progress.displayName = ProgressPrimitive.Root.displayName;

/**
 * Props for the ProgressInterval component
 */
interface ProgressIntervalProps {
  start: Date;
  end: Date;
  className?: string;
  indicatorClassName?: string;
  onComplete?: () => void;
}

/**
 * A progress bar that animates based on a time interval
 */
const ProgressInterval: React.FC<ProgressIntervalProps> = ({
  start,
  end,
  className,
  indicatorClassName,
  onComplete,
}) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (start >= end) {
      console.error("Start date must be before end date");
      return;
    }

    const totalMs = differenceInMilliseconds(end, start);

    const animate = () => {
      const elapsedMs = differenceInMilliseconds(Date.now(), start);
      const newProgress = Math.min((elapsedMs / totalMs) * 100, 100);

      setProgress(newProgress);

      if (newProgress < 100) {
        requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [start, end, onComplete]);

  return <Progress value={progress} className={className} indicatorClassName={indicatorClassName} />;
};

export { Progress, ProgressInterval };
export type { ProgressIntervalProps };
