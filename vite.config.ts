import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  const proxyTarget = process.env.API_PROXY_TARGET;
  return {
    plugins: [solid()],
    server: {
      port: 3000,
      proxy: proxyTarget
        ? {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              ws: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          }
        : undefined,
    },
  };
});
