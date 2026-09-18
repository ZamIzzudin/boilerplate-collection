import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock @phosphor-icons/react – every export becomes a simple <span>
jest.mock("@phosphor-icons/react", () => {
  const icon = (name: string) => {
    const Cmp = (props: Record<string, unknown>) => (
      <span data-testid={name} {...props} />
    );
    Cmp.displayName = name;
    return Cmp;
  };
  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        return icon(prop);
      },
    },
  );
});

// Mock sonner – toast.dismiss is a no-op
jest.mock("sonner", () => ({
  toast: {
    dismiss: jest.fn(),
  },
}));

// Mock @base-ui/react primitives – each exported sub-component renders a
// simple <div> (or <button> for trigger-like components) so tests can assert
// on children / data-slot without needing real base-ui internals.
jest.mock("@base-ui/react/accordion", () => {
  const el = (slot: string, tag: "div" | "button" = "div") => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement(tag, { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    Accordion: {
      Root: el("accordion"),
      Item: el("accordion-item"),
      Trigger: el("accordion-trigger", "button"),
      Header: ({ children, ...rest }: any) => React.createElement("div", rest, children),
      Panel: el("accordion-content"),
    },
  };
});

jest.mock("@base-ui/react/alert-dialog", () => {
  const el = (slot: string, tag: "div" | "button" = "div") => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement(tag, { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    AlertDialog: {
      Root: ({ children, ...rest }: any) => React.createElement("div", { "data-slot": "alert-dialog", ...rest }, children),
      Trigger: el("alert-dialog-trigger", "button"),
      Portal: ({ children, className, ...rest }: any) => React.createElement("div", { className, ...rest }, children),
      Backdrop: el("alert-dialog-overlay"),
      Popup: el("alert-dialog-content"),
      Title: ({ children, className, ...rest }: any) => React.createElement("div", { "data-slot": "alert-dialog-title", className, ...rest }, children),
      Description: ({ children, className, ...rest }: any) => React.createElement("div", { "data-slot": "alert-dialog-description", className, ...rest }, children),
      Close: el("alert-dialog-cancel", "button"),
    },
  };
});

jest.mock("@base-ui/react/avatar", () => {
  const el = (slot: string) => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement("div", { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    Avatar: {
      Root: el("avatar"),
      Image: el("avatar-image"),
      Fallback: el("avatar-fallback"),
    },
  };
});

jest.mock("@base-ui/react/button", () => ({
  Button: ({ children, className, ...rest }: any) =>
    React.createElement("button", { "data-slot": "button", className, ...rest }, children),
}));

jest.mock("@base-ui/react/input", () => ({
  Input: ({ className, ...rest }: any) =>
    React.createElement("input", { "data-slot": "input", className, ...rest }),
}));

jest.mock("@base-ui/react/separator", () => ({
  Separator: ({ className, ...rest }: any) =>
    React.createElement("hr", { "data-slot": "separator", className, ...rest }),
}));

jest.mock("@base-ui/react/popover", () => {
  const el = (slot: string) => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement("div", { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    Popover: {
      Root: ({ children, ...rest }: any) => React.createElement("div", { "data-slot": "popover", ...rest }, children),
      Trigger: el("popover-trigger"),
      Portal: ({ children }: any) => React.createElement("div", null, children),
      Positioner: el("popover-positioner"),
      Popup: el("popover-content"),
      Title: el("popover-title"),
      Description: el("popover-description"),
    },
  };
});

jest.mock("@base-ui/react/tooltip", () => {
  const el = (slot: string) => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement("div", { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    Tooltip: {
      Root: ({ children, ...rest }: any) => React.createElement("div", { "data-slot": "tooltip", ...rest }, children),
      Trigger: el("tooltip-trigger"),
      Portal: ({ children }: any) => React.createElement("div", null, children),
      Positioner: el("tooltip-positioner"),
      Popup: el("tooltip-content"),
      Arrow: el("tooltip-arrow"),
      Provider: ({ children, ...rest }: any) => React.createElement("div", { "data-slot": "tooltip-provider", ...rest }, children),
    },
  };
});

jest.mock("@base-ui/react/select", () => {
  const el = (slot: string) => {
    const Cmp = ({ children, className, ...rest }: any) =>
      React.createElement("div", { "data-slot": slot, className, ...rest }, children);
    Cmp.displayName = slot;
    return Cmp;
  };
  return {
    Select: {
      Root: ({ children, ...rest }: any) => React.createElement("div", { "data-slot": "select", ...rest }, children),
      Trigger: el("select-trigger"),
      Value: el("select-value"),
      Portal: ({ children }: any) => React.createElement("div", null, children),
      Positioner: el("select-positioner"),
      Popup: el("select-content"),
      Group: el("select-group"),
      GroupLabel: el("select-label"),
      Item: el("select-item"),
      ItemText: el("select-item-text"),
      ItemIndicator: el("select-item-indicator"),
      Separator: el("select-separator"),
      List: ({ children }: any) => React.createElement("div", null, children),
      Icon: el("select-icon"),
      ScrollUpArrow: el("select-scroll-up-button"),
      ScrollDownArrow: el("select-scroll-down-button"),
    },
  };
});

// ==========================================================================
// 1. Accordion
// ==========================================================================
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../accordion";

describe("Accordion", () => {
  it("renders root with data-slot", () => {
    render(<Accordion data-testid="root" />);
    expect(screen.getByTestId("root")).toHaveAttribute("data-slot", "accordion");
  });

  it("applies custom className", () => {
    render(<Accordion data-testid="root" className="my-class" />);
    expect(screen.getByTestId("root").className).toContain("my-class");
  });
});

describe("AccordionItem", () => {
  it("renders with data-slot", () => {
    render(<AccordionItem data-testid="item" />);
    expect(screen.getByTestId("item")).toHaveAttribute("data-slot", "accordion-item");
  });

  it("applies custom className", () => {
    render(<AccordionItem data-testid="item" className="extra" />);
    expect(screen.getByTestId("item").className).toContain("extra");
  });
});

describe("AccordionTrigger", () => {
  it("renders trigger with children", () => {
    render(<AccordionTrigger>Click me</AccordionTrigger>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<AccordionTrigger className="custom">T</AccordionTrigger>);
    expect(screen.getByText("T").className).toContain("custom");
  });
});

describe("AccordionContent", () => {
  it("renders children", () => {
    render(<AccordionContent>Body text</AccordionContent>);
    expect(screen.getByText("Body text")).toBeInTheDocument();
  });
});

// ==========================================================================
// 2. AlertDialog
// ==========================================================================
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTrigger,
  AlertDialogMedia,
} from "../alert-dialog";

describe("AlertDialog", () => {
  it("renders root with data-slot", () => {
    render(<AlertDialog data-testid="ad" />);
    expect(screen.getByTestId("ad")).toHaveAttribute("data-slot", "alert-dialog");
  });
});

describe("AlertDialogTrigger", () => {
  it("renders as button", () => {
    render(<AlertDialogTrigger>Open</AlertDialogTrigger>);
    expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
  });
});

describe("AlertDialogContent", () => {
  it("renders with data-slot", () => {
    render(
      <AlertDialog>
        <AlertDialogContent data-testid="content">Hello</AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByTestId("content")).toHaveAttribute("data-slot", "alert-dialog-content");
  });
});

describe("AlertDialogHeader / Footer / Title / Description / Media", () => {
  it("AlertDialogHeader renders children", () => {
    render(<AlertDialogHeader data-testid="h">Header</AlertDialogHeader>);
    expect(screen.getByTestId("h")).toHaveTextContent("Header");
  });

  it("AlertDialogFooter renders children", () => {
    render(<AlertDialogFooter data-testid="f">Footer</AlertDialogFooter>);
    expect(screen.getByTestId("f")).toHaveTextContent("Footer");
  });

  it("AlertDialogTitle renders title text", () => {
    render(<AlertDialogTitle data-testid="t">Title</AlertDialogTitle>);
    expect(screen.getByTestId("t")).toHaveTextContent("Title");
  });

  it("AlertDialogDescription renders description text", () => {
    render(<AlertDialogDescription data-testid="d">Desc</AlertDialogDescription>);
    expect(screen.getByTestId("d")).toHaveTextContent("Desc");
  });

  it("AlertDialogMedia renders with data-slot", () => {
    render(<AlertDialogMedia data-testid="m" />);
    expect(screen.getByTestId("m")).toHaveAttribute("data-slot", "alert-dialog-media");
  });
});

describe("AlertDialogAction / Cancel", () => {
  it("AlertDialogAction renders a button", () => {
    render(<AlertDialogAction data-testid="a">OK</AlertDialogAction>);
    expect(screen.getByTestId("a").tagName).toBe("BUTTON");
  });

  it("AlertDialogCancel renders a button", () => {
    render(<AlertDialogCancel data-testid="c">Cancel</AlertDialogCancel>);
    expect(screen.getByTestId("c").tagName).toBe("BUTTON");
  });
});

describe("AlertDialogOverlay / Portal", () => {
  it("AlertDialogOverlay has data-slot", () => {
    render(<AlertDialogOverlay data-testid="o" />);
    expect(screen.getByTestId("o")).toHaveAttribute("data-slot", "alert-dialog-overlay");
  });

  it("AlertDialogPortal renders children", () => {
    render(<AlertDialogPortal data-testid="p">child</AlertDialogPortal>);
    expect(screen.getByTestId("p")).toHaveTextContent("child");
  });
});

// ==========================================================================
// 3. AlertMessage
// ==========================================================================
import { AlertMessage } from "../alert-message";

describe("AlertMessage", () => {
  const base = {
    open: true,
    onOpenChange: jest.fn(),
    title: "Confirm",
    description: "Are you sure?",
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders title and description", () => {
    render(<AlertMessage {...base} />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("renders confirm button with default label", () => {
    render(<AlertMessage {...base} />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders custom confirmLabel", () => {
    render(<AlertMessage {...base} confirmLabel="Yes" />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", () => {
    const onConfirm = jest.fn();
    render(<AlertMessage {...base} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("OK"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

// ==========================================================================
// 4. Avatar
// ==========================================================================
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
} from "../avatar";

describe("Avatar", () => {
  it("renders with data-slot", () => {
    render(<Avatar data-testid="av" />);
    expect(screen.getByTestId("av")).toHaveAttribute("data-slot", "avatar");
  });

  it("applies default size", () => {
    render(<Avatar data-testid="av" />);
    expect(screen.getByTestId("av").getAttribute("data-size")).toBe("default");
  });

  it("applies custom size", () => {
    render(<Avatar data-testid="av" size="lg" />);
    expect(screen.getByTestId("av").getAttribute("data-size")).toBe("lg");
  });

  it("applies custom className", () => {
    render(<Avatar data-testid="av" className="extra" />);
    expect(screen.getByTestId("av").className).toContain("extra");
  });
});

describe("AvatarImage / AvatarFallback / AvatarBadge / AvatarGroup / AvatarGroupCount", () => {
  it("AvatarImage has data-slot", () => {
    render(<AvatarImage data-testid="ai" />);
    expect(screen.getByTestId("ai")).toHaveAttribute("data-slot", "avatar-image");
  });

  it("AvatarFallback shows fallback content", () => {
    render(<AvatarFallback data-testid="af">AB</AvatarFallback>);
    expect(screen.getByTestId("af")).toHaveTextContent("AB");
  });

  it("AvatarBadge renders a span", () => {
    render(<AvatarBadge data-testid="ab">●</AvatarBadge>);
    expect(screen.getByTestId("ab").tagName).toBe("SPAN");
  });

  it("AvatarGroup renders a div", () => {
    render(<AvatarGroup data-testid="ag" />);
    expect(screen.getByTestId("ag").tagName).toBe("DIV");
  });

  it("AvatarGroupCount renders count text", () => {
    render(<AvatarGroupCount data-testid="gc">+5</AvatarGroupCount>);
    expect(screen.getByTestId("gc")).toHaveTextContent("+5");
  });
});

// ==========================================================================
// 5. Breadcrumb
// ==========================================================================
import { Breadcrumb, createBreadcrumbItems } from "../breadcrumb";

describe("Breadcrumb", () => {
  it("renders all item labels", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home" },
          { label: "Products" },
          { label: "Detail" },
        ]}
      />,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Detail")).toBeInTheDocument();
  });

  it("renders separators between items", () => {
    render(
      <Breadcrumb items={[{ label: "A" }, { label: "B" }]} separator=">" />,
    );
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("renders buttons for items with onClick", () => {
    const onClick = jest.fn();
    render(
      <Breadcrumb items={[{ label: "Go", onClick }]} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <Breadcrumb items={[{ label: "X" }]} className="nav-custom" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("nav-custom");
  });
});

describe("createBreadcrumbItems", () => {
  it("returns single active item when no activeLabel", () => {
    const items = createBreadcrumbItems("Base");
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ label: "Base", isActive: true });
  });

  it("returns base + active when activeLabel given", () => {
    const items = createBreadcrumbItems("Base", "Active");
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe("Base");
    expect(items[1].label).toBe("Active");
    expect(items[1].isActive).toBe(true);
  });

  it("adds onClick to base when onBack is provided", () => {
    const onBack = jest.fn();
    const items = createBreadcrumbItems("Base", "Active", onBack);
    expect(items[0].onClick).toBe(onBack);
  });
});

// ==========================================================================
// 6. Button
// ==========================================================================
import { Button, buttonVariants } from "../button";

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button data-testid="btn">Click</Button>);
    const el = screen.getByTestId("btn");
    expect(el.tagName).toBe("BUTTON");
    expect(el).toHaveTextContent("Click");
  });

  it("applies custom className", () => {
    render(<Button data-testid="btn" className="extra">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("extra");
  });

  it("renders with different variants", () => {
    const { rerender } = render(<Button data-testid="btn" variant="outline">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("border-primary");

    rerender(<Button data-testid="btn" variant="destructive">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("bg-destructive");

    rerender(<Button data-testid="btn" variant="ghost">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("hover:bg-muted");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button data-testid="btn" size="lg">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("h-10");

    rerender(<Button data-testid="btn" size="sm">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("h-7");

    rerender(<Button data-testid="btn" size="xs">X</Button>);
    expect(screen.getByTestId("btn").className).toContain("h-6");
  });
});

describe("buttonVariants", () => {
  it("returns class string for default variant", () => {
    const cls = buttonVariants({ variant: "default", size: "default" });
    expect(cls).toContain("bg-primary");
  });
});

// ==========================================================================
// 7. Card
// ==========================================================================
import {
  Card,
  CardHeader,
  CardContent,
  CardRow,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "../card";

describe("Card", () => {
  it("renders with default variant", () => {
    render(<Card data-testid="card" />);
    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Card data-testid="card">Inner</Card>);
    expect(screen.getByTestId("card")).toHaveTextContent("Inner");
  });

  it("applies custom className", () => {
    render(<Card data-testid="card" className="my-card" />);
    expect(screen.getByTestId("card").className).toContain("my-card");
  });

  it("applies primary variant", () => {
    render(<Card data-testid="card" variant="primary" />);
    expect(screen.getByTestId("card").className).toContain("bg-white");
  });
});

describe("CardHeader", () => {
  it("renders children text", () => {
    render(<CardHeader data-testid="ch">Header Title</CardHeader>);
    expect(screen.getByTestId("ch")).toHaveTextContent("Header Title");
  });

  it("renders icon when provided", () => {
    render(
      <CardHeader data-testid="ch" icon={<span data-testid="icon">★</span>}>
        Title
      </CardHeader>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent data-testid="cc">Content here</CardContent>);
    expect(screen.getByTestId("cc")).toHaveTextContent("Content here");
  });
});

describe("CardRow", () => {
  it("renders label and value", () => {
    render(<CardRow data-testid="cr" label="Name" value="John" />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
  });
});

describe("CardTitle", () => {
  it("renders text", () => {
    render(<CardTitle data-testid="ct">Title</CardTitle>);
    expect(screen.getByTestId("ct")).toHaveTextContent("Title");
  });
});

describe("CardDescription", () => {
  it("renders text", () => {
    render(<CardDescription data-testid="cd">Desc</CardDescription>);
    expect(screen.getByTestId("cd")).toHaveTextContent("Desc");
  });
});

describe("CardAction", () => {
  it("renders children", () => {
    render(<CardAction data-testid="ca">Action</CardAction>);
    expect(screen.getByTestId("ca")).toHaveTextContent("Action");
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter data-testid="cf">Footer content</CardFooter>);
    expect(screen.getByTestId("cf")).toHaveTextContent("Footer content");
  });
});

// ==========================================================================
// 8. Checkbox
// ==========================================================================
import { Checkbox } from "../checkbox";

describe("Checkbox", () => {
  it("renders as checkbox input", () => {
    render(<Checkbox data-testid="cb" />);
    expect(screen.getByTestId("cb").tagName).toBe("INPUT");
    expect(screen.getByTestId("cb")).toHaveAttribute("type", "checkbox");
  });

  it("applies custom className", () => {
    render(<Checkbox data-testid="cb" className="custom-cb" />);
    expect(screen.getByTestId("cb").className).toContain("custom-cb");
  });

  it("can be checked", () => {
    render(<Checkbox data-testid="cb" />);
    const cb = screen.getByTestId("cb") as HTMLInputElement;
    expect(cb.checked).toBe(false);
    fireEvent.click(cb);
    expect(cb.checked).toBe(true);
  });

  it("can be disabled", () => {
    render(<Checkbox data-testid="cb" disabled />);
    expect((screen.getByTestId("cb") as HTMLInputElement).disabled).toBe(true);
  });
});

// ==========================================================================
// 9. DetailFieldRow
// ==========================================================================
import { DetailFieldRow } from "../detail-field-row";

describe("DetailFieldRow", () => {
  it("renders label and value strings", () => {
    render(<DetailFieldRow label="Status" value="Active" />);
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders with inline layout", () => {
    const { container } = render(
      <DetailFieldRow label="A" value="B" inline />,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("grid");
  });

  it("renders with non-inline (flex-col) layout", () => {
    const { container } = render(
      <DetailFieldRow label="A" value="B" />,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper.className).toContain("flex-col");
  });

  it("renders non-string label and value as ReactNode", () => {
    render(
      <DetailFieldRow
        label={<span data-testid="label-node">Custom</span>}
        value={<span data-testid="value-node">Content</span>}
      />,
    );
    expect(screen.getByTestId("label-node")).toBeInTheDocument();
    expect(screen.getByTestId("value-node")).toBeInTheDocument();
  });
});

// ==========================================================================
// 10. Field
// ==========================================================================
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from "../field";

describe("Field", () => {
  it("renders a fieldset", () => {
    render(<Field data-testid="field" />);
    expect(screen.getByTestId("field").tagName).toBe("FIELDSET");
  });

  it("applies orientation", () => {
    render(<Field data-testid="field" orientation="horizontal" />);
    expect(screen.getByTestId("field").getAttribute("data-orientation")).toBe("horizontal");
  });

  it("applies custom className", () => {
    render(<Field data-testid="field" className="extra" />);
    expect(screen.getByTestId("field").className).toContain("extra");
  });
});

describe("FieldLabel", () => {
  it("renders children", () => {
    render(<FieldLabel data-testid="fl">Label text</FieldLabel>);
    expect(screen.getByTestId("fl")).toHaveTextContent("Label text");
  });
});

describe("FieldDescription", () => {
  it("renders description text", () => {
    render(<FieldDescription data-testid="fd">Help text</FieldDescription>);
    expect(screen.getByTestId("fd")).toHaveTextContent("Help text");
  });
});

describe("FieldError", () => {
  it("renders nothing when no errors and no children", () => {
    const { container } = render(<FieldError data-testid="fe" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders single error message string", () => {
    render(<FieldError data-testid="fe" errors={[{ message: "Required" }]} />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("renders multiple error messages as list", () => {
    render(
      <FieldError
        data-testid="fe"
        errors={[{ message: "Error 1" }, { message: "Error 2" }]}
      />,
    );
    expect(screen.getByText("Error 1")).toBeInTheDocument();
    expect(screen.getByText("Error 2")).toBeInTheDocument();
  });

  it("renders children directly when provided", () => {
    render(<FieldError data-testid="fe">Custom error</FieldError>);
    expect(screen.getByText("Custom error")).toBeInTheDocument();
  });
});

describe("FieldGroup", () => {
  it("renders a div", () => {
    render(<FieldGroup data-testid="fg" />);
    expect(screen.getByTestId("fg").tagName).toBe("DIV");
  });
});

describe("FieldLegend", () => {
  it("renders a legend", () => {
    render(<FieldLegend data-testid="fl">Legend</FieldLegend>);
    expect(screen.getByTestId("fl").tagName).toBe("LEGEND");
    expect(screen.getByTestId("fl")).toHaveTextContent("Legend");
  });
});

describe("FieldSet", () => {
  it("renders a fieldset", () => {
    render(<FieldSet data-testid="fs" />);
    expect(screen.getByTestId("fs").tagName).toBe("FIELDSET");
  });
});

describe("FieldContent", () => {
  it("renders children", () => {
    render(<FieldContent data-testid="fc">Content</FieldContent>);
    expect(screen.getByTestId("fc")).toHaveTextContent("Content");
  });
});

describe("FieldTitle", () => {
  it("renders children", () => {
    render(<FieldTitle data-testid="ft">Title</FieldTitle>);
    expect(screen.getByTestId("ft")).toHaveTextContent("Title");
  });
});

describe("FieldSeparator", () => {
  it("renders a div with data-slot", () => {
    render(<FieldSeparator data-testid="fs" />);
    expect(screen.getByTestId("fs")).toHaveAttribute("data-slot", "field-separator");
  });

  it("renders children content when provided", () => {
    render(<FieldSeparator data-testid="fs">Or</FieldSeparator>);
    expect(screen.getByText("Or")).toBeInTheDocument();
  });
});

// ==========================================================================
// 11. InputGroup
// ==========================================================================
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
} from "../input-group";

describe("InputGroup", () => {
  it("renders a div with role=group", () => {
    render(<InputGroup data-testid="ig" />);
    expect(screen.getByTestId("ig")).toHaveAttribute("role", "group");
  });

  it("applies custom className", () => {
    render(<InputGroup data-testid="ig" className="extra" />);
    expect(screen.getByTestId("ig").className).toContain("extra");
  });
});

describe("InputGroupAddon", () => {
  it("renders with data-align", () => {
    render(<InputGroupAddon data-testid="iga" />);
    expect(screen.getByTestId("iga").getAttribute("data-align")).toBe("inline-start");
  });

  it("accepts custom align", () => {
    render(<InputGroupAddon data-testid="iga" align="inline-end" />);
    expect(screen.getByTestId("iga").getAttribute("data-align")).toBe("inline-end");
  });
});

describe("InputGroupButton", () => {
  it("renders a button", () => {
    render(<InputGroupButton data-testid="igb">Btn</InputGroupButton>);
    expect(screen.getByTestId("igb").tagName).toBe("BUTTON");
  });
});

describe("InputGroupText", () => {
  it("renders a span", () => {
    render(<InputGroupText data-testid="igt">Text</InputGroupText>);
    expect(screen.getByTestId("igt").tagName).toBe("SPAN");
    expect(screen.getByTestId("igt")).toHaveTextContent("Text");
  });
});

describe("InputGroupInput", () => {
  it("renders an input", () => {
    render(<InputGroupInput data-testid="igi" />);
    expect(screen.getByTestId("igi").tagName).toBe("INPUT");
  });
});

describe("InputGroupTextarea", () => {
  it("renders a textarea", () => {
    render(<InputGroupTextarea data-testid="igt" />);
    expect(screen.getByTestId("igt").tagName).toBe("TEXTAREA");
  });
});

// ==========================================================================
// 12. Input
// ==========================================================================
import { Input } from "../input";

describe("Input", () => {
  it("renders an input element", () => {
    render(<Input data-testid="inp" />);
    expect(screen.getByTestId("inp").tagName).toBe("INPUT");
  });

  it("applies placeholder", () => {
    render(<Input data-testid="inp" placeholder="Enter text" />);
    expect(screen.getByTestId("inp")).toHaveAttribute("placeholder", "Enter text");
  });

  it("applies custom className", () => {
    render(<Input data-testid="inp" className="custom-input" />);
    expect(screen.getByTestId("inp").className).toContain("custom-input");
  });

  it("handles value changes", () => {
    render(<Input data-testid="inp" />);
    const inp = screen.getByTestId("inp") as HTMLInputElement;
    fireEvent.change(inp, { target: { value: "hello" } });
    expect(inp.value).toBe("hello");
  });

  it("can be disabled", () => {
    render(<Input data-testid="inp" disabled />);
    expect((screen.getByTestId("inp") as HTMLInputElement).disabled).toBe(true);
  });

  it("supports different types", () => {
    render(<Input data-testid="inp" type="password" />);
    expect(screen.getByTestId("inp")).toHaveAttribute("type", "password");
  });
});

// ==========================================================================
// 13. Label
// ==========================================================================
import { Label } from "../label";

describe("Label", () => {
  it("renders a label element", () => {
    render(<Label data-testid="lbl">Name</Label>);
    expect(screen.getByTestId("lbl").tagName).toBe("LABEL");
  });

  it("renders text content", () => {
    render(<Label data-testid="lbl">Full Name</Label>);
    expect(screen.getByTestId("lbl")).toHaveTextContent("Full Name");
  });

  it("applies htmlFor", () => {
    render(<Label data-testid="lbl" htmlFor="name-input">Name</Label>);
    expect(screen.getByTestId("lbl")).toHaveAttribute("for", "name-input");
  });

  it("applies custom className", () => {
    render(<Label data-testid="lbl" className="custom-label">X</Label>);
    expect(screen.getByTestId("lbl").className).toContain("custom-label");
  });
});

// ==========================================================================
// 14. Loader
// ==========================================================================
import Loader from "../loader";

describe("Loader", () => {
  it("renders default label text", () => {
    render(<Loader />);
    expect(screen.getByText(/Memuat/)).toBeInTheDocument();
  });

  it("renders custom label", () => {
    render(<Loader label="data" />);
    expect(screen.getByText(/Memuat data/)).toBeInTheDocument();
  });

  it("renders spinner icon", () => {
    render(<Loader />);
    expect(screen.getByTestId("SpinnerGapIcon")).toBeInTheDocument();
  });
});

// ==========================================================================
// 15. NotificationToast
// ==========================================================================
import { NotificationToast } from "../notification-toast";

describe("NotificationToast", () => {
  const base = {
    id: "toast-1",
    type: "success" as const,
    title: "Success!",
    description: "Operation completed",
  };

  it("renders title and description", () => {
    render(<NotificationToast {...base} />);
    expect(screen.getByText("Success!")).toBeInTheDocument();
    expect(screen.getByText("Operation completed")).toBeInTheDocument();
  });

  it("renders the appropriate icon for success", () => {
    render(<NotificationToast {...base} />);
    expect(screen.getByTestId("CheckCircleIcon")).toBeInTheDocument();
  });

  it("renders the appropriate icon for warning", () => {
    render(<NotificationToast {...base} type="warning" />);
    expect(screen.getByTestId("WarningCircleIcon")).toBeInTheDocument();
  });

  it("renders the appropriate icon for failed", () => {
    render(<NotificationToast {...base} type="failed" />);
    expect(screen.getByTestId("XCircleIcon")).toBeInTheDocument();
  });

  it("dismisses toast when close button clicked", () => {
    const { toast } = require("sonner");
    render(<NotificationToast {...base} />);
    const closeBtn = screen.getByTestId("XIcon").closest("button")!;
    fireEvent.click(closeBtn);
    expect(toast.dismiss).toHaveBeenCalledWith("toast-1");
  });
});

// ==========================================================================
// 16. Popover
// ==========================================================================
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "../popover";

describe("Popover", () => {
  it("renders root", () => {
    render(<Popover data-testid="pop" />);
    expect(screen.getByTestId("pop")).toHaveAttribute("data-slot", "popover");
  });
});

describe("PopoverTrigger", () => {
  it("renders trigger", () => {
    render(<PopoverTrigger data-testid="pt">Open</PopoverTrigger>);
    expect(screen.getByTestId("pt")).toHaveAttribute("data-slot", "popover-trigger");
  });
});

describe("PopoverContent", () => {
  it("renders content", () => {
    render(
      <Popover>
        <PopoverContent data-testid="pc">Content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByTestId("pc")).toHaveAttribute("data-slot", "popover-content");
  });

  it("applies custom className", () => {
    render(
      <Popover>
        <PopoverContent data-testid="pc" className="pop-extra">X</PopoverContent>
      </Popover>,
    );
    expect(screen.getByTestId("pc").className).toContain("pop-extra");
  });
});

describe("PopoverHeader / PopoverTitle / PopoverDescription", () => {
  it("PopoverHeader renders children", () => {
    render(<PopoverHeader data-testid="ph">H</PopoverHeader>);
    expect(screen.getByTestId("ph")).toHaveTextContent("H");
  });

  it("PopoverTitle renders text", () => {
    render(<PopoverTitle data-testid="pt">Title</PopoverTitle>);
    expect(screen.getByTestId("pt")).toHaveTextContent("Title");
  });

  it("PopoverDescription renders text", () => {
    render(<PopoverDescription data-testid="pd">Desc</PopoverDescription>);
    expect(screen.getByTestId("pd")).toHaveTextContent("Desc");
  });
});

// ==========================================================================
// 17. Select
// ==========================================================================
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "../select";

describe("Select", () => {
  it("renders root", () => {
    render(<Select data-testid="sel" />);
    expect(screen.getByTestId("sel")).toHaveAttribute("data-slot", "select");
  });
});

describe("SelectTrigger", () => {
  it("renders trigger with data-slot", () => {
    render(
      <Select>
        <SelectTrigger data-testid="st">Pick</SelectTrigger>
      </Select>,
    );
    expect(screen.getByTestId("st")).toHaveAttribute("data-slot", "select-trigger");
  });

  it("applies default size", () => {
    render(
      <Select>
        <SelectTrigger data-testid="st">Pick</SelectTrigger>
      </Select>,
    );
    expect(screen.getByTestId("st").getAttribute("data-size")).toBe("default");
  });

  it("applies sm size", () => {
    render(
      <Select>
        <SelectTrigger data-testid="st" size="sm">Pick</SelectTrigger>
      </Select>,
    );
    expect(screen.getByTestId("st").getAttribute("data-size")).toBe("sm");
  });
});

describe("SelectValue", () => {
  it("renders value placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue data-testid="sv" placeholder="Choose..." />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByTestId("sv")).toHaveAttribute("data-slot", "select-value");
  });
});

describe("SelectContent", () => {
  it("renders content", () => {
    render(
      <Select>
        <SelectContent data-testid="sc">Items</SelectContent>
      </Select>,
    );
    expect(screen.getByTestId("sc")).toHaveAttribute("data-slot", "select-content");
  });
});

describe("SelectGroup / SelectLabel / SelectItem / SelectSeparator", () => {
  it("SelectGroup renders", () => {
    render(<SelectGroup data-testid="sg">G</SelectGroup>);
    expect(screen.getByTestId("sg")).toHaveAttribute("data-slot", "select-group");
  });

  it("SelectLabel renders text", () => {
    render(<SelectLabel data-testid="sl">Label</SelectLabel>);
    expect(screen.getByTestId("sl")).toHaveTextContent("Label");
  });

  it("SelectItem renders", () => {
    render(<SelectItem data-testid="si" value="opt1">Option 1</SelectItem>);
    expect(screen.getByTestId("si")).toHaveTextContent("Option 1");
  });

  it("SelectSeparator renders", () => {
    render(<SelectSeparator data-testid="sse" />);
    expect(screen.getByTestId("sse")).toHaveAttribute("data-slot", "select-separator");
  });
});

describe("SelectScrollUpButton / SelectScrollDownButton", () => {
  it("renders scroll up button", () => {
    render(<SelectScrollUpButton data-testid="su" />);
    expect(screen.getByTestId("su")).toHaveAttribute("data-slot", "select-scroll-up-button");
  });

  it("renders scroll down button", () => {
    render(<SelectScrollDownButton data-testid="sd" />);
    expect(screen.getByTestId("sd")).toHaveAttribute("data-slot", "select-scroll-down-button");
  });
});

// ==========================================================================
// 18. Separator
// ==========================================================================
import { Separator } from "../separator";

describe("Separator", () => {
  it("renders a horizontal separator", () => {
    render(<Separator data-testid="sep" />);
    expect(screen.getByTestId("sep")).toHaveAttribute("data-slot", "separator");
  });

  it("applies custom className", () => {
    render(<Separator data-testid="sep" className="my-sep" />);
    expect(screen.getByTestId("sep").className).toContain("my-sep");
  });

  it("renders with vertical orientation", () => {
    render(<Separator data-testid="sep" orientation="vertical" />);
    expect(screen.getByTestId("sep")).toBeInTheDocument();
  });
});

// ==========================================================================
// 19. Tag
// ==========================================================================
import { Tag, tagVariants } from "../tag";

describe("Tag", () => {
  it("renders a span", () => {
    render(<Tag data-testid="tag">Active</Tag>);
    expect(screen.getByTestId("tag").tagName).toBe("SPAN");
    expect(screen.getByTestId("tag")).toHaveTextContent("Active");
  });

  it("applies success variant by default", () => {
    render(<Tag data-testid="tag" />);
    expect(screen.getByTestId("tag").className).toContain("bg-success-container");
  });

  it("applies warning variant", () => {
    render(<Tag data-testid="tag" variant="warning" />);
    expect(screen.getByTestId("tag").className).toContain("bg-warning-container");
  });

  it("applies failed variant", () => {
    render(<Tag data-testid="tag" variant="failed" />);
    expect(screen.getByTestId("tag").className).toContain("bg-error-container");
  });

  it("applies info variant", () => {
    render(<Tag data-testid="tag" variant="info" />);
    expect(screen.getByTestId("tag").className).toContain("bg-blue-200");
  });

  it("applies custom className", () => {
    render(<Tag data-testid="tag" className="custom-tag" />);
    expect(screen.getByTestId("tag").className).toContain("custom-tag");
  });

  it("applies size variants", () => {
    const { rerender } = render(<Tag data-testid="tag" size="sm" />);
    expect(screen.getByTestId("tag").className).toContain("min-w-18");

    rerender(<Tag data-testid="tag" size="lg" />);
    expect(screen.getByTestId("tag").className).toContain("min-w-24");
  });
});

describe("tagVariants", () => {
  it("returns correct classes for success variant", () => {
    const cls = tagVariants({ variant: "success" });
    expect(cls).toContain("bg-success-container");
  });
});

// ==========================================================================
// 20. Textarea
// ==========================================================================
import { Textarea } from "../textarea";

describe("Textarea", () => {
  it("renders a textarea element", () => {
    render(<Textarea data-testid="ta" />);
    expect(screen.getByTestId("ta").tagName).toBe("TEXTAREA");
  });

  it("applies placeholder", () => {
    render(<Textarea data-testid="ta" placeholder="Write here" />);
    expect(screen.getByTestId("ta")).toHaveAttribute("placeholder", "Write here");
  });

  it("applies custom className", () => {
    render(<Textarea data-testid="ta" className="custom-ta" />);
    expect(screen.getByTestId("ta").className).toContain("custom-ta");
  });

  it("handles value changes", () => {
    render(<Textarea data-testid="ta" />);
    const ta = screen.getByTestId("ta") as HTMLTextAreaElement;
    fireEvent.change(ta, { target: { value: "some text" } });
    expect(ta.value).toBe("some text");
  });

  it("can be disabled", () => {
    render(<Textarea data-testid="ta" disabled />);
    expect((screen.getByTestId("ta") as HTMLTextAreaElement).disabled).toBe(true);
  });
});

// ==========================================================================
// 21. Tooltip
// ==========================================================================
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../tooltip";

describe("Tooltip", () => {
  it("renders root", () => {
    render(<Tooltip data-testid="tip" />);
    expect(screen.getByTestId("tip")).toHaveAttribute("data-slot", "tooltip");
  });
});

describe("TooltipProvider", () => {
  it("renders provider", () => {
    render(<TooltipProvider data-testid="tp" />);
    expect(screen.getByTestId("tp")).toHaveAttribute("data-slot", "tooltip-provider");
  });
});

describe("TooltipTrigger", () => {
  it("renders trigger", () => {
    render(<TooltipTrigger data-testid="tt">Hover me</TooltipTrigger>);
    expect(screen.getByTestId("tt")).toHaveAttribute("data-slot", "tooltip-trigger");
  });
});

describe("TooltipContent", () => {
  it("renders content", () => {
    render(
      <Tooltip>
        <TooltipContent data-testid="tc">Tip text</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByTestId("tc")).toHaveAttribute("data-slot", "tooltip-content");
  });

  it("applies custom className", () => {
    render(
      <Tooltip>
        <TooltipContent data-testid="tc" className="tip-extra">X</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByTestId("tc").className).toContain("tip-extra");
  });
});

// ==========================================================================
// 22. Tabs
// ==========================================================================
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../tabs";

describe("Tabs", () => {
  it("renders root div", () => {
    render(<Tabs data-testid="tabs" defaultValue="tab1" />);
    expect(screen.getByTestId("tabs").tagName).toBe("DIV");
  });

  it("applies custom className", () => {
    render(<Tabs data-testid="tabs" defaultValue="tab1" className="custom-tabs" />);
    expect(screen.getByTestId("tabs").className).toContain("custom-tabs");
  });
});

describe("TabsList", () => {
  it("renders a div", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList data-testid="tl" />
      </Tabs>,
    );
    expect(screen.getByTestId("tl").tagName).toBe("DIV");
  });
});

describe("TabsTrigger", () => {
  it("renders a button", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList>
          <TabsTrigger value="t1" data-testid="tt">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId("tt").tagName).toBe("BUTTON");
    expect(screen.getByTestId("tt")).toHaveTextContent("Tab 1");
  });

  it("applies active styles for default variant when active", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList>
          <TabsTrigger value="t1" data-testid="tt">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId("tt").className).toContain("bg-primary");
  });

  it("applies outline variant when active", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList>
          <TabsTrigger value="t1" data-testid="tt" variant="outline">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId("tt").className).toContain("border-primary");
  });

  it("calls onValueChange when clicked", () => {
    const onValueChange = jest.fn();
    render(
      <Tabs defaultValue="t1" onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2" data-testid="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    fireEvent.click(screen.getByTestId("tab2"));
    expect(onValueChange).toHaveBeenCalledWith("t2");
  });

  it("throws if TabsTrigger is used outside Tabs", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsTrigger value="x" />)).toThrow(
      "TabsTrigger must be used within a Tabs component",
    );
    consoleSpy.mockRestore();
  });
});

describe("TabsContent", () => {
  it("renders content for active tab", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsContent value="t1" data-testid="tc">Content 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tc")).toHaveTextContent("Content 1");
  });

  it("does not render content for inactive tab", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsContent value="t2" data-testid="tc">Content 2</TabsContent>
      </Tabs>,
    );
    expect(screen.queryByTestId("tc")).not.toBeInTheDocument();
  });

  it("switches content when tab changes", () => {
    render(
      <Tabs defaultValue="t1">
        <TabsList>
          <TabsTrigger value="t1">Tab 1</TabsTrigger>
          <TabsTrigger value="t2" data-testid="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="t1" data-testid="tc1">First</TabsContent>
        <TabsContent value="t2" data-testid="tc2">Second</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tc1")).toBeInTheDocument();
    expect(screen.queryByTestId("tc2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("tab2"));
    expect(screen.queryByTestId("tc1")).not.toBeInTheDocument();
    expect(screen.getByTestId("tc2")).toBeInTheDocument();
  });

  it("renders content when controlled value changes", () => {
    const { rerender } = render(
      <Tabs value="t1">
        <TabsContent value="t1" data-testid="tc1">First</TabsContent>
        <TabsContent value="t2" data-testid="tc2">Second</TabsContent>
      </Tabs>,
    );
    expect(screen.getByTestId("tc1")).toBeInTheDocument();
    expect(screen.queryByTestId("tc2")).not.toBeInTheDocument();

    rerender(
      <Tabs value="t2">
        <TabsContent value="t1" data-testid="tc1">First</TabsContent>
        <TabsContent value="t2" data-testid="tc2">Second</TabsContent>
      </Tabs>,
    );
    expect(screen.queryByTestId("tc1")).not.toBeInTheDocument();
    expect(screen.getByTestId("tc2")).toBeInTheDocument();
  });

  it("throws if TabsContent is used outside Tabs", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TabsContent value="x" />)).toThrow(
      "TabsContent must be used within a Tabs component",
    );
    consoleSpy.mockRestore();
  });
});
