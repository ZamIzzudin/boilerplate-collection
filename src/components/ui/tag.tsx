import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold leading-none uppercase",
  {
    variants: {
      variant: {
        success: "bg-success-container text-on-success-container",
        warning: "bg-warning-container text-on-warning-container",
        failed: "bg-error-container text-on-error-container",
        info: "bg-blue-200 text-blue-900",
        disabled: "bg-outline text-brand-muted",
      },
      size: {
        sm: "min-w-18 px-3 py-1 text-xs",
        default: "min-w-24 px-6 py-1.5 text-sm",
        lg: "min-w-24 px-6 py-1.5 text-lg",
      },
    },
    defaultVariants: {
      variant: "success",
      size: "default",
    },
  },
);

type TagProps = React.ComponentProps<"span"> & VariantProps<typeof tagVariants>;

function Tag({ className, variant, size, ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ variant, className, size }))}
      {...props}
    />
  );
}

export { Tag, tagVariants };
