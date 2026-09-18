import axios, { type AxiosError } from "axios";
import {
  createApiClient,
  createApiNewClient,
  apiClient,
  apiNewClient
} from "../client";
import { ApiEndpoint, resolveApiBaseUrl } from "@/lib/config";

// Mock axios
// Provide a factory that returns fully-shaped instances so the module-level
// `createApiClient()` calls in client.ts (lines 197-198) do not crash when
// attaching interceptors at import time. The `create` mock is also reused by
// the production `createRefreshClient` helper: when a test needs to drive the
// refresh-token flow (success or failure), it can configure the refresh
// client's `get` via the shared `__refreshClientGet` hook below.
const __refreshClientGet = jest.fn();
jest.mock("axios", () => {
  // Instance returned for the main api clients. Each `create()` call returns a
  // fresh object so the per-test `mockReturnValue` overrides still work, but we
  // keep the default sane for the import-time calls.
  const makeInterceptors = () => ({
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  });
  return {
    create: jest.fn(() => ({
      interceptors: makeInterceptors(),
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    })),
    isAxiosError: jest.fn(),
  };
});

// Mock config module
jest.mock("@/lib/config", () => ({
  ApiEndpoint: {
    GENESIS: "genesis",
    NEW: "new"
  },
  resolveApiBaseUrl: jest.fn((endpoint) => {
    if (endpoint === "new") return "/api";
    return "http://localhost:4000/";
  })
}));

// Mock stores
// Use stable singleton state objects so `useAuthStore.getState()` returns the
// same mock instance across calls within a test. This is required because the
// production code calls `getState()` multiple times (e.g. once in
// `handleLogout`, again when destructuring `permissionVersion`) and the test
// assertions also call `getState()` to retrieve the spy.
jest.mock("@/store/auth-store", () => {
  const authStateMock = {
    clearAuth: jest.fn(),
    permissionVersion: null as string | null,
    setPermissionVersion: jest.fn(),
  };
  return {
    useAuthStore: {
      getState: jest.fn(() => authStateMock),
    },
  };
});

jest.mock("@/store/privilege-store", () => {
  const privilegeStateMock = {
    resetPrivilege: jest.fn(),
    setPrivilegeFromMe: jest.fn(),
  };
  return {
    usePrivilegeStore: {
      getState: jest.fn(() => privilegeStateMock),
    },
  };
});

