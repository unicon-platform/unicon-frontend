import React from "react";

import { cn } from "@/lib/utils";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { hideOverflow?: boolean }
>(({ className, hideOverflow, ...props }, ref) => (
  <div
    className={cn("relative w-full rounded-md border", {
      "overflow-x-auto": !hideOverflow,
    })}
  >
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));

export { TableCell } from "@/components/ui/table";
export { TableHead } from "@/components/ui/table";
export { TableBody } from "@/components/ui/table";
export { TableHeader } from "@/components/ui/table";
export { TableRow } from "@/components/ui/table";
