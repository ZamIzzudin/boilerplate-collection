import { render, screen } from "@testing-library/react";

jest.mock("@phosphor-icons/react", () => ({
  CaretRightIcon: () => null,
  CheckIcon: () => null,
}));

jest.mock("@base-ui/react/menu", () => ({
  Menu: {
    Root: ({ children, ...props }: any) => <div data-slot="dropdown-menu" {...props}>{children}</div>,
    Portal: ({ children }: any) => <div>{children}</div>,
    Trigger: ({ children, ...props }: any) => <div data-slot="dropdown-menu-trigger" {...props}>{children}</div>,
    Positioner: ({ children }: any) => <div>{children}</div>,
    Popup: ({ children, ...props }: any) => <div data-slot="dropdown-menu-content" {...props}>{children}</div>,
    Group: ({ children, ...props }: any) => <div data-slot="dropdown-menu-group" {...props}>{children}</div>,
    GroupLabel: ({ children, ...props }: any) => <div data-slot="dropdown-menu-label" {...props}>{children}</div>,
    Item: ({ children, ...props }: any) => <div data-slot="dropdown-menu-item" {...props}>{children}</div>,
    CheckboxItem: ({ children, ...props }: any) => <div data-slot="dropdown-menu-checkbox-item" {...props}>{children}</div>,
    CheckboxItemIndicator: ({ children }: any) => <span>{children}</span>,
    RadioGroup: ({ children, ...props }: any) => <div data-slot="dropdown-menu-radio-group" {...props}>{children}</div>,
    RadioItem: ({ children, ...props }: any) => <div data-slot="dropdown-menu-radio-item" {...props}>{children}</div>,
    RadioItemIndicator: ({ children }: any) => <span>{children}</span>,
    Separator: ({ ...props }: any) => <hr data-slot="dropdown-menu-separator" {...props} />,
    SubmenuRoot: ({ children, ...props }: any) => <div data-slot="dropdown-menu-sub" {...props}>{children}</div>,
    SubmenuTrigger: ({ children, ...props }: any) => <div data-slot="dropdown-menu-sub-trigger" {...props}>{children}</div>,
  },
}));

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "../dropdown-menu";

describe("DropdownMenu", () => {
  it("renders DropdownMenu root", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<button />}>Open</DropdownMenuTrigger>
      </DropdownMenu>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders DropdownMenuContent", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Item 1")).toBeInTheDocument();
  });

  it("renders DropdownMenuGroup with label", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders DropdownMenuSeparator", () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(container.querySelector("[data-slot='dropdown-menu-separator']")).toBeInTheDocument();
  });

  it("renders DropdownMenuCheckboxItem", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show toolbar</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Show toolbar")).toBeInTheDocument();
  });

  it("renders DropdownMenuRadioGroup with items", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="a">
            <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Option A")).toBeInTheDocument();
    expect(screen.getByText("Option B")).toBeInTheDocument();
  });

  it("renders DropdownMenuSub with trigger and content", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("More")).toBeInTheDocument();
  });

  it("all sub-components render with data-slot attributes", () => {
    render(
      <DropdownMenu>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(document.querySelector("[data-slot='dropdown-menu']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='dropdown-menu-content']")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='dropdown-menu-item']")).toBeInTheDocument();
  });
});
