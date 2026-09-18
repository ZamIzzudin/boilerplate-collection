import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-xl overflow-hidden shadow", {
  variants: {
    variant: {
      default: "bg-card",
      primary: "bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const cardHeaderVariants = cva("flex items-center gap-2 px-4 py-3", {
  variants: {
    variant: {
      default: "border-b border-outline",
      primary: "border-b border-outline bg-on-primary",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props} />
  );
}

function CardHeader({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof cardHeaderVariants> & { icon?: React.ReactNode }) {
  return (
    <div className={cn(cardHeaderVariants({ variant }), className)} {...props}>
      {icon && <span className="text-gray-600 [&_svg]:size-5">{icon}</span>}
      <h3 className="text-base text-gray-900 w-full">{children}</h3>
    </div>
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-4", className)} {...props} />;
}

function CardRow({
  className,
  label,
  value,
  ...props
}: React.ComponentProps<"div"> & { label: string; value: React.ReactNode }) {
  return (
    <div
      className={cn("grid grid-cols-[180px_1fr] gap-4 py-2", className)}
      {...props}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-base font-medium text-gray-900", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-gray-400", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("ml-auto", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center border-t bg-muted/50 p-4", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardRow,
  cardVariants,
  cardHeaderVariants,
};
