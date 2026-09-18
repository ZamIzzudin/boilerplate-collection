import CryptoJS from "crypto-js";
import { env } from "@/config/env";

/**
 * AES encryption compatible with the frontend `src/lib/crypto.ts`:
 *  - key: APP_KEY ("base64:<...>" decoded, otherwise raw UTF-8), normalized to cipher key size
 *  - AES-256-CBC + PKCS7
 *  - 16-byte random IV prepended to the ciphertext
 *  - final output is base64url (no padding)
 */
function getKeySize(): number {
  const match = env.appCipher.match(/\d+/);
  if (!match) throw new Error(`Invalid cipher: ${env.appCipher}`);

  const bits = Number(match[0]);
  if (![128, 192, 256].includes(bits)) {
    throw new Error(`Unsupported AES key size: ${bits}`);
  }
  return bits / 8;
}

function getKey(): CryptoJS.lib.WordArray {
  const keySize = getKeySize();

  let rawKey: Uint8Array;
  if (env.appKey.startsWith("base64:")) {
    rawKey = Uint8Array.from(
      Buffer.from(env.appKey.slice(7), "base64"),
      (c) => c,
    );
  } else {
    rawKey = new TextEncoder().encode(env.appKey);
  }

  const normalized = new Uint8Array(keySize);
  normalized.set(rawKey.slice(0, keySize));

  return CryptoJS.lib.WordArray.create(normalized);
}

function base64UrlEncode(base64: string): string {
  let end = base64.length;
  while (end > 0 && base64[end - 1] === "=") end--;
  return base64.replaceAll("+", "-").replaceAll("/", "_").slice(0, end);
}

function base64UrlDecode(base64url: string): string {
  if (!base64url) return "";
  let base64 = base64url.replaceAll("-", "+").replaceAll("_", "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

export const encrypt = (payload: unknown): string => {
  const key = getKey();
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(
    typeof payload === "string" ? payload : JSON.stringify(payload),
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );

  const combined = iv.clone().concat(encrypted.ciphertext);
  return base64UrlEncode(CryptoJS.enc.Base64.stringify(combined));
};

export const decrypt = <T = unknown>(encryptedPayload: string): T => {
  const key = getKey();
  const combined = CryptoJS.enc.Base64.parse(base64UrlDecode(encryptedPayload));

  const words = combined.words;
  const sigBytes = combined.sigBytes;

  const iv = CryptoJS.lib.WordArray.create(words.slice(0, 4), 16);
  const ciphertext = CryptoJS.lib.WordArray.create(words.slice(4), sigBytes - 16);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext } as CryptoJS.lib.CipherParams,
    key,
    { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 },
  );

  const result = decrypted.toString(CryptoJS.enc.Utf8);
  if (!result) throw new Error("Failed to decrypt payload");

  return JSON.parse(result) as T;
};
