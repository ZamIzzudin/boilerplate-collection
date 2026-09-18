import axios from "axios";
import { createServerAxios } from "../server";
import { ApiEndpoint, resolveApiBaseUrl } from "@/lib/config";

// Mock axios
jest.mock("axios");

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

describe("createServerAxios", () => {
  const mockAxiosCreate = axios.create as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create axios instance with GENESIS endpoint by default", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios();

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        withCredentials: true,
        timeout: 100000,
        headers: { "Content-Type": "application/json" }
      })
    );
  });

  it("should create axios instance with NEW endpoint", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios(ApiEndpoint.NEW);

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: "/api",
        withCredentials: true,
        timeout: 100000,
        headers: { "Content-Type": "application/json" }
      })
    );
  });

  it("should create axios instance with GENESIS endpoint when specified", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios(ApiEndpoint.GENESIS);

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.any(String),
        withCredentials: true,
        timeout: 100000,
        headers: { "Content-Type": "application/json" }
      })
    );
  });

  it("should call resolveApiBaseUrl to get correct URL", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios(ApiEndpoint.NEW);

    expect(resolveApiBaseUrl).toHaveBeenCalledWith(ApiEndpoint.NEW);
  });

  it("`should return axios instance", async () => {
    const mockInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };
    mockAxiosCreate.mockReturnValue(mockInstance);

    const result = await createServerAxios();

    expect(result).toBe(mockInstance);
  });

  it("`should set withCredentials to true", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios();

    const config = mockAxiosCreate.mock.calls[0][0];
    expect(config.withCredentials).toBe(true);
  });

  it("`should set timeout to 100000", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios();

    const config = mockAxiosCreate.mock.calls[0][0];
    expect(config.timeout).toBe(100000);
  });

  it("`should set Content-Type to application/json", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios();

    const config = mockAxiosCreate.mock.calls[0][0];
    expect(config.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("`should handle multiple endpoints correctly", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios(ApiEndpoint.GENESIS);
    await createServerAxios(ApiEndpoint.NEW);

    expect(axios.create).toHaveBeenCalledTimes(2);
  });

  it("`should use default endpoint when no parameter provided", async () => {
    mockAxiosCreate.mockReturnValue({});

    await createServerAxios();

    // The production signature is `createServerAxios(endpoint = ApiEndpoint.GENESIS)`,
    // so calling it with no argument passes the GENESIS default through to
    // resolveApiBaseUrl (not `undefined`).
    expect(resolveApiBaseUrl).toHaveBeenCalledWith(ApiEndpoint.GENESIS);
  });

  it("`should create independent instances for different endpoints", async () => {
    const genesisInstance = { instance: "genesis" };
    const newInstance = { instance: "new" };

    mockAxiosCreate
      .mockReturnValueOnce(genesisInstance)
      .mockReturnValueOnce(newInstance);

    const genesisResult = await createServerAxios(ApiEndpoint.GENESIS);
    const newResult = await createServerAxios(ApiEndpoint.NEW);

    expect(genesisResult).toBe(genesisInstance);
    expect(newResult).toBe(newInstance);
    expect(genesisResult).not.toBe(newResult);
  });
});
