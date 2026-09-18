import * as React from "react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
};

export function Breadcrumb({
  items,
  separator = "/",
  className,
}: Readonly<BreadcrumbProps>) {
  return (
    <nav className={cn("flex", className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <span className="text-gray-400">{separator}</span>}
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-foreground",
                  item.isActive
                    ? "text-gray-400 cursor-default"
                    : "text-gray-400 hover:text-foreground",
                  item.className,
                )}
              >
                {item.label}
              </button>
            ) : (
              <span
                className={cn(
                  "text-sm font-medium",
                  item.isActive ? "text-foreground" : "text-gray-400",
                  item.className,
                )}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function createBreadcrumbItems(
  baseLabel: string,
  activeLabel?: string,
  onBack?: () => void,
): BreadcrumbItem[] {
  if (!activeLabel) {
    return [{ label: baseLabel, isActive: true }];
  }

  const items: BreadcrumbItem[] = [];

  if (onBack) {
    items.push({
      label: baseLabel,
      onClick: onBack,
      className: "cursor-pointer",
    });
  } else {
    items.push({ label: baseLabel });
  }

  items.push({ label: activeLabel, isActive: true });

  return items;
}
