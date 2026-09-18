import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TableRowActionMenu } from "../table-row-action-menu";

jest.mock("@phosphor-icons/react", () => ({
  CheckCircleIcon: () => null,
  PencilSimpleLineIcon: () => null,
  TrashIcon: () => null,
  PowerIcon: () => null,
  FileIcon: () => null,
  DownloadSimpleIcon: () => <svg data-testid="download-icon" />,
  SpinnerGapIcon: () => <svg data-testid="spinner-icon" />,
}));

jest.mock("@/components/confirm-action-button", () => ({
  ConfirmActionButton: ({ triggerRender, title, description }: any) => (
    <div data-testid="confirm-action">
      <span data-testid="confirm-title">{title}</span>
      <span data-testid="confirm-desc">{description}</span>
      {triggerRender}
    </div>
  ),
}));

function renderMenu(items: any[]) {
  return render(
    <MemoryRouter>
      <TableRowActionMenu items={items} />
    </MemoryRouter>,
  );
}

describe("TableRowActionMenu", () => {
  it("renders action buttons", () => {
    renderMenu([
      { label: "Edit", onClick: jest.fn() },
      { label: "Delete", onClick: jest.fn() },
    ]);
    expect(screen.getByLabelText("Edit")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete")).toBeInTheDocument();
  });

  it("renders empty span when items is empty", () => {
    const { container } = renderMenu([]);
    expect(container.querySelector("span")).toBeInTheDocument();
  });

  it("shows confirm dialog for destructive items", () => {
    renderMenu([
      {
        label: "Hapus",
        onClick: jest.fn(),
        destructive: true,
        confirmMessage: "Yakin hapus?",
      },
    ]);
    expect(screen.getByTestId("confirm-action")).toBeInTheDocument();
    expect(screen.getByTestId("confirm-desc")).toHaveTextContent("Yakin hapus?");
  });

  it("calls onClick for non-confirm items", () => {
    const onClick = jest.fn();
    renderMenu([{ label: "Edit", onClick }]);
    fireEvent.click(screen.getByLabelText("Edit"));
    expect(onClick).toHaveBeenCalled();
  });

  it("disables button when disabled is true", () => {
    renderMenu([{ label: "Download", onClick: jest.fn(), disabled: true }]);
    expect(screen.getByLabelText("Download")).toBeDisabled();
  });

  it("enables button when disabled is false", () => {
    renderMenu([{ label: "Download", onClick: jest.fn(), disabled: false }]);
    expect(screen.getByLabelText("Download")).toBeEnabled();
  });

  it("enables button when disabled is omitted", () => {
    renderMenu([{ label: "Download", onClick: jest.fn() }]);
    expect(screen.getByLabelText("Download")).toBeEnabled();
  });

  it("disables and shows spinner when loading is true", () => {
    renderMenu([{ label: "Download", onClick: jest.fn(), loading: true }]);
    expect(screen.getByLabelText("Download")).toBeDisabled();
    expect(screen.getByTestId("spinner-icon")).toBeInTheDocument();
  });

  it("shows download icon when loading is false", () => {
    renderMenu([{ label: "Download", onClick: jest.fn(), loading: false }]);
    expect(screen.getByLabelText("Download")).toBeEnabled();
    expect(screen.getByTestId("download-icon")).toBeInTheDocument();
  });

  it("disables confirm-action trigger when loading is true", () => {
    renderMenu([
      {
        label: "Download",
        onClick: jest.fn(),
        loading: true,
        confirmMessage: "Yakin?",
      },
    ]);
    expect(screen.getByLabelText("Download")).toBeDisabled();
  });

  it("uses custom confirmTitle when provided", () => {
    renderMenu([
      {
        label: "Delete",
        onClick: jest.fn(),
        confirmMessage: "Sure?",
        confirmTitle: "Custom Title",
      },
    ]);
    expect(screen.getByTestId("confirm-title")).toHaveTextContent("Custom Title");
  });

  it("uses Warning as default title for destructive items", () => {
    renderMenu([
      {
        label: "Hapus",
        onClick: jest.fn(),
        destructive: true,
        confirmMessage: "Sure?",
      },
    ]);
    expect(screen.getByTestId("confirm-title")).toHaveTextContent("Warning");
  });

  it("disables confirm-action trigger when disabled is true", () => {
    renderMenu([
      {
        label: "Download",
        onClick: jest.fn(),
        disabled: true,
        confirmMessage: "Yakin?",
      },
    ]);
    expect(screen.getByLabelText("Download")).toBeDisabled();
  });

  it("enables confirm-action trigger when disabled is false", () => {
    renderMenu([
      {
        label: "Download",
        onClick: jest.fn(),
        disabled: false,
        confirmMessage: "Yakin?",
      },
    ]);
    expect(screen.getByLabelText("Download")).toBeEnabled();
  });
});
