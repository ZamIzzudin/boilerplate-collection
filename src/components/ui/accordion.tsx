import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { CaretDownIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

function Accordion({
  className,
  ...props
}: Readonly<AccordionPrimitive.Root.Props>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: Readonly<AccordionPrimitive.Item.Props>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: Readonly<AccordionPrimitive.Trigger.Props>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-foreground",
          "cursor-pointer outline-none transition-colors hover:bg-muted/40",
          "focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        {...props}
      >
        {children}
        <CaretDownIcon className="size-4 shrink-0 text-gray-400 transition-transform duration-200 [[data-panel-open]_&]:rotate-180" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: Readonly<AccordionPrimitive.Panel.Props>) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "border-t border-border px-4 py-4 text-sm text-gray-400",
        className,
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
