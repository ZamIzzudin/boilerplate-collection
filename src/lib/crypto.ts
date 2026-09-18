import CryptoJS from "crypto-js";

const APP_KEY = import.meta.env.VITE_APP_KEY;
const APP_CIPHER = (
  import.meta.env.VITE_APP_CIPHER || "aes-256-cbc"
).toLowerCase();

const getKeySize = (): number => {
  const match = APP_CIPHER.match(/\d+/);

  if (!match) {
    throw new Error(`Invalid cipher: ${APP_CIPHER}`);
  }

  const bits = Number(match[0]);

  if (![128, 192, 256].includes(bits)) {
    throw new Error(`Unsupported AES key size: ${bits}`);
  }

  return bits / 8;
};

const getKey = (): CryptoJS.lib.WordArray => {
  if (!APP_KEY) {
    throw new Error("VITE_APP_KEY is not defined");
  }

  const keySize = getKeySize();

  let rawKey: Uint8Array;

  if (APP_KEY.startsWith("base64:")) {
    rawKey = Uint8Array.from(atob(APP_KEY.slice(7)), (c) => c.codePointAt(0)!);
  } else {
    rawKey = new TextEncoder().encode(APP_KEY);
  }

  const normalized = new Uint8Array(keySize);

  normalized.set(rawKey.slice(0, keySize));

  return CryptoJS.lib.WordArray.create(normalized);
};

const base64UrlEncode = (base64: string): string => {
  let end = base64.length;
  while (end > 0 && base64[end - 1] === "=") end--;
  return base64.replaceAll('+', "-").replaceAll('/', "_").slice(0, end);
};

const base64UrlDecode = (base64url: string): string => {
  if (!base64url) return "";
  let base64 = base64url.replaceAll('-', "+").replaceAll('_', "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  return base64;
};

export const encrypt = (payload: unknown): string => {
  const key = getKey();

  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(
    typeof payload === "string" ? payload : JSON.stringify(payload),
    key,
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  const combined = iv.clone().concat(encrypted.ciphertext);

  const base64 = CryptoJS.enc.Base64.stringify(combined);

  return base64UrlEncode(base64);
};

export const decrypt = <T = unknown>(encryptedPayload: string): T | string => {
  const key = getKey();

  const combined = CryptoJS.enc.Base64.parse(base64UrlDecode(encryptedPayload));

  const words = combined.words;
  const sigBytes = combined.sigBytes;

  const iv = CryptoJS.lib.WordArray.create(words.slice(0, 4), 16);

  const ciphertext = CryptoJS.lib.WordArray.create(
    words.slice(4),
    sigBytes - 16,
  );

  const decrypted = CryptoJS.AES.decrypt(
    {
      ciphertext,
    } as CryptoJS.lib.CipherParams,
    key,
    {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  const result = decrypted.toString(CryptoJS.enc.Utf8);

  try {
    return JSON.parse(result) as T;
  } catch {
    return result;
  }
};
