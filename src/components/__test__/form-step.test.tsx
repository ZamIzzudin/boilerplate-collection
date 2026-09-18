import { render, screen, act, waitFor } from "@testing-library/react";
import { FormStep } from "../form-step";

jest.mock("@phosphor-icons/react", () => ({
  CheckIcon: () => <span data-testid="check-icon" />,
  HourglassIcon: () => <span data-testid="hourglass-icon" />,
}));

describe("FormStep", () => {
  const labels = ["Step 1", "Step 2", "Step 3"];

  it("renders all step labels", () => {
    render(<FormStep labels={labels} currentStep={1} />);
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });

  it("marks current step with hourglass icon", () => {
    render(<FormStep labels={labels} currentStep={1} />);
    const step1 = screen.getByText("Step 1").closest(".flex-1")!;
    expect(step1.querySelector("[data-testid='hourglass-icon']")).toBeInTheDocument();
  });

  it("marks completed step with check icon", () => {
    render(<FormStep labels={labels} currentStep={2} />);
    const step1 = screen.getByText("Step 1").closest(".flex-1")!;
    expect(step1.querySelector("[data-testid='check-icon']")).toBeInTheDocument();
  });

  it("applies bold styling when bold is true", () => {
    render(<FormStep labels={labels} currentStep={1} bold />);
    const step1 = screen.getByText("Step 1");
    expect(step1.className).toContain("font-semibold");
  });

  it("does not apply bold styling by default", () => {
    render(<FormStep labels={labels} currentStep={1} />);
    const step1 = screen.getByText("Step 1");
    expect(step1.className).toContain("font-normal");
  });

  it("handles maxVisible with more labels than max", async () => {
    const manyLabels = ["S1", "S2", "S3", "S4", "S5", "S6"];
    render(<FormStep labels={manyLabels} currentStep={3} maxVisible={3} />);
    // start = 3 - floor(3/2) = 2, visible = labels[2..5] = S3, S4, S5
    await waitFor(() => {
      expect(screen.getByText("S3")).toBeInTheDocument();
    });
    expect(screen.getByText("S4")).toBeInTheDocument();
    expect(screen.getByText("S5")).toBeInTheDocument();
    expect(screen.queryByText("S1")).not.toBeInTheDocument();
    expect(screen.queryByText("S2")).not.toBeInTheDocument();
    expect(screen.queryByText("S6")).not.toBeInTheDocument();
  });
});
