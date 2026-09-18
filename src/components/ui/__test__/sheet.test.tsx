import { render, screen } from "@testing-library/react";

jest.mock("@base-ui/react/dialog", () => ({
  Dialog: {
    Root: ({ children, ...props }: any) => <div data-slot="sheet" {...props}>{children}</div>,
    Trigger: ({ children, render: renderProp, ...props }: any) => (
      <div data-slot="sheet-trigger" {...props}>{renderProp ?? children}</div>
    ),
    Close: ({ children, render: renderProp, ...props }: any) => (
      <button data-slot="sheet-close" {...props}>{renderProp ?? children}</button>
    ),
    Portal: ({ children }: any) => <div>{children}</div>,
    Backdrop: ({ ...props }: any) => <div data-slot="sheet-overlay" {...props} />,
    Popup: ({ children, ...props }: any) => <div data-slot="sheet-content" {...props}>{children}</div>,
    Title: ({ children, ...props }: any) => <h2 data-slot="sheet-title" {...props}>{children}</h2>,
    Description: ({ children, ...props }: any) => <p data-slot="sheet-description" {...props}>{children}</p>,
  },
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, render: renderProp, ...props }: any) => <button {...props}>{renderProp ?? children}</button>,
}));

jest.mock("@phosphor-icons/react", () => ({
  XIcon: () => null,
}));

import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "../sheet";

describe("Sheet", () => {
  it("renders Sheet root with children", () => {
    render(<Sheet>Content</Sheet>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders SheetContent", () => {
    render(<SheetContent>Content</SheetContent>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders SheetHeader", () => {
    render(<SheetHeader>Header</SheetHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });

  it("renders SheetFooter", () => {
    render(<SheetFooter>Footer</SheetFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders SheetTitle", () => {
    render(<SheetTitle>Title</SheetTitle>);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders SheetDescription", () => {
    render(<SheetDescription>Description</SheetDescription>);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders SheetClose", () => {
    render(<SheetClose>Close</SheetClose>);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("renders SheetTrigger", () => {
    render(
      <SheetTrigger render={<button>Open</button>}>Fallback</SheetTrigger>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders with correct data-slot attributes", () => {
    render(
      <Sheet>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>T</SheetTitle>
            <SheetDescription>D</SheetDescription>
          </SheetHeader>
          <SheetFooter>F</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(document.querySelector("[data-slot='sheet']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='sheet-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='sheet-title']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='sheet-description']")).toBeInTheDocument();
  });
});
