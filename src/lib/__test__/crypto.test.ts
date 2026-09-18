import { decrypt, encrypt } from "@/lib/crypto";

describe("crypto", () => {
  it("round-trips an object payload", () => {
    const payload = { email: "a@b.com", token: "abc123" };
    const encrypted = encrypt(payload);
    expect(decrypt(encrypted)).toEqual(payload);
  });

  it("produces base64url output without padding", () => {
    const encrypted = encrypt({ hello: "world" });
    expect(encrypted).not.toMatch(/[+/=]/);
  });

  it("throws when payload cannot be decrypted", () => {
    expect(() => decrypt("not-a-valid-payload")).toThrow();
  });
});
