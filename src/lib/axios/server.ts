import axios from "axios";
import { ApiEndpoint, resolveApiBaseUrl } from "@/lib/config";

export const createServerAxios = async (
  endpoint: ApiEndpoint = ApiEndpoint.GENESIS,
) => {
  return axios.create({
    baseURL: resolveApiBaseUrl(endpoint),
    withCredentials: true,
    timeout: 100000,
    headers: { "Content-Type": "application/json" },
  });
};
