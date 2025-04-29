"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import styles from "@/components/ui/progress-indeterminate/progress-indeterminate.module.css";
import { cn } from "@/lib/utils";

const ProgressIndeterminate = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn("h-full w-full flex-1 origin-left bg-primary transition-all", styles["progress-indeterminate"])}
    />
  </ProgressPrimitive.Root>
));

export { ProgressIndeterminate };
