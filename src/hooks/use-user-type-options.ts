import { useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { apiNewClient } from "@/lib/axios/client";
import type { SelectOption } from "@/types";

const USER_TYPE_QUERY_KEY = ["user-type-options"] as const;
const PAGE_SIZE = 10;

type UserTypeContext = "register" | "regulator";

interface UseUserTypeListParams {
  name?: string;
  context?: UserTypeContext;
}

const EXCLUDED_REGULATOR_FORMS = new Set(["shipper", "operator"]);

export const useUserTypeList = (params?: UseUserTypeListParams) =>
  useInfiniteQuery({
    queryKey: [...USER_TYPE_QUERY_KEY, params?.name, params?.context],
    queryFn: async ({
      pageParam = 1,
    }): Promise<{
      items: SelectOption[];
      nextPage: number | undefined;
    }> => {
      const showOnRegister = params?.context === "register" ? true : undefined;

      const { data: response } = await apiNewClient.get<any>("/user-type", {
        params: {
          page: pageParam,
          limit: PAGE_SIZE,
          type: "list",
          user_type_name: params?.name || undefined,
          user_type_show_on_register: showOnRegister,
        },
      });

      const res = response?.data ?? response ?? {};
      const rawRecords: any[] = Array.isArray(res) ? res : (res.records ?? []);
      const filteredRecords =
        params?.context === "regulator"
          ? rawRecords.filter(
              (v: any) => !EXCLUDED_REGULATOR_FORMS.has(v.user_type_form),
            )
          : rawRecords;

      const items: SelectOption[] = filteredRecords.map((v: any) => ({
        label: v.user_type_name ?? "",
        value: String(v.id ?? ""),
      }));

      const hasNext: boolean = res.has_next ?? false;
      return {
        items,
        nextPage: hasNext && items.length > 0 ? pageParam + 1 : undefined,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

interface UseUserTypeOptionsParams {
  context?: UserTypeContext;
}

export function useUserTypeOptions(params?: UseUserTypeOptionsParams) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching } =
    useUserTypeList({
      name: debouncedSearch || undefined,
      context: params?.context,
    });

  const options = data?.pages.flatMap((p) => p.items) ?? [];

  const isSearching = isFetching && Boolean(debouncedSearch);
  const loading = isFetchingNextPage || isSearching;

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return {
    options,
    loading,
    search,
    setSearch,
    loadMore,
  };
}
