"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import {
  CaretDownIcon,
  CheckIcon,
  SpinnerGapIcon,
} from "@phosphor-icons/react";

type ComboboxItemValue = string | number;

interface ComboboxContextValue {
  items: { label: string; value: ComboboxItemValue }[];
  value: ComboboxItemValue | null | undefined;
  onValueChange: (value: ComboboxItemValue) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  search: string;
  setSearch: (value: string) => void;
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  triggerRef: React.RefObject<HTMLDivElement | null>;
  listId: string;
  disabled: boolean;
  isLoading: boolean;
  filteredItems: { label: string; value: ComboboxItemValue }[];
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null);

function useComboboxContext() {
  const ctx = React.useContext(ComboboxContext);
  if (!ctx)
    throw new Error("Combobox components must be used within <Combobox>");
  return ctx;
}

interface ComboboxRootProps {
  items?: { label: string; value: ComboboxItemValue }[];
  value?: ComboboxItemValue | null;
  defaultValue?: ComboboxItemValue | null;
  onValueChange?: (value: ComboboxItemValue) => void;
  onSearchChange?: (search: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
  name?: string;
  debounceMs?: number;
  children: React.ReactNode;
}

function Combobox({
  items = [],
  value: controlledValue,
  defaultValue,
  onValueChange,
  onSearchChange,
  disabled = false,
  isLoading = false,
  debounceMs = 300,
  children,
}: Readonly<ComboboxRootProps>) {
  const [internalValue, setInternalValue] = React.useState<
    ComboboxItemValue | null | undefined
  >(defaultValue ?? null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const listId = React.useId();

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, search]);

  const prevIsLoadingRef = React.useRef(isLoading);

  React.useEffect(() => {
    const wasLoading = prevIsLoadingRef.current;
    prevIsLoadingRef.current = isLoading;

    if (wasLoading && !isLoading && isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading, isOpen]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  React.useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleValueChange = React.useCallback(
    (val: ComboboxItemValue) => {
      if (!isControlled) {
        setInternalValue(val);
      }
      onValueChange?.(val);
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(-1);
    },
    [isControlled, onValueChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = document
        .querySelector('[data-slot="combobox-content"]')
        ?.contains(target);
      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const ctx: ComboboxContextValue = React.useMemo(
    () => ({
      items,
      value: currentValue,
      onValueChange: handleValueChange,
      isOpen,
      setIsOpen,
      search,
      setSearch: handleSearchChange,
      highlightedIndex,
      setHighlightedIndex,
      inputRef,
      listRef,
      triggerRef,
      listId,
      disabled,
      isLoading,
      filteredItems,
    }),
    [
      items,
      currentValue,
      handleValueChange,
      isOpen,
      search,
      handleSearchChange,
      highlightedIndex,
      disabled,
      isLoading,
      filteredItems,
      triggerRef,
    ],
  );

  return (
    <ComboboxContext.Provider value={ctx}>
      <div ref={containerRef} className="relative">
        {children}
      </div>
    </ComboboxContext.Provider>
  );
}

interface ComboboxInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> {
  showTrigger?: boolean;
  validateOn?: "blur" | "submit" | "change";
}

function ComboboxInput({
  id,
  className,
  placeholder,
  showTrigger = true,
  validateOn = "submit",
  disabled,
  onBlur,
  ...props
}: Readonly<ComboboxInputProps>) {
  const {
    value,
    onValueChange,
    isOpen,
    setIsOpen,
    search,
    setSearch,
    highlightedIndex,
    setHighlightedIndex,
    inputRef,
    listRef,
    triggerRef,
    listId,
    disabled: ctxDisabled,
    filteredItems,
    items,
    isLoading,
  } = useComboboxContext();

  const isDisabled = disabled || ctxDisabled;
  const [isEditing, setIsEditing] = React.useState(false);

  const selectedLabel = React.useMemo(() => {
    if (search) return search;
    const found = items.find((item) => String(item.value) === String(value));
    return found ? found.label : "";
  }, [items, value, search]);

  React.useEffect(() => {
    setIsEditing(false);
  }, [value]);

  let displayValue = "";
  if (isEditing) {
    displayValue = search;
  } else if (value !== null && value !== undefined) {
    displayValue = selectedLabel;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsEditing(true);
    setSearch(e.target.value);
    setHighlightedIndex(-1);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!isDisabled) setIsOpen(true);
  };

  const handleInputClick = () => {
    if (!isDisabled) setIsOpen(true);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (validateOn === "blur") {
      onBlur?.(e);
    }
  };

  const handleClear = () => {
    setSearch("");
    onValueChange(null as unknown as ComboboxItemValue);
  };

  const selectHighlighted = () => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredItems.length) {
      onValueChange(filteredItems[highlightedIndex].value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isDisabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev < filteredItems.length - 1 ? prev + 1 : 0,
          );
        } else {
          setIsOpen(true);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredItems.length - 1,
          );
        }
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectHighlighted();
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setIsEditing(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        setSearch("");
        setIsEditing(false);
        if (validateOn === "blur") {
          onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
        }
        break;
    }
  };

