import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FunnelSimpleIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string; // Used for button display (e.g. "2026" or "Semua")
  dropdownLabel?: string; // Optional label for dropdown menu item (e.g. "Tahun 2026")
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface DownloadOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TableToolbarProps {
  readonly filters?: FilterConfig[];
  readonly activeFilters: Record<string, string>;
  readonly onFiltersChange: (filters: Record<string, string>) => void;
  readonly downloadOptions?: DownloadOption[];
  readonly onDownload?: (key: string) => void;
  readonly extraActions?: React.ReactNode;
}

export function TableToolbar({
  filters = [],
  activeFilters,
  onFiltersChange,
  downloadOptions = [],
  onDownload,
  extraActions,
}: TableToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      {extraActions}

      {/* Dynamic Filters */}
      {filters.map((filter) => {
        const currentValue = activeFilters[filter.key] ?? "";
        const currentOption = filter.options.find((opt) => opt.value === currentValue);
        const displayLabel = currentOption ? currentOption.label : "Semua";

        return (
          <DropdownMenu key={filter.key}>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 h-9"
                >
                  <FunnelSimpleIcon className="size-4 text-gray-500" />
                  {filter.label}: {displayLabel}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-44">
              {filter.options.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className={cn(
                    "p-2 cursor-pointer focus:text-primary focus:bg-primary/10",
                    currentValue === opt.value && "bg-muted font-medium"
                  )}
                  onClick={() =>
                    onFiltersChange({
                      ...activeFilters,
                      [filter.key]: opt.value,
                    })
                  }
                >
                  {opt.dropdownLabel ?? opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {/* Dynamic Download Button */}
      {downloadOptions.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 h-9"
              >
                <DownloadSimpleIcon className="size-4 text-gray-500" />
                Download
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            {downloadOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.key}
                className="p-2 cursor-pointer flex items-center gap-2 text-sm text-gray-700 hover:text-primary focus:text-primary focus:bg-primary/10"
                onClick={() => onDownload?.(opt.key)}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
