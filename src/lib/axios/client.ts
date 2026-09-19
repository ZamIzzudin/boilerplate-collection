import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { ApiEndpoint, resolveApiBaseUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import { usePrivilegeStore } from "@/store/privilege-store";

let isRefreshing = false;
let isRefreshingPrivileges = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(null);
  });
  failedQueue = [];
};

const publicPaths = ["/login", "/", "/reset", "/activation"];

const handleLogout = () => {
  useAuthStore.getState().clearAuth();
  usePrivilegeStore.getState().resetPrivilege();
  if (
    !publicPaths.some(
      (path) =>
        globalThis.window.location.pathname === path ||
        globalThis.window.location.pathname.startsWith(path + "/"),
    )
  ) {
    globalThis.window.location.href = "/login";
  }
};

export const refreshPrivilegesIfVersionChanged = async (
  responseVersion: string | undefined,
  endpoint: ApiEndpoint,
) => {
  if (!responseVersion) return;

  const { permissionVersion, setPermissionVersion } = useAuthStore.getState();

  if (permissionVersion === responseVersion) return;

  setPermissionVersion(responseVersion);

  if (isRefreshingPrivileges) return;
  isRefreshingPrivileges = true;

  try {
    const baseURL = resolveApiBaseUrl(endpoint);
    const refreshClient = createRefreshClient(baseURL);
    const { data } = await refreshClient.get("/auth/me");
    const me = data?.data ?? data;

    if (me?.user_email) {
      usePrivilegeStore.getState().setPrivilegeFromMe({
        user_email: me.user_email,
        menus: me.menus ?? [],
      });
    }

    // Also save perm version from auth/me response header if present
    const meVersion = data?.headers?.["x-perm-version"];
    if (meVersion && meVersion !== responseVersion) {
      setPermissionVersion(meVersion);
    }
  } catch {
    console.error("[PermVersion] Failed to refresh privileges");
  } finally {
    isRefreshingPrivileges = false;
  }
};

const createRefreshClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    withCredentials: true,
    timeout: 100000,
    headers: { "Content-Type": "application/json" },
  });
};

const attachInterceptors = (instance: AxiosInstance, endpoint: ApiEndpoint) => {
  const endpointLabel = endpoint === ApiEndpoint.GENESIS ? "GENESIS" : "NEW";

  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const method = (config.method ?? "GET").toUpperCase();
    console.log(
      `%c[REQ ${endpointLabel}] ${method} ${config.baseURL}${config.url}`,
      "color: #6a9fb5; font-weight: bold",
      config.data ?? "",
    );
    return config;
  });

  instance.interceptors.response.use(
    (response: any) => {
      const method = (response.config?.method ?? "GET").toUpperCase();
      console.log(
        `%c[RES ${endpointLabel}] ${response.status} ${method} ${response.config?.url}`,
        "color: #4caf50; font-weight: bold",
        response.data,
      );

      // Check x-perm-version header for privilege staleness
      const permVersion = response.headers?.["x-perm-version"] as
        | string
        | undefined;
      if (permVersion) {
        refreshPrivilegesIfVersionChanged(permVersion, endpoint);
      }

      return response;
    },

    async (error: AxiosError) => {
      const originalRequest: any = error.config;
      const requestUrl: string = originalRequest?.url ?? "";
      const status = error.response?.status;

      const method = (originalRequest?.method ?? "GET").toUpperCase();
      console.error(
        `%c[ERR ${endpointLabel}] ${status} ${method} ${requestUrl}`,
        "color: #e53935; font-weight: bold",
        error.response?.data ?? error.message,
      );

      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/refresh");

      if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => instance(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.info("[Refresh] Attempting token refresh...");
          const baseURL = resolveApiBaseUrl(endpoint);
          const refreshClient = createRefreshClient(baseURL);

          console.log(
            "%c[REQ REFRESH] GET /auth/refresh",
            "color: #ff9800; font-weight: bold",
          );

          await refreshClient.get("/auth/refresh");

          console.info("[Refresh] Token refreshed successfully");
          processQueue(null);

          return instance(originalRequest);
        } catch (refreshError) {
          console.error("[Refresh] Token refresh failed:", refreshError);
          processQueue(refreshError);
          handleLogout();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      throw error;
    },
  );

  return instance;
};

export const createApiClient = (
  endpoint: ApiEndpoint = ApiEndpoint.GENESIS,
) => {
  const instance = axios.create({
    baseURL: resolveApiBaseUrl(endpoint),
    withCredentials: true,
    timeout: 100000,
    headers: { "Content-Type": "application/json" },
  });
  return attachInterceptors(instance, endpoint);
};

export const createApiNewClient = (endpoint: ApiEndpoint = ApiEndpoint.NEW) =>
  createApiClient(endpoint);

export const apiClient = createApiClient();
export const apiNewClient = createApiNewClient();
