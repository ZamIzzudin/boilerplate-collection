import { act, renderHook } from "@testing-library/react";
import { usePermissionEvents } from "@/hooks/use-permission-events";
import { useAuthStore } from "@/store/auth-store";

const refreshPrivilegesMock = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/axios/client", () => ({
  refreshPrivilegesIfVersionChanged: (...args: unknown[]) =>
    refreshPrivilegesMock(...args),
}));

jest.mock("@/lib/config", () => ({
  ApiEndpoint: { GENESIS: "genesis", NEW: "new" },
  resolveApiBaseUrl: () => "http://localhost:4000/",
}));

type MockListener = (event: { data?: string }) => void;

class MockEventSource {
  static instances: MockEventSource[] = [];
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSED = 2;

  readonly url: string;
  readonly withCredentials: boolean;
  readyState = 0;
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private readonly listeners = new Map<string, MockListener[]>();

  constructor(url: string, options?: EventSourceInit) {
    this.url = url;
    this.withCredentials = options?.withCredentials ?? false;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: MockListener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close(): void {
    this.readyState = MockEventSource.CLOSED;
  }

  simulateOpen(): void {
    this.readyState = MockEventSource.OPEN;
    this.onopen?.();
  }

  simulateError(): void {
    this.onerror?.();
  }

  emit(type: string, data: string): void {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ data });
    }
  }
}

const originalEventSource = globalThis.EventSource;

beforeAll(() => {
  globalThis.EventSource = MockEventSource as unknown as typeof EventSource;
});

afterAll(() => {
  globalThis.EventSource = originalEventSource;
});

describe("usePermissionEvents", () => {
  beforeEach(() => {
    MockEventSource.instances = [];
    refreshPrivilegesMock.mockClear();
    useAuthStore.setState({ isAuthenticated: false });
  });

  it("does not open a stream while unauthenticated", () => {
    renderHook(() => usePermissionEvents());
    expect(MockEventSource.instances).toHaveLength(0);
  });

  it("opens a credentialed stream to /auth/events while authenticated", () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePermissionEvents());

    expect(MockEventSource.instances).toHaveLength(1);
    expect(MockEventSource.instances[0].url).toBe(
      "http://localhost:4000/auth/events",
    );
    expect(MockEventSource.instances[0].withCredentials).toBe(true);
  });

  it("refreshes privileges when a new version is pushed", () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePermissionEvents());

    MockEventSource.instances[0].emit("perm-version", "1780000000000");

    expect(refreshPrivilegesMock).toHaveBeenCalledTimes(1);
    expect(refreshPrivilegesMock).toHaveBeenCalledWith(
      "1780000000000",
      "new",
    );
  });

  it("reconnects with backoff after a fatal error and resets on open", () => {
    jest.useFakeTimers();
    useAuthStore.setState({ isAuthenticated: true });

    const { unmount } = renderHook(() => usePermissionEvents());
    const first = MockEventSource.instances[0];

    first.simulateError();
    expect(first.readyState).toBe(MockEventSource.CLOSED);
    expect(MockEventSource.instances).toHaveLength(1);

    // first retry after 5s
    jest.advanceTimersByTime(5_000);
    expect(MockEventSource.instances).toHaveLength(2);

    // successful open resets the backoff
    MockEventSource.instances[1].simulateOpen();
    MockEventSource.instances[1].simulateError();
    jest.advanceTimersByTime(5_000);
    expect(MockEventSource.instances).toHaveLength(3);

    unmount();
    jest.useRealTimers();
  });

  it("does not reconnect before the backoff delay elapses", () => {
    jest.useFakeTimers();
    useAuthStore.setState({ isAuthenticated: true });

    const { unmount } = renderHook(() => usePermissionEvents());

    MockEventSource.instances[0].simulateError();
    jest.advanceTimersByTime(4_999);
    expect(MockEventSource.instances).toHaveLength(1);

    jest.advanceTimersByTime(1);
    expect(MockEventSource.instances).toHaveLength(2);

    unmount();
    jest.useRealTimers();
  });

  it("closes the stream on unmount", () => {
    useAuthStore.setState({ isAuthenticated: true });

    const { unmount } = renderHook(() => usePermissionEvents());
    const stream = MockEventSource.instances[0];

    unmount();

    expect(stream.readyState).toBe(MockEventSource.CLOSED);
  });

  it("closes the stream and stops reconnecting after logout", () => {
    jest.useFakeTimers();
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePermissionEvents());
    MockEventSource.instances[0].simulateError();
    jest.advanceTimersByTime(5_000);
    expect(MockEventSource.instances).toHaveLength(2);

    act(() => {
      useAuthStore.setState({ isAuthenticated: false });
    });

    expect(MockEventSource.instances[1].readyState).toBe(
      MockEventSource.CLOSED,
    );

    jest.advanceTimersByTime(120_000);
    expect(MockEventSource.instances).toHaveLength(2);

    jest.useRealTimers();
  });
});
