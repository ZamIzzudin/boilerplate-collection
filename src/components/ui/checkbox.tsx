import * as React from "react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="checkbox"
      type="checkbox"
      className={cn(
        "mt-0.5 size-4 rounded border border-input accent-primary disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Checkbox };