  const handleClick = () => {
    if (!isDisabled) {
      setIsOpen((prev) => !prev);
      inputRef.current?.focus();
    }
  };

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(
        "[data-slot='combobox-item']",
      );
      items[highlightedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div
      ref={triggerRef}
      data-disabled={isDisabled || undefined}
      className={cn(
        "flex h-10 w-full items-center rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        "has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20",
        "data-disabled:bg-input/50 data-disabled:opacity-50",
        isOpen && "border-ring ring-3 ring-ring/50",
        className,
      )}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-invalid={props["aria-invalid"]}
        aria-autocomplete="list"
        aria-controls={listId}
        placeholder={placeholder}
        disabled={isDisabled}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none placeholder:text-gray-400 disabled:bg-transparent"
        {...props}
      />
      {value !== null && value !== undefined && !isDisabled ? (
        <button
          type="button"
          onClick={handleClear}
          className="ml-1 rounded-md p-0.5 text-gray-400 hover:text-foreground"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      ) : null}
      {showTrigger ? (
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleClick}
          className="ml-1 rounded-md p-0.5 text-gray-400 hover:text-foreground disabled:opacity-50"
        >
          {isLoading ? (
            <SpinnerGapIcon className="size-4 animate-spin" />
          ) : (
            <CaretDownIcon
              className={cn(
                "size-4 transition-transform",
                isOpen && "rotate-180",
              )}
            />
          )}
        </button>
      ) : null}
      <input type="hidden" name={props.name} value={value ?? ""} />
    </div>
  );
}

interface ComboboxContentProps {
  children: React.ReactNode;
  className?: string;
  side?: "bottom" | "top";
  sideOffset?: number;
}

function ComboboxContent({
  children,
  className,
}: Readonly<ComboboxContentProps>) {
  const { isOpen, triggerRef } = useComboboxContext();
  const [position, setPosition] = React.useState({
    top: 0,
    left: 0,
    width: 0,
  });

  React.useLayoutEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      data-slot="combobox-content"
      className={cn(
        "fixed z-50 mt-1 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-md",
        "animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={{ top: position.top, left: position.left, width: position.width }}
    >
      {children}
    </div>,
    document.body,
  );
}

interface ComboboxListProps {
  children: React.ReactNode;
  className?: string;
  onScrollToBottom?: () => void;
  isLoading?: boolean;
}

function ComboboxList({
  children,
  className,
  onScrollToBottom,
  isLoading,
}: Readonly<ComboboxListProps>) {
  const { listRef, listId, filteredItems } = useComboboxContext();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onScrollToBottom) return;
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      onScrollToBottom();
    }
  };

  // WAI-ARIA combobox pattern requires role="listbox" on non-native element; native <select>/<datalist> cannot support custom items, scroll, or loading states
  return (
    <div // NOSONAR — role="listbox" intentionally chosen for WAI-ARIA combobox pattern
      ref={listRef}
      id={listId}
      role="listbox"
      className={cn(
        "max-h-60 overflow-y-auto overscroll-contain p-1",
        className,
      )}
      onScroll={handleScroll}
    >
      {children}
      {isLoading && filteredItems.length > 0 ? (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-400">
          <SpinnerGapIcon className="size-4 animate-spin" />
          Memuat...
        </div>
      ) : null}
    </div>
  );
}

interface ComboboxItemProps {
  value: ComboboxItemValue;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function ComboboxItem({
  value,
  children,
  className,
  disabled = false,
}: Readonly<ComboboxItemProps>) {
  const {
    onValueChange,
    highlightedIndex,
    setHighlightedIndex,
    filteredItems,
    value: selectedValue,
  } = useComboboxContext();

  const index = filteredItems.findIndex(
    (item) => String(item.value) === String(value),
  );
  const isSelected =
    selectedValue !== null &&
    selectedValue !== undefined &&
    String(selectedValue) === String(value);
  const isHighlighted = index >= 0 && highlightedIndex === index;

  const handleClick = () => {
    if (!disabled) onValueChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onValueChange(value);
    }
  };

  const handleMouseEnter = () => {
    if (!disabled) setHighlightedIndex(index);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // WAI-ARIA combobox pattern requires role="option" on non-native element; native <option> only accepts text, cannot render icons/custom layout
  return (
    <div // NOSONAR — role="option" intentionally chosen for WAI-ARIA combobox pattern
      data-slot="combobox-item"
      role="option"
      tabIndex={-1}
      aria-selected={isSelected}
      data-highlighted={isHighlighted || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm outline-none select-none",
        isHighlighted && "bg-accent text-accent-foreground",
        isSelected && "font-medium",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
    >
      {children}
      {isSelected ? (
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          <CheckIcon className="size-4" />
        </span>
      ) : null}
    </div>
  );
}

interface ComboboxEmptyProps {
  children?: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  searchEmptyMessage?: string;
}

function ComboboxEmpty({
  children,
  className,
  emptyMessage = "Tidak ada data",
  searchEmptyMessage,
}: Readonly<ComboboxEmptyProps>) {
  const { filteredItems, isLoading, search } = useComboboxContext();

  if (isLoading && filteredItems.length === 0) {
    return (
      <div
        data-slot="combobox-empty"
        className={cn(
          "flex w-full items-center justify-center gap-2 py-4 text-sm text-gray-400",
          className,
        )}
      >
        <SpinnerGapIcon className="size-4 animate-spin" />
        Memuat...
      </div>
    );
  }

  if (filteredItems.length > 0) return null;

  let message = emptyMessage;
  if (search && searchEmptyMessage) {
    message = searchEmptyMessage.replace("{search}", search);
  } else if (search) {
    message = `Tidak ada hasil untuk "${search}"`;
  }

  return (
    <div
      data-slot="combobox-empty"
      className={cn(
        "flex w-full justify-center py-4 text-center text-sm text-gray-400",
        className,
      )}
    >
      {children ?? message}
    </div>
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
};
