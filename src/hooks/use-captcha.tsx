/** @format */

import { useCallback, useRef, useState, useMemo, type RefObject } from "react";

interface CaptchaOptions {
  type?: "mixed" | "numeric" | "alpha";
  length?: number;
  sensitive?: boolean;
  width?: number;
  height?: number;
  fontColor?: string;
  background?: string;
}

const defaultOptions: Required<CaptchaOptions> = {
  type: "mixed",
  length: 5,
  sensitive: true,
  width: 120,
  height: 40,
  fontColor: "#000",
  background: "#f9fafb",
};

const generateCaptchaText = (type: string, length: number): string => {
  let chars = "";
  if (type === "numeric") {
    chars = "0123456789";
  } else if (type === "alpha") {
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  } else {
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  }

  let result = "";
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
};

const drawCaptcha = (
  canvas: HTMLCanvasElement,
  text: string,
  options: Required<CaptchaOptions>,
): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = options.width;
  canvas.height = options.height;

  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, options.width, options.height);

  const lineRandomValues = new Uint32Array(5 * 7);
  crypto.getRandomValues(lineRandomValues);
  let randomIndex = 0;

  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(${lineRandomValues[randomIndex++] % 200}, ${
      lineRandomValues[randomIndex++] % 200
    }, ${lineRandomValues[randomIndex++] % 200}, 0.3)`;
    ctx.beginPath();
    ctx.moveTo(
      (lineRandomValues[randomIndex++] / 0xffffffff) * options.width,
      (lineRandomValues[randomIndex++] / 0xffffffff) * options.height,
    );
    ctx.lineTo(
      (lineRandomValues[randomIndex++] / 0xffffffff) * options.width,
      (lineRandomValues[randomIndex++] / 0xffffffff) * options.height,
    );
    ctx.stroke();
  }

  ctx.font = `bold ${options.height * 0.6}px Arial`;
  ctx.fillStyle = options.fontColor;
  ctx.textBaseline = "middle";

  const charWidth = options.width / (text.length + 1);
  const charRandomValues = new Uint32Array(text.length * 2);
  crypto.getRandomValues(charRandomValues);

  for (let i = 0; i < text.length; i++) {
    const x = charWidth * (i + 0.5);
    const y =
      options.height / 2 + (charRandomValues[i * 2] / 0xffffffff - 0.5) * 10;
    const rotation = (charRandomValues[i * 2 + 1] / 0xffffffff - 0.5) * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  const dotRandomValues = new Uint32Array(30 * 5);
  crypto.getRandomValues(dotRandomValues);

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${dotRandomValues[i * 5] % 255}, ${
      dotRandomValues[i * 5 + 1] % 255
    }, ${dotRandomValues[i * 5 + 2] % 255}, 0.5)`;
    ctx.beginPath();
    ctx.arc(
      (dotRandomValues[i * 5 + 3] / 0xffffffff) * options.width,
      (dotRandomValues[i * 5 + 4] / 0xffffffff) * options.height,
      1,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
};

export const useCaptcha = (
  containerRef: RefObject<HTMLElement | null>,
  userOptions?: CaptchaOptions,
) => {
  const captchaTextRef = useRef<string>("");
  const [isReady, setIsReady] = useState(false);

  const options = useMemo(
    () => ({ ...defaultOptions, ...userOptions }),
    [userOptions],
  );

  const gen = useCallback(() => {
    if (!containerRef.current) return;

    const text = generateCaptchaText(options.type, options.length);
    captchaTextRef.current = text;

    containerRef.current.innerHTML = "";

    const canvas = document.createElement("canvas");
    canvas.style.borderRadius = "4px";
    drawCaptcha(canvas, text, options);
    containerRef.current.appendChild(canvas);
    setIsReady(true);
  }, [containerRef, options]);

  const validate = useCallback(
    (input: string): boolean => {
      if (!captchaTextRef.current) return false;

      if (options.sensitive) {
        return input === captchaTextRef.current;
      }
      return input.toLowerCase() === captchaTextRef.current.toLowerCase();
    },
    [options.sensitive],
  );

  return { gen, validate, isReady };
};

export default useCaptcha;
