import { render, screen, fireEvent, waitFor } from "@testing-library/react";

jest.mock("@phosphor-icons/react", () => ({
  CaretDownIcon: () => null,
  CheckIcon: () => null,
  SpinnerGapIcon: () => null,
}));

import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "../combobox";

function renderCombobox(
  overrides: {
    items?: { label: string; value: string }[];
    value?: string | null;
    onValueChange?: jest.Mock;
    disabled?: boolean;
    isLoading?: boolean;
  } = {},
) {
  const items = overrides.items ?? [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];
  const onValueChange = overrides.onValueChange ?? jest.fn();

  return render(
    <Combobox
      items={items}
      value={overrides.value ?? null}
      onValueChange={onValueChange}
      disabled={overrides.disabled}
      isLoading={overrides.isLoading}
    >
      <ComboboxInput id="fruit" placeholder="Select fruit" />
      <ComboboxContent>
        <ComboboxList>
          {items.map((item) => (
            <ComboboxItem key={item.value} value={item.value}>
              {item.label}
            </ComboboxItem>
          ))}
          <ComboboxEmpty />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>,
  );
}

describe("Combobox", () => {
  it("renders input with placeholder", () => {
    renderCombobox();
    expect(screen.getByPlaceholderText("Select fruit")).toBeInTheDocument();
  });

  it("shows selected label in input", () => {
    renderCombobox({ value: "apple" });
    expect(screen.getByDisplayValue("Apple")).toBeInTheDocument();
  });

  it("opens dropdown on input focus", () => {
    renderCombobox();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("calls onValueChange when item is clicked", () => {
    const onValueChange = jest.fn();
    renderCombobox({ onValueChange });
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Banana"));
    expect(onValueChange).toHaveBeenCalledWith("banana");
  });

  it("disables input when disabled", () => {
    renderCombobox({ disabled: true });
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("clears selection when clear button is clicked", () => {
    const onValueChange = jest.fn();
    renderCombobox({ value: "apple", onValueChange });
    const clearBtn = screen.getByRole("combobox").parentElement!.querySelector("button");
    fireEvent.click(clearBtn!);
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("closes dropdown on Escape key", () => {
    renderCombobox();
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByText("Apple")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders hidden input with name", () => {
    render(
      <Combobox items={[{ label: "A", value: "a" }]} value="a">
        <ComboboxInput id="test" name="test-field" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="a">A</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.name).toBe("test-field");
  });

  it("shows empty state when no items match search", async () => {
    renderCombobox();
    fireEvent.focus(screen.getByRole("combobox"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "xyz" } });
    await waitFor(() => {
      expect(screen.getByText(/Tidak ada hasil/)).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