describe("Axios Client", () => {
  const mockAxiosCreate = axios.create as jest.Mock;
  const mockWindow = global.window;

  beforeEach(() => {
    jest.clearAllMocks();
    // Default refresh-client behaviour: resolve successfully so any 401 retry
    // path completes without surfacing an unhandled rejection.
    __refreshClientGet.mockResolvedValue({ data: {} });
    global.window = {
      ...mockWindow,
      location: {
        pathname: "/dashboard"
      }
    } as any;
  });

  afterEach(() => {
    global.window = mockWindow;
  });

  // Helper that builds a mock instance and records any promises returned by the
  // async error interceptor so tests can await them before asserting.
  const pendingErrorPromises: Array<Promise<unknown>> = [];
  const flushPendingErrors = () =>
    Promise.all(
      pendingErrorPromises.map((p) =>
        p.catch(() => {
          /* expected: interceptor rethrows on non-refresh errors */
        }),
      ),
    ).then(() => undefined);

  // Helper: configures `axios.create` so that the FIRST call (the main api
  // client created inside createApiClient) returns a mock instance whose
  // response interceptor exposes the error handler, and any SUBSEQUENT calls
  // (made by createRefreshClient inside the production error interceptor)
  // return a refresh client controlled by `refreshClientGet`. The returned
  // `triggerError` function invokes the captured error handler and records its
  // returned promise so it can be drained by `flushPendingErrors`.
  const setupInstanceWithErrorHandler = (refreshClientGet?: jest.Mock) => {
    let capturedErrorHandler: ((e: AxiosError) => unknown) | null = null;
    const mockInstance: any = {
      interceptors: {
        request: { use: jest.fn() },
        response: {
          use: jest.fn(
            (_successFn: unknown, errorFn: (e: AxiosError) => unknown) => {
              capturedErrorHandler = errorFn;
            },
          ),
        },
      },
    };
    // The retry path calls `instance(originalRequest)`. Make the instance
    // itself callable.
    mockInstance.mockImplementation = () => mockInstance;

    const refreshGet = refreshClientGet ?? __refreshClientGet;
    let nextCreateCallIndex = 0;
    mockAxiosCreate.mockImplementation(() => {
      const idx = nextCreateCallIndex++;
      if (idx === 0) {
        return mockInstance;
      }
      return { get: refreshGet };
    });

    const triggerError = (error: AxiosError) => {
      const fn = capturedErrorHandler as (e: AxiosError) => unknown;
      if (!fn) throw new Error("error handler was not registered");
      const result = fn(error);
      if (result && typeof (result as Promise<unknown>).then === "function") {
        pendingErrorPromises.push(result as Promise<unknown>);
      }
      return result;
    };
    return { mockInstance, triggerError, refreshGet };
  };

  describe("createApiClient", () => {
    it("should create axios instance with GENESIS endpoint by default", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: expect.any(String),
          withCredentials: true,
          timeout: 100000,
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    it("should create axios instance with NEW endpoint", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient(ApiEndpoint.NEW);

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "/api",
          withCredentials: true,
          timeout: 100000,
          headers: { "Content-Type": "application/json" }
        })
      );
    });

    it("should attach request interceptor", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
    });

    it("should attach response interceptor", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });

    it("`should return axios instance with interceptors", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      const result = createApiClient();

      expect(result).toBe(mockInstance);
    });
  });

  describe("createApiNewClient", () => {
    it("`should create client with NEW endpoint", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiNewClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: "/api"
        })
      );
    });

    it("should attach interceptors to new client", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiNewClient();

      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe("apiClient and apiNewClient instances", () => {
    it("should create apiClient instance", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      expect(apiClient).toBeDefined();
    });

    it("should create apiNewClient instance", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      expect(apiNewClient).toBeDefined();
    });

    it("`should use different endpoints for each instance", () => {
      mockAxiosCreate.mockReturnValue({
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      });

      // Invoke both factory functions; resolveApiBaseUrl is mocked to return
      // different base URLs for the two endpoints (GENESIS vs NEW).
      createApiClient(ApiEndpoint.GENESIS);
      createApiClient(ApiEndpoint.NEW);

      // Two separate create() calls, each routed through resolveApiBaseUrl.
      expect(axios.create).toHaveBeenCalledTimes(2);
      expect(resolveApiBaseUrl).toHaveBeenCalledWith(ApiEndpoint.GENESIS);
      expect(resolveApiBaseUrl).toHaveBeenCalledWith(ApiEndpoint.NEW);
    });
  });

  describe("Request Interceptor", () => {
    it("should log request information", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn((fn) => {
            // Call the interceptor function
            fn({ method: "GET", baseURL: "http://test.com", url: "/api/test", data: null });
          }) },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[REQ"),
        expect.any(String),
        // Production code logs `config.data ?? ""`, so null becomes "".
        ""
      );
      
      consoleLogSpy.mockRestore();
    });

    it("`should handle different HTTP methods", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn((fn) => {
            fn({ method: "POST", baseURL: "http://test.com", url: "/api/test", data: { test: "data" } });
          }) },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("POST"),
        expect.any(String),
        { test: "data" }
      );
      
      consoleLogSpy.mockRestore();
    });
  });

  describe("Response Interceptor - Success", () => {
    it("`should log successful response", () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn((successFn) => {
            successFn({
              status: 200,
              config: { method: "GET", url: "/api/test" },
              headers: { "x-perm-version": "v1" },
              data: { result: "success" }
            });
          }) }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("[RES"),
        expect.any(String),
        { result: "success" }
      );
      
      consoleLogSpy.mockRestore();
    });

    it("`should handle permission version header", () => {
      const { useAuthStore } = require("@/store/auth-store");

      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn((successFn) => {
            successFn({
              status: 200,
              config: { method: "GET", url: "/api/test" },
              headers: { "x-perm-version": "v2" },
              data: { result: "success" }
            });
          }) }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(useAuthStore.getState().setPermissionVersion).toHaveBeenCalled();
    });
  });

  describe("Response Interceptor - Error", () => {
    afterEach(async () => {
      // Drain any async rejections captured from the error interceptor so
      // they never surface as unhandled rejections between tests.
      await flushPendingErrors();
      pendingErrorPromises.length = 0;
    });

    it("`should log error response", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const { mockInstance, triggerError } =
        setupInstanceWithErrorHandler();

      createApiClient();

      const error = {
        config: { method: "GET", url: "/api/test", _retry: false },
        response: { status: 500, data: { message: "Server error" } }
      } as AxiosError;
      triggerError(error);

      await flushPendingErrors();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("[ERR"),
        expect.any(String),
        { message: "Server error" }
      );
      
      consoleErrorSpy.mockRestore();
    });

    it("`should handle 401 unauthorized error", async () => {
      const { useAuthStore } = require("@/store/auth-store");
      const { usePrivilegeStore } = require("@/store/privilege-store");

      // Force the refresh to fail so the production code reaches the
      // handleLogout() branch (which calls clearAuth + resetPrivilege).
      const failingRefresh = jest.fn().mockRejectedValue(new Error("Refresh failed"));
      const { triggerError } = setupInstanceWithErrorHandler(failingRefresh);

      createApiClient();

      const error = {
        config: { method: "GET", url: "/api/test", _retry: false },
        response: { status: 401 }
      } as AxiosError;
      triggerError(error);

      await flushPendingErrors();

      expect(useAuthStore.getState().clearAuth).toHaveBeenCalled();
      expect(usePrivilegeStore.getState().resetPrivilege).toHaveBeenCalled();
    });

    it("`should skip auth endpoints for token refresh", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const { triggerError } = setupInstanceWithErrorHandler();

      createApiClient();

      const error = {
        config: { method: "POST", url: "/auth/login", _retry: false },
        response: { status: 401 }
      } as AxiosError;
      // For auth endpoints the production code re-throws the original error
      // without attempting a refresh or logout.
      triggerError(error);

      await flushPendingErrors();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe("Token Refresh Mechanism", () => {
    afterEach(async () => {
      await flushPendingErrors();
      pendingErrorPromises.length = 0;
    });

    it("`should attempt token refresh on 401 error", async () => {
      const refreshGet = jest.fn().mockResolvedValue({ data: {} });
      const { triggerError } = setupInstanceWithErrorHandler(refreshGet);

      createApiClient();

      const error = {
        config: { method: "GET", url: "/api/test", _retry: false },
        response: { status: 401 }
      } as AxiosError;
      triggerError(error);

      await flushPendingErrors();

      // After a 401 on a non-auth endpoint, the production code creates a
      // refresh client and calls GET /auth/refresh.
      expect(refreshGet).toHaveBeenCalledWith("/auth/refresh");
    });

    it("`should handle logout on failed token refresh", async () => {
      const { useAuthStore } = require("@/store/auth-store");
      const { usePrivilegeStore } = require("@/store/privilege-store");

      const failingRefresh = jest.fn().mockRejectedValue(new Error("Refresh failed"));
      const { triggerError } = setupInstanceWithErrorHandler(failingRefresh);

      createApiClient();

      const error = {
        config: { method: "GET", url: "/api/test", _retry: false },
        response: { status: 401 }
      } as AxiosError;
      triggerError(error);

      await flushPendingErrors();

      expect(useAuthStore.getState().clearAuth).toHaveBeenCalled();
      expect(usePrivilegeStore.getState().resetPrivilege).toHaveBeenCalled();
    });
  });

  describe("Privilege Refresh", () => {
    it("should refresh privileges when permission version changes", () => {
      const { useAuthStore } = require("@/store/auth-store");

      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn((successFn) => {
            successFn({
              status: 200,
              config: { method: "GET", url: "/api/test" },
              headers: { "x-perm-version": "v3" },
              data: { result: "success" }
            });
          }) }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(useAuthStore.getState().setPermissionVersion).toHaveBeenCalledWith("v3");
    });

    it("`should not refresh privileges when version is same", () => {
      const { useAuthStore } = require("@/store/auth-store");
      const authStoreMock = useAuthStore.getState();
      authStoreMock.permissionVersion = "v2";

      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn((successFn) => {
            successFn({
              status: 200,
              config: { method: "GET", url: "/api/test" },
              headers: { "x-perm-version": "v2" },
              data: { result: "success" }
            });
          }) }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      // setPermissionVersion should not be called when versions match
      expect(authStoreMock.setPermissionVersion).not.toHaveBeenCalled();
    });
  });

  describe("Configuration", () => {
    it("should use resolveApiBaseUrl for each endpoint", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient(ApiEndpoint.NEW);

      expect(resolveApiBaseUrl).toHaveBeenCalledWith(ApiEndpoint.NEW);
    });

    it("should configure timeout to 100000", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 100000
        })
      );
    });

    it("`should configure withCredentials to true", () => {
      const mockInstance = {
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() }
        }
      };
      mockAxiosCreate.mockReturnValue(mockInstance);

      createApiClient();

      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          withCredentials: true
        })
      );
    });
  });
});
