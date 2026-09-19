import type { Response } from "express";

type SseClient = {
  id: number;
  write: (chunk: string) => void;
};

/** Idle-connection keepalive so proxies do not cut silent streams (comment frames only). */
const KEEPALIVE_INTERVAL_MS = 30_000;

const clients = new Map<number, SseClient>();
let nextClientId = 1;
let keepAliveTimer: NodeJS.Timeout | null = null;

const stopKeepAliveIfIdle = (): void => {
  if (clients.size === 0 && keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
};

const startKeepAliveIfNeeded = (): void => {
  if (keepAliveTimer || clients.size === 0) return;
  keepAliveTimer = setInterval(() => {
    for (const client of clients.values()) {
      client.write(": ping\n\n");
    }
  }, KEEPALIVE_INTERVAL_MS);
  keepAliveTimer.unref();
};

/** Number of open permission-event streams (useful in tests). */
export const sseClientCount = (): number => clients.size;

/**
 * Track a response as an SSE stream. Returns a function that must be called
 * when the client disconnects.
 */
export const registerSseClient = (res: Response): (() => void) => {
  const id = nextClientId++;

  clients.set(id, { id, write: (chunk) => res.write(chunk) });
  startKeepAliveIfNeeded();

  return () => {
    if (!clients.delete(id)) return;
    stopKeepAliveIfIdle();
  };
};

/** Push a permission-version update to every connected client. */
export const broadcastPermVersion = (version: string): void => {
  for (const client of clients.values()) {
    client.write(`event: perm-version\ndata: ${version}\n\n`);
  }
};
