import {
  CaretDownIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  ArrowBendDownRightIcon,
} from "@phosphor-icons/react";
import { Fragment, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type AppDataTableFilterType = "text" | "number" | "date" | "select";

type AppDataTableFilterOption = {
  label: string;
  value: string | number | boolean;
};

type AppDataTableFilterConfig = {
  type: AppDataTableFilterType;
  label?: string;
  placeholder?: string;
  options?: AppDataTableFilterOption[];
  loading?: boolean;
  onScrollToBottom?: () => void;
  searchable?: boolean;
  onSearchChange?: (value: string) => void;
  /** Dipanggil saat user memilih opsi pada filter select (value + label). */
  onSelectOption?: (value: string, label: string) => void;
};

type AppDataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  maxWidth?: string;
  filter?: AppDataTableFilterConfig;
  hidden?: boolean;
  render: (row: T) => React.ReactNode;
};

type AppDataTablePagination = {
  totalItems: number;
  currentPage: number;
  perPage: number;
  perPageOptions: number[];
  onPerPageChange: (value: number) => void;
  onPageChange: (value: number) => void;
};

type AppDataTableQuery = {
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filters: Record<string, string>;
  onFiltersChange: (value: Record<string, string>) => void;
  draftFilters?: Record<string, string>;
  onDraftFiltersChange?: (value: Record<string, string>) => void;
  hideSearch?: boolean;
  filterpositionright?: boolean;
};

type AppDataTableProps<T> = {
  columns: AppDataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  emptyText?: string;
  isLoading?: boolean;
  footer?: React.ReactNode;
  pagination?: AppDataTablePagination;
  query?: AppDataTableQuery;
  className?: string;
  fixedHeader?: boolean;
  stickyFirstColumn?: boolean;
  expandable?: {
    renderExpandedContent: (row: T) => React.ReactNode;
    isRowExpandable?: (row: T) => boolean;
    defaultExpandedRowKeys?: string[];
  };
  actionButton?: React.ReactNode;
};

function computePageItems(
  pagination: AppDataTablePagination | undefined,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (!pagination) return [];
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, index) => index + 1);

  const current = pagination.currentPage;
  if (current <= 2) return [1, 2, "ellipsis", totalPages];
  if (current >= totalPages - 1)
    return [1, "ellipsis", totalPages - 1, totalPages];

  return [1, "ellipsis", current, "ellipsis", totalPages];
}

