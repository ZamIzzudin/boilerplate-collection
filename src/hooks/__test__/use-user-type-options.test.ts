import { act } from "@testing-library/react";
import { apiNewClient } from "@/lib/axios/client";
import { useUserTypeOptions } from "@/hooks/use-user-type-options";
import { renderHookWithQuery, waitFor } from "../test-utils";

jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    get: jest.fn(),
  },
}));

const mockedGet = apiNewClient.get as jest.Mock;

function buildPageResponse(
  records: any[],
  opts: { hasNext: boolean; currentPage?: number },
) {
  return {
    data: {
      data: {
        records,
        records_total: "50",
        page_total: 5,
        current_page: opts.currentPage ?? 1,
        has_next: opts.hasNext,
        has_prev: false,
        start: 1,
      },
    },
  };
}

function buildUserTypeRecord(id: string, name: string, form?: string) {
  return {
    id,
    user_type_name: name,
    user_type_form: form ?? "operator",
  };
}

describe("useUserTypeOptions", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedGet.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("context='register' sets user_type_show_on_register=true", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [buildUserTypeRecord("1", "Operator", "operator")],
        { hasNext: false },
      ),
    );

    renderHookWithQuery(() => useUserTypeOptions({ context: "register" }));

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith(
        "/user-type",
        expect.objectContaining({
          params: expect.objectContaining({
            user_type_show_on_register: true,
          }),
        }),
      );
    });
  });

  it("context='regulator' filters out shipper and operator user_type_form", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [
          buildUserTypeRecord("1", "Shipper Type", "shipper"),
          buildUserTypeRecord("2", "Operator Type", "operator"),
          buildUserTypeRecord("3", "Regulator Type", "regulator"),
          buildUserTypeRecord("4", "Other Type", "other"),
        ],
        { hasNext: false },
      ),
    );

    const { result } = renderHookWithQuery(() =>
      useUserTypeOptions({ context: "regulator" }),
    );

    await waitFor(() => {
      expect(result.current.options.length).toBe(2);
    });

    expect(result.current.options).toEqual([
      { value: "3", label: "Regulator Type" },
      { value: "4", label: "Other Type" },
    ]);
  });

  it("no context (default) fetches without show_on_register filter", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [buildUserTypeRecord("1", "Operator", "operator")],
        { hasNext: false },
      ),
    );

    renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith(
        "/user-type",
        expect.objectContaining({
          params: expect.objectContaining({
            user_type_show_on_register: undefined,
          }),
        }),
      );
    });
  });

  it("maps records to SelectOption correctly", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [
          buildUserTypeRecord("10", "Type A", "operator"),
          buildUserTypeRecord("20", "Type B", "regulator"),
        ],
        { hasNext: false },
      ),
    );

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(2);
    });

    expect(result.current.options).toEqual([
      { value: "10", label: "Type A" },
      { value: "20", label: "Type B" },
    ]);
  });

  it("search is debounced 300ms then fetches with user_type_name", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [buildUserTypeRecord("1", "Operator")],
        { hasNext: false },
      ),
    );

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(1);
    });

    await act(async () => {
      result.current.setSearch("Op");
    });

    expect(mockedGet).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        params: expect.objectContaining({ user_type_name: "Op" }),
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith(
        "/user-type",
        expect.objectContaining({
          params: expect.objectContaining({ user_type_name: "Op" }),
        }),
      );
    });
  });

  it("loadMore fetches next page and accumulates data", async () => {
    mockedGet.mockResolvedValueOnce(
      buildPageResponse(
        [buildUserTypeRecord("1", "Type A", "operator")],
        { hasNext: true, currentPage: 1 },
      ),
    );

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(1);
    });

    mockedGet.mockResolvedValueOnce(
      buildPageResponse(
        [buildUserTypeRecord("2", "Type B", "regulator")],
        { hasNext: false, currentPage: 2 },
      ),
    );

    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.options.length).toBe(2);
    });
  });

  it("loadMore does not fetch when no next page", async () => {
    mockedGet.mockResolvedValue(
      buildPageResponse(
        [buildUserTypeRecord("1", "Type A", "operator")],
        { hasNext: false },
      ),
    );

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(1);
    });

    const initialCallCount = mockedGet.mock.calls.length;

    await act(async () => {
      result.current.loadMore();
    });

    expect(mockedGet.mock.calls.length).toBe(initialCallCount);
  });

  it("loading is true when fetching next page", async () => {
    mockedGet.mockResolvedValueOnce(
      buildPageResponse(
        [buildUserTypeRecord("1", "Type A", "operator")],
        { hasNext: true, currentPage: 1 },
      ),
    );

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(1);
    });

    let resolvePage2!: (value: any) => void;
    mockedGet.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolvePage2 = resolve;
        }),
    );

    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });

    await act(async () => {
      resolvePage2(
        buildPageResponse(
          [buildUserTypeRecord("2", "Type B", "regulator")],
          { hasNext: false, currentPage: 2 },
        ),
      );
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("handles API error gracefully", async () => {
    mockedGet.mockRejectedValue(new Error("Network error"));

    const { result } = renderHookWithQuery(() => useUserTypeOptions());

    await waitFor(() => {
      expect(result.current.options.length).toBe(0);
    });

    expect(result.current.loading).toBe(false);
  });
});
