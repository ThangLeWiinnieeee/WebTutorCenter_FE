import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, fileURLToPath(new URL(".", import.meta.url)), "VITE_");
  const apiBaseUrl = env.VITE_API_BASE_URL || "http://localhost:5002/api";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // ESM-safe (không dùng __dirname — không tồn tại trong module ESM)
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ["@radix-ui/react-select"],
    },
    server: {
      port: 4000,
    },
    preview: {
      port: 4000,
      strictPort: true,
      proxy: {
        "/api": {
          target: apiBaseUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
