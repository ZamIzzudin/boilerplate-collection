import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";

// Buat QueryClient dengan retry disabled agar test lebih cepat & deterministik.
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wrapper untuk provide QueryClient ke hook yang menggunakan useQuery/useInfiniteQuery.
export function createWrapper() {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
}

// Helper: render hook dengan QueryClient wrapper.
export function renderHookWithQuery<T, R>(
  hook: (props: T) => R,
  initialProps?: T,
) {
  return renderHook(hook, {
    wrapper: createWrapper(),
    initialProps,
  });
}

export { waitFor } from "@testing-library/react";
