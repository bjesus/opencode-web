import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const proxyTarget = process.env.API_PROXY_TARGET;
  return {
    plugins: [tailwindcss(), solidPlugin()],
    server: {
      port: 3000,
      proxy: proxyTarget
        ? {
            "/api": {
              target: proxyTarget,
              changeOrigin: true,
              ws: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          }
        : undefined,
    },
  };
});
