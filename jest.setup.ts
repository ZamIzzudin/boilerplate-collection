/** @format */

import "@testing-library/jest-dom";

// Polyfill TextEncoder and TextDecoder
if (!globalThis.TextEncoder) {
  const { TextEncoder: NodeTextEncoder } = require("node:util");
  globalThis.TextEncoder = NodeTextEncoder;
}

if (!globalThis.TextDecoder) {
  const { TextDecoder: NodeTextDecoder } = require("node:util");
  globalThis.TextDecoder = NodeTextDecoder;
}

// Polyfill for HTMLFormElement.prototype.requestSubmit (not implemented in jsdom)
if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function (submitter?: HTMLElement) {
    if (submitter) {
      if (!(submitter instanceof HTMLElement)) {
        throw new TypeError("The submitter must be an HTMLElement");
      }
      const submitElement = submitter as HTMLButtonElement | HTMLInputElement;
      if (submitElement.type !== "submit") {
        throw new TypeError("The submitter must be a submit button");
      }
      if ((submitElement as HTMLButtonElement).form !== this) {
        throw new DOMException(
          "The submitter is not associated with this form",
          "NotFoundError",
        );
      }
    }
    const event = new Event("submit", { bubbles: true, cancelable: true });
    this.dispatchEvent(event);
  };
}

globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any;

// jsdom has no EventSource implementation; provide a passive stub so
// components that open permission-event streams can render in tests.
// Tests that exercise the stream replace this with their own mock.
if (typeof globalThis.EventSource === "undefined") {
  class EventSourceStub {
    static readonly CONNECTING = 0;
    static readonly OPEN = 1;
    static readonly CLOSED = 2;

    readonly url: string;
    readonly withCredentials: boolean;
    readyState = 0;
    onopen: (() => void) | null = null;
    onerror: (() => void) | null = null;

    constructor(url: string, options?: EventSourceInit) {
      this.url = url;
      this.withCredentials = options?.withCredentials ?? false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addEventListener(_type: string): void {}

    close(): void {
      this.readyState = EventSourceStub.CLOSED;
    }
  }

  globalThis.EventSource = EventSourceStub as unknown as typeof EventSource;
}

// Polyfill MessageChannel (dibutuhkan beberapa library UI)
if (!globalThis.MessageChannel) {
  class MessageChannel {
    port1: any;
    port2: any;
    constructor() {
      this.port1 = {
        onmessage: null,
        postMessage: (_data: any) => {
          if (this.port2.onmessage) {
            setTimeout(() => this.port2.onmessage({ data: _data }), 0);
          }
        },
        close: () => {},
        start: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
      this.port2 = {
        onmessage: null,
        postMessage: (_data: any) => {
          if (this.port1.onmessage) {
            setTimeout(() => this.port1.onmessage({ data: _data }), 0);
          }
        },
        close: () => {},
        start: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    }
  }
  (globalThis as any).MessageChannel = MessageChannel;
}

Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill object URL helpers (tidak diimplementasikan di jsdom)
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = jest.fn(() => "blob:mock-url") as any;
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = jest.fn() as any;
}

globalThis.FormData ??= class FormData {
  readonly data: Map<string, any>;

  constructor() {
    this.data = new Map();
  }

  append(key: string, value: any) {
    this.data.set(key, value);
  }

  get(key: string) {
    return this.data.get(key);
  }

  has(key: string) {
    return this.data.has(key);
  }

  delete(key: string) {
    this.data.delete(key);
  }

  entries() {
    return this.data.entries();
  }
} as any;

// Reduksi noise log di console saat test berjalan
globalThis.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock import.meta.env for tests
if (globalThis.import) {
  globalThis.import.meta = {
    env: {
      VITE_API_BASE_URL: "http://localhost:4000/",
      VITE_API_BASE_URL_NEW: "/api",
      VITE_SESSION_COOKIE_NAME: "test_session",
      DEV: true,
    },
  } as any;
} else {
  globalThis.import = {
    meta: {
      env: {
        VITE_API_BASE_URL: "http://localhost:4000/",
        VITE_API_BASE_URL_NEW: "/api",
        VITE_SESSION_COOKIE_NAME: "test_session",
        DEV: true,
      },
    },
  } as any;
}
