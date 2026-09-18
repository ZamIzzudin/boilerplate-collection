jest.mock("@/lib/axios/client", () => ({
  apiNewClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

import { profileHandler } from "../handler";
import { apiNewClient } from "@/lib/axios/client";

const mockApi = apiNewClient as any;

describe("profileHandler", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getDetail calls /auth/profile and maps result", async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          id: 1,
          username: "admin",
          user_email: "admin@example.com",
          user_type_user_type_id: 1,
          user_type_name: "Superadmin",
        },
      },
    });

    const result = await profileHandler.getDetail();

    expect(mockApi.get).toHaveBeenCalledWith("/auth/profile");
    expect(result).toEqual({
      id: "1",
      username: "admin",
      email: "admin@example.com",
      userTypeId: "1",
      userTypeName: "Superadmin",
    });
  });

  it("logout calls /auth/logout", async () => {
    mockApi.post.mockResolvedValue({ data: { status: 0 } });
    await profileHandler.logout();
    expect(mockApi.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("checkPassword calls /user/check-password with password", async () => {
    mockApi.post.mockResolvedValue({ data: { status: 0 } });
    await profileHandler.checkPassword("secret");
    expect(mockApi.post).toHaveBeenCalledWith("/user/check-password", {
      password: "secret",
    });
  });

  it("changePassword calls /user/change-password with both passwords", async () => {
    mockApi.post.mockResolvedValue({ data: { status: 0 } });
    await profileHandler.changePassword("Newpass123!", "Newpass123!");
    expect(mockApi.post).toHaveBeenCalledWith("/user/change-password", {
      new_password: "Newpass123!",
      confirm_password: "Newpass123!",
    });
  });
});
