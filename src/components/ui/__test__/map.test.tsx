jest.mock("maplibre-gl", () => ({
  __esModule: true,
  default: {
    Map: jest.fn().mockImplementation(() => ({
      on: jest.fn(),
      off: jest.fn(),
      remove: jest.fn(),
      getCenter: jest.fn().mockReturnValue({ lng: 0, lat: 0 }),
      getZoom: jest.fn().mockReturnValue(4),
      getBearing: jest.fn().mockReturnValue(0),
      getPitch: jest.fn().mockReturnValue(0),
      isMoving: jest.fn().mockReturnValue(false),
      getContainer: jest.fn().mockReturnValue({
        querySelector: jest.fn(),
        requestFullscreen: jest.fn(),
      }),
      setStyle: jest.fn(),
      jumpTo: jest.fn(),
      flyTo: jest.fn(),
      zoomTo: jest.fn(),
      resetNorthPitch: jest.fn(),
      getCanvas: jest.fn().mockReturnValue({ style: { cursor: "" } }),
    })),
    Marker: jest.fn().mockImplementation(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      setPopup: jest.fn().mockReturnThis(),
      setDraggable: jest.fn().mockReturnThis(),
      setOffset: jest.fn().mockReturnThis(),
      setRotation: jest.fn().mockReturnThis(),
      setRotationAlignment: jest.fn().mockReturnThis(),
      setPitchAlignment: jest.fn().mockReturnThis(),
      getLngLat: jest.fn().mockReturnValue({ lng: 0, lat: 0 }),
      getOffset: jest.fn().mockReturnValue({ x: 0, y: 0 }),
      getRotation: jest.fn().mockReturnValue(0),
      getRotationAlignment: jest.fn().mockReturnValue("auto"),
      getPitchAlignment: jest.fn().mockReturnValue("auto"),
      isDraggable: jest.fn().mockReturnValue(false),
      getElement: jest.fn().mockReturnValue(document.createElement("div")),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      on: jest.fn(),
    })),
    Popup: jest.fn().mockImplementation(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      setDOMContent: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
      setMaxWidth: jest.fn().mockReturnThis(),
      setOffset: jest.fn().mockReturnThis(),
      isOpen: jest.fn().mockReturnValue(false),
      on: jest.fn(),
      off: jest.fn(),
      getLngLat: jest.fn().mockReturnValue({ lng: 0, lat: 0 }),
    })),
    NavigationControl: jest.fn(),
  },
}));

jest.mock("@/lib/utils", () => ({
  cn: jest.fn((...args) => args.filter(Boolean).join(" ")),
}));

import { render, screen } from "@testing-library/react";
import { MapContainer, MapControls } from "../map";

function renderMap() {
  return render(
    <MapContainer center={[118, -2.5]} zoom={4}>
      <MapControls showZoom showFullscreen position="bottom-right" />
    </MapContainer>,
  );
}

describe("Map components", () => {
  it("renders MapContainer", () => {
    renderMap();
    expect(screen.getByRole("button", { name: /zoom in/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /zoom out/i })).toBeInTheDocument();
  });

  it("renders fullscreen button when showFullscreen", () => {
    renderMap();
    expect(screen.getByRole("button", { name: /toggle fullscreen/i })).toBeInTheDocument();
  });

  it("renders without zoom controls when showZoom is false", () => {
    render(
      <MapContainer center={[118, -2.5]} zoom={4}>
        <MapControls position="top-left" showZoom={false} />
      </MapContainer>,
    );
    expect(screen.queryByRole("button", { name: /zoom in/i })).not.toBeInTheDocument();
  });
});
