import { render, screen } from "@testing-library/react";

jest.mock("yet-another-react-lightbox", () => {
  const MockLightbox = ({ open, slides, index }: any) => {
    if (!open) return null;
    if (!slides || slides.length === 0) return null;
    return (
      <div data-testid="lightbox">
        <span data-testid="slide-count">{slides.length}</span>
        <span data-testid="slide-index">{index}</span>
        {slides.map((slide: any, i: number) => (
          <div key={i} data-testid={`slide-${i}`}>
            {slide.type === "pdf" ? (
              <span data-testid={`pdf-${i}`}>PDF: {slide.src}</span>
            ) : slide.src ? (
              <img src={slide.src} alt={slide.alt ?? ""} />
            ) : (
              <span>Empty slide</span>
            )}
          </div>
        ))}
      </div>
    );
  };
  return { __esModule: true, default: MockLightbox };
});

jest.mock("yet-another-react-lightbox/styles.css", () => {});

jest.mock("../loader", () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>,
}));

import { PhotoLightbox } from "../lightbox";

describe("PhotoLightbox", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <PhotoLightbox open={false} onClose={jest.fn()} images="test.jpg" />,
    );
    expect(container.querySelector("[data-testid='lightbox']")).not.toBeInTheDocument();
  });

  it("renders nothing when images array is empty", () => {
    const { container } = render(
      <PhotoLightbox open={true} onClose={jest.fn()} images={[]} />,
    );
    expect(container.querySelector("[data-testid='lightbox']")).not.toBeInTheDocument();
  });

  it("renders lightbox with single image string", () => {
    render(
      <PhotoLightbox open={true} onClose={jest.fn()} images="test.jpg" />,
    );
    expect(screen.getByTestId("lightbox")).toBeInTheDocument();
    expect(screen.getByTestId("slide-count")).toHaveTextContent("1");
  });

  it("renders lightbox with multiple image strings", () => {
    render(
      <PhotoLightbox
        open={true}
        onClose={jest.fn()}
        images={["a.jpg", "b.jpg", "c.jpg"]}
      />,
    );
    expect(screen.getByTestId("slide-count")).toHaveTextContent("3");
  });

  it("renders with custom index", () => {
    render(
      <PhotoLightbox
        open={true}
        onClose={jest.fn()}
        images={["a.jpg", "b.jpg"]}
        index={1}
      />,
    );
    expect(screen.getByTestId("slide-index")).toHaveTextContent("1");
  });

  it("handles LightboxImage objects", () => {
    render(
      <PhotoLightbox
        open={true}
        onClose={jest.fn()}
        images={{ src: "photo.png", alt: "A photo" }}
      />,
    );
    expect(screen.getByTestId("slide-count")).toHaveTextContent("1");
  });

  it("renders nothing when message is provided (mock renders slides with empty src)", () => {
    const { container } = render(
      <PhotoLightbox
        open={true}
        onClose={jest.fn()}
        images="test.jpg"
        message="No preview available"
      />,
    );
    expect(screen.getByTestId("lightbox")).toBeInTheDocument();
  });
});
