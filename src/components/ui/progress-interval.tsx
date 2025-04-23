import { differenceInMilliseconds } from "date-fns";
import { useEffect, useState } from "react";

import { Progress } from "@/components/ui/progress";

/**
 * Props for the ProgressInterval component
 */
interface ProgressIntervalProps {
  start: Date;
  end: Date;
  className?: string;
  onComplete?: () => void;
}

/**
 * A progress bar that animates based on a time interval
 */
const ProgressInterval: React.FC<ProgressIntervalProps> = ({ start, end, className, onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

  return <Progress value={progress} className={className} />;
};

export { ProgressInterval };
