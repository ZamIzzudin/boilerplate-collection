import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL_NEW ?? "https://localhost:4000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
          cookieDomainRewrite: { "*": "" },
        },
      },
    },
  };
});
