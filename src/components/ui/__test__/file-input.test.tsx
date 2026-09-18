import { render, screen, fireEvent, act } from "@testing-library/react";

jest.mock("@phosphor-icons/react", () => ({
  EyeIcon: () => null,
  FileIcon: () => null,
  PencilIcon: () => null,
  SpinnerGapIcon: () => null,
  UploadSimpleIcon: () => null,
}));

jest.mock("@/components/ui/lightbox", () => ({
  PhotoLightbox: ({ open, onClose }: any) =>
    open ? (
      <div data-testid="photo-lightbox">
        <button data-testid="close-lightbox" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

import { FileInput } from "../file-input";

describe("FileInput", () => {
  it("renders empty state with placeholder", () => {
    render(<FileInput placeholder="Upload file" />);
    expect(screen.getByText("Upload file")).toBeInTheDocument();
  });

  it("renders default placeholder", () => {
    render(<FileInput />);
    expect(screen.getByText("Klik di sini untuk mengunggah file")).toBeInTheDocument();
  });

  it("renders loading state", () => {
    render(<FileInput loading />);
    expect(screen.getByText("Mengunggah file...")).toBeInTheDocument();
  });

  it("renders file selected state with file name", () => {
    const file = new File(["content"], "test-doc.pdf", { type: "application/pdf" });
    render(<FileInput value={file} />);
    expect(screen.getByText("test-doc.pdf")).toBeInTheDocument();
  });

  it("truncates long file names", () => {
    const longName = "a".repeat(30) + ".pdf";
    const file = new File(["content"], longName, { type: "application/pdf" });
    render(<FileInput value={file} />);
    expect(screen.getByText("a".repeat(20) + "...")).toBeInTheDocument();
  });

  it("renders filename from string URL value", () => {
    render(<FileInput value="https://example.com/files/siup-doc.pdf" />);
    expect(screen.getByText("siup-doc.pdf")).toBeInTheDocument();
  });

  it("falls back to unknown when value has no name", () => {
    render(<FileInput value={{ foo: "bar" } as any} />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("renders view button when file is selected", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    render(<FileInput value={file} />);
    expect(screen.getByLabelText("Lihat file")).toBeInTheDocument();
  });

  it("renders edit button when file is selected", () => {
    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    render(<FileInput value={file} />);
    expect(screen.getByLabelText("Ganti file")).toBeInTheDocument();
  });

  it("calls onChange when file is uploaded", () => {
    const onChange = jest.fn();
    render(<FileInput onChange={onChange} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["data"], "new.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onChange).toHaveBeenCalledWith(file);
  });

  it("is disabled when disabled prop is true", () => {
    render(<FileInput disabled placeholder="Upload" />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("is disabled when loading", () => {
    render(<FileInput loading />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("opens PhotoLightbox when viewing file without onView override", async () => {
    const file = new File(["content"], "test.png", { type: "image/png" });
    render(<FileInput value={file} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Lihat file"));
    });

    expect(screen.getByTestId("photo-lightbox")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("close-lightbox"));
    expect(screen.queryByTestId("photo-lightbox")).not.toBeInTheDocument();
  });

  it("calls custom onView override when provided", async () => {
    const file = new File(["content"], "test.png", { type: "image/png" });
    const onView = jest.fn();
    render(<FileInput value={file} onView={onView} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Lihat file"));
    });

    expect(onView).toHaveBeenCalledWith(file);
    expect(screen.queryByTestId("photo-lightbox")).not.toBeInTheDocument();
  });

  it("resolves file via onResolveView before opening PhotoLightbox", async () => {
    const file = "https://example.com/doc.pdf";
    const resolvedBlob = new Blob(["blob content"], { type: "application/pdf" });
    const onResolveView = jest.fn().mockResolvedValue(resolvedBlob);

    render(<FileInput value={file} onResolveView={onResolveView} />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Lihat file"));
    });

    expect(onResolveView).toHaveBeenCalledWith(file);
    expect(screen.getByTestId("photo-lightbox")).toBeInTheDocument();
  });
});
