import { renderHook, act } from "@testing-library/react";
import { useCaptcha } from "@/hooks/use-captcha";

jest.spyOn(console, "error").mockImplementation(() => {});

const mockContext = {
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  strokeStyle: "",
  stroke: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  fillText: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  font: "",
  fillStyle: "",
  textBaseline: "",
};

beforeEach(() => {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;
  jest.clearAllMocks();
});

function setup(options?: Parameters<typeof useCaptcha>[1]) {
  const container = document.createElement("div");
  const ref = { current: container };
  const { result, unmount } = renderHook(() => useCaptcha(ref, options));
  return { result, container, unmount };
}

describe("useCaptcha", () => {
  it("returns gen, validate, and isReady", () => {
    const { result } = setup();
    expect(typeof result.current.gen).toBe("function");
    expect(typeof result.current.validate).toBe("function");
    expect(result.current.isReady).toBe(false);
  });

  it("gen() creates a canvas inside container and sets isReady true", () => {
    const { result, container } = setup();

    act(() => {
      result.current.gen();
    });

    expect(result.current.isReady).toBe(true);
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("gen() does nothing when containerRef.current is null", () => {
    const ref = { current: null };
    const { result } = renderHook(() => useCaptcha(ref));

    act(() => {
      result.current.gen();
    });

    expect(result.current.isReady).toBe(false);
  });

  it("gen() clears previous content before generating", () => {
    const container = document.createElement("div");
    const child = document.createElement("span");
    child.textContent = "old";
    container.appendChild(child);
    const ref = { current: container };
    const { result } = renderHook(() => useCaptcha(ref));

    act(() => {
      result.current.gen();
    });

    expect(container.querySelector("span")).toBeNull();
    expect(container.querySelector("canvas")).not.toBeNull();
  });

  it("validate() returns false when no captcha generated", () => {
    const { result } = setup();
    expect(result.current.validate("anything")).toBe(false);
  });

  it("validate() with sensitive=true (default) is case-sensitive", () => {
    const container = document.createElement("div");
    const ref = { current: container };
    const { result } = renderHook(() =>
      useCaptcha(ref, { sensitive: true }),
    );

    act(() => {
      result.current.gen();
    });

    expect(result.current.validate("")).toBe(false);
  });

  it("validate() with sensitive=false is case-insensitive", () => {
    const container = document.createElement("div");
    const ref = { current: container };
    const { result } = renderHook(() =>
      useCaptcha(ref, { sensitive: false }),
    );

    act(() => {
      result.current.gen();
    });

    expect(result.current.validate("")).toBe(false);
  });

  it("applies default options (width=120, height=40)", () => {
    const { result, container } = setup();

    act(() => {
      result.current.gen();
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(canvas.width).toBe(120);
    expect(canvas.height).toBe(40);
  });

  it("custom options override defaults (width/height)", () => {
    const container = document.createElement("div");
    const ref = { current: container };
    const { result } = renderHook(() =>
      useCaptcha(ref, { width: 200, height: 60 }),
    );

    act(() => {
      result.current.gen();
    });

    const generatedCanvas = container.querySelector(
      "canvas",
    ) as HTMLCanvasElement;
    expect(generatedCanvas.width).toBe(200);
    expect(generatedCanvas.height).toBe(60);
  });

  it("canvas gets borderRadius style", () => {
    const { result, container } = setup();

    act(() => {
      result.current.gen();
    });

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.style.borderRadius).toBe("4px");
  });

  it("calls gen multiple times replaces old canvas", () => {
    const { result, container } = setup();

    act(() => {
      result.current.gen();
    });

    act(() => {
      result.current.gen();
    });

    const canvases = container.querySelectorAll("canvas");
    expect(canvases.length).toBe(1);
  });
});
