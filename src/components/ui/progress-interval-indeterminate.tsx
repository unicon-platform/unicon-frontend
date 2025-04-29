import { constructNow } from "date-fns";
import { useEffect, useState } from "react";

import { ProgressInterval, ProgressIntervalProps } from "@/components/ui/progress";
import { ProgressIndeterminate } from "@/components/ui/progress-indeterminate";

export const ProgressIntervalIndeterminate: React.FC<ProgressIntervalProps> = ({ start, end, className }) => {
  const [current, setCurrent] = useState(constructNow(Date.now()));
  const passedDeadline = current > end;

  useEffect(() => {
    const animate = () => {
      setCurrent(constructNow(Date.now()));
      if (!passedDeadline) {
        requestAnimationFrame(animate);
      }
    };
    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [passedDeadline]);

  return passedDeadline ? (
    <ProgressIndeterminate className={className} />
  ) : (
    <ProgressInterval start={start} end={end} className={className} />
  );
};
