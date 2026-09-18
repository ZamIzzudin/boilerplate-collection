import { signAccessToken, signRefreshToken, verifyToken } from "@/lib/jwt";

const payload = { sub: "u1", email: "a@b.com", userTypeId: 1 };

describe("jwt", () => {
  it("signs and verifies an access token", () => {
    const token = signAccessToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ ...payload, type: "access" });
  });

  it("signs and verifies a refresh token", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyToken(token);
    expect(decoded).toMatchObject({ ...payload, type: "refresh" });
  });

  it("returns null for an invalid token", () => {
    expect(verifyToken("invalid")).toBeNull();
  });
});
