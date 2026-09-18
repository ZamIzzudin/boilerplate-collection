import { useQuery } from "@tanstack/react-query";
import { apiNewClient } from "@/lib/axios/client";

async function fetchProfileImage(userId: string): Promise<string | null> {
  try {
    const response = await apiNewClient.get(`/user/${userId}/file`, {
      params: { type: "logo" },
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch {
    return null;
  }
}

export function useProfileImage(userId?: string | null) {
  return useQuery({
    queryKey: ["profile-image", userId],
    queryFn: () => fetchProfileImage(userId!),
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}
