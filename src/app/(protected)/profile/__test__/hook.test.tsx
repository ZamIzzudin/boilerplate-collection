jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock("../handler", () => ({
  profileHandler: {
    getDetail: jest.fn(),
    logout: jest.fn(),
    checkPassword: jest.fn(),
    changePassword: jest.fn(),
  },
}));

import { useProfileDetail, useCheckPassword, useChangePassword } from "../hook";
import { useMutation, useQuery } from "@tanstack/react-query";
import { profileHandler } from "../handler";

const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;

describe("useProfileDetail", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls useQuery with correct queryKey", () => {
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
    useProfileDetail();
    expect(mockUseQuery).toHaveBeenCalledWith({
      queryKey: ["profile", "detail"],
      queryFn: expect.any(Function),
    });
  });

  it("returns data and isLoading", () => {
    mockUseQuery.mockReturnValue({ data: { id: "1" }, isLoading: true });
    const result = useProfileDetail();
    expect(result.data).toEqual({ id: "1" });
    expect(result.isLoading).toBe(true);
  });
});

describe("useCheckPassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("configures a mutation that calls checkPassword handler", async () => {
    mockUseMutation.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    const result = useCheckPassword();
    const mutationConfig = mockUseMutation.mock.calls[0][0];
    await mutationConfig.mutationFn("secret");
    expect(profileHandler.checkPassword).toHaveBeenCalledWith("secret");
    expect(result.isPending).toBe(false);
  });
});

describe("useChangePassword", () => {
  beforeEach(() => jest.clearAllMocks());

  it("configures a mutation that calls changePassword handler with both passwords", async () => {
    mockUseMutation.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    const result = useChangePassword();
    const mutationConfig = mockUseMutation.mock.calls[0][0];
    await mutationConfig.mutationFn({
      newPassword: "Newpass123!",
      confirmPassword: "Newpass123!",
    });
    expect(profileHandler.changePassword).toHaveBeenCalledWith(
      "Newpass123!",
      "Newpass123!",
    );
    expect(profileHandler.changePassword).toHaveBeenCalledTimes(1);
    expect(result.isPending).toBe(false);
  });
});
