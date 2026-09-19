import { useEffect } from "react";
import { refreshPrivilegesIfVersionChanged } from "@/lib/axios/client";
import { ApiEndpoint, resolveApiBaseUrl } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";

const BASE_RETRY_DELAY_MS = 5_000;
const MAX_RETRY_DELAY_MS = 60_000;

/**
 * Subscribes to the backend permission-version SSE stream (`GET /auth/events`)
 * so privilege changes made by an admin reach this client immediately — no
 * polling. The stream authenticates with the long-lived refresh cookie, so it
 * survives access-token rotation.
 *
 * The `x-perm-version` header on regular responses remains as a backstop
 * while the stream is reconnecting.
 */
export const usePermissionEvents = (): void => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    const base = resolveApiBaseUrl(ApiEndpoint.NEW).replace(/\/+$/, "");
    const url = `${base}/auth/events`;

    let source: EventSource | null = null;
    let retryTimer: number | undefined;
    let attempts = 0;
    let disposed = false;

    const openStream = (): void => {
      source = new EventSource(url, { withCredentials: true });

      source.addEventListener("perm-version", (event) => {
        void refreshPrivilegesIfVersionChanged(
          (event as MessageEvent<string>).data,
          ApiEndpoint.NEW,
        );
      });

      source.onopen = (): void => {
        attempts = 0;
      };

      // CLOSED means the server refused the connection (e.g. expired session);
      // EventSource only auto-reconnects on network drops, so we retry
      // ourselves with exponential backoff.
      source.onerror = (): void => {
        source?.close();
        if (disposed) return;
        const delay = Math.min(
          BASE_RETRY_DELAY_MS * 2 ** attempts,
          MAX_RETRY_DELAY_MS,
        );
        attempts += 1;
        retryTimer = window.setTimeout(openStream, delay);
      };
    };

    openStream();

    return () => {
      disposed = true;
      source?.close();
      if (retryTimer !== undefined) window.clearTimeout(retryTimer);
    };
  }, [isAuthenticated]);
};