export function AppDataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyText = "Data tidak tersedia",
  isLoading = false,
  footer,
  pagination,
  query,
  className,
  fixedHeader = false,
  stickyFirstColumn = false,
  expandable,
  actionButton,
}: Readonly<AppDataTableProps<T>>) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localDraftFilters, setLocalDraftFilters] = useState<
    Record<string, string>
  >({});
  const expandOffset = expandable ? "2.5rem" : "0px";

  const draftFilters = query?.draftFilters ?? localDraftFilters;
  const setDraftFilters = (
    valueOrFn:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => {
    if (query?.onDraftFiltersChange) {
      const nextValue =
        typeof valueOrFn === "function" ? valueOrFn(draftFilters) : valueOrFn;
      query.onDraftFiltersChange(nextValue);
    } else {
      setLocalDraftFilters(valueOrFn);
    }
  };

  const [expandedRowKeys, setExpandedRowKeys] = useState<Set<string>>(
    () => new Set(expandable?.defaultExpandedRowKeys ?? []),
  );

  const filterableColumns = useMemo(
    () => columns.filter((column) => column.filter),
    [columns],
  );

  const totalPages = pagination
    ? Math.max(1, Math.ceil(pagination.totalItems / pagination.perPage))
    : 1;

  const visibleColumns = useMemo(
    () => columns.filter((column) => !column.hidden),
    [columns],
  );

  const columnSpan = visibleColumns.length + (expandable ? 1 : 0);

  const toggleExpand = (rowKey: string) => {
    setExpandedRowKeys((prev) => {
      const next = new Set(prev);
      if (next.has(rowKey)) {
        next.delete(rowKey);
      } else {
        next.add(rowKey);
      }
      return next;
    });
  };

  const pageItems: Array<number | "ellipsis"> = useMemo(
    () => computePageItems(pagination, totalPages),
    [pagination, totalPages],
  );

  return (
    <div
      className={cn(
        "relative overflow-visible rounded-md border-[#dde5ee] bg-white",
        className,
      )}
    >
      {query ? (
        <QueryToolbar
          query={query}
          filterableColumns={filterableColumns}
          isFilterOpen={isFilterOpen}
          setIsFilterOpen={setIsFilterOpen}
          draftFilters={draftFilters}
          setDraftFilters={setDraftFilters}
          actionButton={actionButton}
        />
      ) : (
        <div className="flex justify-end flex-1 w-full mb-3">
          {actionButton}
        </div>
      )}

      <div className={`overflow-auto ${fixedHeader ? "h-[60vh]" : ""}`}>
        <table className="min-w-full text-sm">
          <thead className="bg-on-primary sticky top-0 z-20">
            <tr>
              {expandable ? (
                <th
                  className={cn(
                    "w-10 px-2 py-3",
                    stickyFirstColumn && "sticky left-0 z-30 bg-on-primary",
                  )}
                />
              ) : null}
              {visibleColumns.map((column, colIndex) => (
                <th
                  key={column.key}
                  style={{
                    ...(column.maxWidth ? { maxWidth: column.maxWidth } : {}),
                    ...(stickyFirstColumn && colIndex === 0
                      ? { left: expandOffset }
                      : {}),
                  }}
                  className={cn(
                    "px-4 py-3 text-left text-[11px] font-semibold tracking-wide text-[#6f7f8f] uppercase",
                    stickyFirstColumn &&
                      colIndex === 0 &&
                      "sticky z-30 bg-on-primary shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <TableBody<T>
              isLoading={isLoading}
              rows={rows}
              getRowKey={getRowKey}
              emptyText={emptyText}
              columnSpan={columnSpan}
              visibleColumns={visibleColumns}
              expandable={expandable}
              expandedRowKeys={expandedRowKeys}
              toggleExpand={toggleExpand}
              stickyFirstColumn={stickyFirstColumn} // <-- baru
              expandOffset={expandOffset} // <-- baru
            />
          </tbody>
        </table>
      </div>

      {(() => {
        if (pagination) {
          return (
            <PaginationFooter
              pagination={pagination}
              totalPages={totalPages}
              pageItems={pageItems}
            />
          );
        }
        if (footer) {
          return (
            <div className="border-t border-[#e9eef4] px-4 py-3">{footer}</div>
          );
        }
        return null;
      })()}
    </div>
  );
}

function QueryToolbar<T>({
  query,
  filterableColumns,
  isFilterOpen,
  setIsFilterOpen,
  draftFilters,
  setDraftFilters,
  actionButton,
}: Readonly<{
  query: AppDataTableQuery;
  filterableColumns: AppDataTableColumn<T>[];
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  draftFilters: Record<string, string>;
  setDraftFilters: (
    valueOrFn:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  actionButton?: React.ReactNode;
}>) {
  const hasSingleSelectFilter =
    filterableColumns.length === 1 &&
    filterableColumns[0].filter?.type === "select";
  const isFilterRight = query.filterpositionright === true;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e9eef4] py-3 w-full">
      {/* Sisi Kiri: Search & Filter Kiri */}
      <div className="flex flex-wrap items-center gap-4 flex-1">
        {!query.hideSearch &&
          query.search !== undefined &&
          query.onSearchChange && (
            <div className="flex w-full max-w-xs items-center overflow-hidden rounded-md border border-[#dbe4ee] bg-white">
              <Input
                value={query.search}
                onChange={(event) => query.onSearchChange?.(event.target.value)}
                placeholder={query.searchPlaceholder ?? "Cari data"}
                className="h-8 border-0 rounded-none shadow-none focus-visible:ring-0"
              />
            </div>
          )}

        {!isFilterRight && filterableColumns.length > 0
          ? (() => {
              if (hasSingleSelectFilter) {
                return (
                  <SingleSelectFilter
                    query={query}
                    column={filterableColumns[0]}
                  />
                );
              }
              return (
                <FilterPanel
                  query={query}
                  filterableColumns={filterableColumns}
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                  draftFilters={draftFilters}
                  setDraftFilters={setDraftFilters}
                />
              );
            })()
          : null}
      </div>

      {/* Sisi Kanan: Filter Kanan & Tombol Action */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {isFilterRight && filterableColumns.length > 0
          ? (() => {
              if (hasSingleSelectFilter) {
                return (
                  <SingleSelectFilter
                    query={query}
                    column={filterableColumns[0]}
                  />
                );
              }
              return (
                <FilterPanel
                  query={query}
                  filterableColumns={filterableColumns}
                  isFilterOpen={isFilterOpen}
                  setIsFilterOpen={setIsFilterOpen}
                  draftFilters={draftFilters}
                  setDraftFilters={setDraftFilters}
                />
              );
            })()
          : null}

        {actionButton}
      </div>
    </div>
  );
}

function SingleSelectFilter<T>({
  query,
  column,
}: Readonly<{
  query: AppDataTableQuery;
  column: AppDataTableColumn<T>;
}>) {
  const filter = column.filter!;
  const activeValue = query.filters[column.key];
  const activeLabel = activeValue
    ? (filter.options?.find((opt) => String(opt.value) === activeValue)
        ?.label ?? filter.placeholder)
    : (filter.placeholder ?? `Semua ${column.header}`);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="lg" className="px-3">
            <FunnelSimpleIcon />
            {activeLabel}
          </Button>
        }
      />
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem
          className={cn("p-2 cursor-pointer", !activeValue && "bg-muted")}
          onClick={() => {
            query.onFiltersChange({ [column.key]: "" });
          }}
        >
          {filter.placeholder ?? "Semua"}
        </DropdownMenuItem>
        {filter.options?.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={cn(
              "p-2 cursor-pointer",
              activeValue === String(option.value) && "bg-muted",
            )}
            onClick={() => {
              query.onFiltersChange({ [column.key]: String(option.value) });
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function FilterPanel<T>({
  query,
  filterableColumns,
  isFilterOpen,
  setIsFilterOpen,
  draftFilters,
  setDraftFilters,
}: Readonly<{
  query: AppDataTableQuery;
  filterableColumns: AppDataTableColumn<T>[];
  isFilterOpen: boolean;
  setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
  draftFilters: Record<string, string>;
  setDraftFilters: (
    valueOrFn:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
}>) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="py-5 font-semibold"
        onClick={() => {
          setDraftFilters(query.filters);
          setIsFilterOpen((prev) => !prev);
        }}
      >
        <FunnelSimpleIcon className="size-4" />
        Filter
      </Button>

      {isFilterOpen ? (
        <div
          className={cn(
            "absolute z-30 mt-2 w-80 rounded-lg border border-[#dbe4ee] bg-white p-3 shadow-lg",
            query.filterpositionright || !query.hideSearch
              ? "right-0"
              : "left-0",
          )}
        >
          <div className="space-y-3">
            {filterableColumns.map((column) => {
              const filter = column.filter;
              if (!filter) return null;

              return (
                <FormField
                  key={column.key}
                  id={`filter-${column.key}`}
                  label={filter.label ?? column.header}
                  type={filter.type}
                  placeholder={
                    filter.placeholder ??
                    (filter.type === "select"
                      ? "Semua"
                      : `Filter ${column.header}`)
                  }
                  value={draftFilters[column.key] ?? ""}
                  onChange={(e) => {
                    const nextValue = String(e.target.value ?? "");
                    if (filter.onSelectOption) {
                      const matched = filter.options?.find(
                        (opt) => String(opt.value) === nextValue,
                      );
                      if (matched) {
                        filter.onSelectOption(
                          nextValue,
                          String(matched.label),
                        );
                      }
                    }
                    setDraftFilters((prev) => ({
                      ...prev,
                      [column.key]: nextValue,
                    }));
                  }}
                  options={filter.options}
                  selectLoading={filter.loading}
                  onScrollToBottom={filter.onScrollToBottom}
                  searchable={filter.searchable}
                  onSearchChange={filter.onSearchChange}
                  inputClassName="h-8 py-1"
                />
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="muted-outline"
              className="px-5 py-4"
              size="sm"
              onClick={() => {
                setDraftFilters({});
                query.onFiltersChange({});
                setIsFilterOpen(false);
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              variant="primary"
              className="px-5 py-4"
              onClick={() => {
                query.onFiltersChange(draftFilters);
                setIsFilterOpen(false);
              }}
            >
              Filter
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TableBody<T>(
  props: Readonly<{
    isLoading: boolean;
    rows: T[];
    getRowKey: (row: T, index: number) => string;
    emptyText: string;
    columnSpan: number;
    visibleColumns: AppDataTableColumn<T>[];
    expandable?: AppDataTableProps<T>["expandable"];
    expandedRowKeys: Set<string>;
    toggleExpand: (rowKey: string) => void;
    stickyFirstColumn?: boolean;
    expandOffset?: string;
  }>,
) {
  if (props.isLoading) {
    return (
      <tr>
        <td
          colSpan={props.columnSpan}
          className="px-4 py-6 text-sm text-center text-gray-400"
        >
          Memuat data...
        </td>
      </tr>
    );
  }

  if (props.rows.length === 0) {
    return (
      <tr>
        <td
          colSpan={props.columnSpan}
          className="px-4 py-6 text-sm text-center text-gray-400"
        >
          {props.emptyText}
        </td>
      </tr>
    );
  }

  return (
    <>
      {props.rows.map((row, index) => (
        <TableRow<T>
          key={props.getRowKey(row, index)}
          row={row}
          index={index}
          getRowKey={props.getRowKey}
          visibleColumns={props.visibleColumns}
          expandable={props.expandable}
          expandedRowKeys={props.expandedRowKeys}
          toggleExpand={props.toggleExpand}
          stickyFirstColumn={props.stickyFirstColumn}
          expandOffset={props.expandOffset}
        />
      ))}
    </>
  );
}

function TableRow<T>({
  row,
  index,
  getRowKey,
  visibleColumns,
  expandable,
  expandedRowKeys,
  toggleExpand,
  stickyFirstColumn,
  expandOffset,
}: Readonly<{
  row: T;
  index: number;
  getRowKey: (row: T, index: number) => string;
  visibleColumns: AppDataTableColumn<T>[];
  expandable?: AppDataTableProps<T>["expandable"];
  expandedRowKeys: Set<string>;
  toggleExpand: (rowKey: string) => void;
  stickyFirstColumn?: boolean;
  expandOffset?: string;
}>) {
  const rowKey = getRowKey(row, index);
  const canExpand = expandable?.isRowExpandable
    ? expandable.isRowExpandable(row)
    : Boolean(expandable);
  const isExpanded = expandedRowKeys.has(rowKey);
  const columnSpan = visibleColumns.length + (expandable ? 1 : 0);

  return (
    <Fragment key={rowKey}>
      <tr className="border-t border-[#e9eef4]">
        {expandable ? (
          <td
            className={cn(
              "px-2 py-3 align-top",
              stickyFirstColumn && "sticky left-0 z-10 bg-white",
            )}
          >
            {canExpand ? (
              <button
                type="button"
                className="mt-0.5 inline-flex size-6 items-center justify-center rounded text-[#6f7f8f] hover:bg-[#eef3f8]"
                onClick={() => toggleExpand(rowKey)}
                aria-label={isExpanded ? "Collapse row" : "Expand row"}
              >
                {isExpanded ? (
                  <CaretDownIcon className="size-4" />
                ) : (
                  <CaretRightIcon className="size-4" />
                )}
              </button>
            ) : null}
          </td>
        ) : null}
        {visibleColumns.map((column, colIndex) => (
          <td
            key={column.key}
            style={{
              ...(column.maxWidth ? { maxWidth: column.maxWidth } : {}),
              ...(stickyFirstColumn && colIndex === 0
                ? { left: expandOffset ?? "0px" }
                : {}),
            }}
            className={cn(
              "px-4 py-3 align-top text-[#273240] place-content-center",
              stickyFirstColumn &&
                colIndex === 0 &&
                "sticky z-10 bg-white shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)]",
              column.className,
            )}
          >
            {column.render(row)}
          </td>
        ))}
      </tr>
      {expandable && canExpand && isExpanded ? (
        <tr className="border-t border-[#e9eef4] bg-[#fafcff] relative">
          <td
            colSpan={columnSpan}
            className="px-4 py-3 text-[#273240] place-content-center pl-8"
          >
            <div className="absolute top-6">
              <ArrowBendDownRightIcon />
            </div>
            {expandable.renderExpandedContent(row)}
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function PaginationFooter({
  pagination,
  totalPages,
  pageItems,
}: Readonly<{
  pagination: AppDataTablePagination;
  totalPages: number;
  pageItems: Array<number | "ellipsis">;
}>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e9eef4] px-4 py-3 text-xs text-[#738496]">
      <div className="flex items-center gap-2">
        <span>Menampilkan</span>
        <Select
          value={String(pagination.perPage)}
          onValueChange={(value) => pagination.onPerPageChange(Number(value))}
        >
          <SelectTrigger
            size="sm"
            className="h-7 min-w-16 border-[#7fb4eb] bg-[#edf5ff] text-[#1876d3]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            {pagination.perPageOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>dari {pagination.totalItems} data</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          className="h-7 min-w-7 rounded px-2 text-[#6f7f8f] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage <= 1}
        >
          ‹
        </button>

        {pageItems.map((item, index) => (
          <PaginationItem
            key={item === "ellipsis" ? `ellipsis-${index}` : item}
            item={item}
            currentPage={pagination.currentPage}
            onPageChange={pagination.onPageChange}
          />
        ))}

        <button
          type="button"
          className="h-7 min-w-7 rounded px-2 text-[#6f7f8f] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage >= totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}

function PaginationItem({
  item,
  currentPage,
  onPageChange,
}: Readonly<{
  item: number | "ellipsis";
  currentPage: number;
  onPageChange: (value: number) => void;
}>) {
  if (item === "ellipsis") {
    return <span className="px-1 text-[#6f7f8f]">...</span>;
  }

  return (
    <button
      type="button"
      className={cn(
        "h-7 min-w-7 rounded px-2 text-[#2f3e4b] cursor-pointer",
        item === currentPage &&
          "border border-[#7fb4eb] bg-[#edf5ff] text-[#1876d3]",
      )}
      onClick={() => onPageChange(item)}
    >
      {item}
    </button>
  );
}

export type { AppDataTableColumn, AppDataTableProps, AppDataTablePagination };
