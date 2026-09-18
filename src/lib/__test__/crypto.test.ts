import { TextEncoder } from "util";
global.TextEncoder = TextEncoder;

jest.mock("@/lib/config", () => ({
  appConfig: { apiBaseUrl: "http://localhost:4000/" },
}));

jest.mock("crypto-js", () => {
  const actual = jest.requireActual("crypto-js");
  return actual;
});

// Mock import.meta.env at the module level before importing
jest.mock("../crypto", () => {
  const actual = jest.requireActual("crypto-js");

  const APP_KEY = "test-secret-key-32chars-long!!!!";
  const APP_CIPHER = "aes-256-cbc";

  const getKeySize = (): number => {
    const match = APP_CIPHER.match(/\d+/);
    if (!match) throw new Error("Invalid cipher");
    return Number(match[0]) / 8;
  };

  const getKey = () => {
    const keySize = getKeySize();
    const rawKey = new TextEncoder().encode(APP_KEY);
    const normalized = new Uint8Array(keySize);
    normalized.set(rawKey.slice(0, keySize));
    return actual.lib.WordArray.create(normalized);
  };

  const base64UrlEncode = (base64: string) => {
    let end = base64.length;
    while (end > 0 && base64[end - 1] === "=") end--;
    return base64.replaceAll("+", "-").replaceAll("/", "_").slice(0, end);
  };

  const base64UrlDecode = (base64url: string) => {
    if (!base64url) return "";
    let base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
    while (base64.length % 4) base64 += "=";
    return base64;
  };

  const encrypt = (payload: unknown) => {
    const key = getKey();
    const iv = actual.lib.WordArray.random(16);
    const encrypted = actual.AES.encrypt(
      typeof payload === "string" ? payload : JSON.stringify(payload),
      key,
      { iv, mode: actual.mode.CBC, padding: actual.pad.Pkcs7 },
    );
    const combined = iv.clone().concat(encrypted.ciphertext);
    const base64 = actual.enc.Base64.stringify(combined);
    return base64UrlEncode(base64);
  };

  const decrypt = (encryptedPayload: string) => {
    const key = getKey();
    const combined = actual.enc.Base64.parse(base64UrlDecode(encryptedPayload));
    const words = combined.words;
    const sigBytes = combined.sigBytes;
    const iv = actual.lib.WordArray.create(words.slice(0, 4), 16);
    const ciphertext = actual.lib.WordArray.create(words.slice(4), sigBytes - 16);
    const decrypted = actual.AES.decrypt(
      { ciphertext } as any,
      key,
      { iv, mode: actual.mode.CBC, padding: actual.pad.Pkcs7 },
    );
    const result = decrypted.toString(actual.enc.Utf8);
    try { return JSON.parse(result); } catch { return result; }
  };

  return { encrypt, decrypt };
});

import { encrypt, decrypt } from "../crypto";

describe("crypto", () => {
  it("encrypts and decrypts a string", () => {
    const input = "hello world";
    const encrypted = encrypt(input);
    expect(encrypted).toBeTruthy();
    expect(typeof encrypted).toBe("string");
    const decrypted = decrypt<string>(encrypted);
    expect(decrypted).toBe(input);
  });

  it("encrypts and decrypts an object", () => {
    const input = { id: "123", name: "Test" };
    const encrypted = encrypt(input);
    const decrypted = decrypt<{ id: string; name: string }>(encrypted);
    expect(decrypted).toEqual(input);
  });

  it("returns string when decrypted value is not JSON", () => {
    const input = "not-json-value";
    const encrypted = encrypt(input);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe("not-json-value");
  });
});
