import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextType = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }
>(({ className, value, defaultValue, onValueChange, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue ?? value);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setActiveTab(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    },
    [onValueChange],
  );

  const contextValue = React.useMemo(
    () => ({
      value: activeTab,
      onValueChange: handleValueChange,
    }),
    [activeTab, handleValueChange],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div ref={ref} className={cn("w-full", className)} {...props} />
    </TabsContext.Provider>
  );
});
Tabs.displayName = "Tabs";

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex flex-col h-auto w-full overflow-x-auto scrollbar-none! justify-start rounded-lg p-1.5 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; variant?: "default" | "outline" }
>(({ className, value, variant = "default", ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within a Tabs component");
  }

  const isActive = context.value === value;

  return (
    <button
      type="button"
      ref={ref}
      className={cn(
        "inline-flex items-center justify-start whitespace-nowrap px-4 py-3 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 w-full text-left",
        variant === "outline" ? "border-b-2 border-transparent rounded-none" : "rounded-md",
        (() => {
          if (isActive) {
            return variant === "outline"
              ? "border-b-2 border-primary text-primary bg-transparent font-semibold"
              : "bg-primary text-white shadow-xs font-semibold";
          }
          return variant === "outline"
            ? "text-muted-foreground hover:bg-white hover:text-primary hover:cursor-pointer"
            : "text-muted-foreground hover:bg-white/50 hover:text-foreground";
        })(),
        className,
      )}
      onClick={(e) => {
        context.onValueChange?.(value);
        props.onClick?.(e);
      }}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within a Tabs component");
  }

  const isActive = context.value === value;

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "mt-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...props}
    />
  );
});
TabsContent.displayName = "TabsContent";
