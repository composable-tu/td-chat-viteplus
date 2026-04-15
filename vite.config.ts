import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite-plus";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import VueRouter from "vue-router/vite";

// https://vite.dev/config/
export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { options: { typeAware: true, typeCheck: true } },
  plugins: [VueRouter(), vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      // 当你请求 /api/login 时，Vite 会帮你转发到 http://localhost:8080/login
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // 移除路径中的 /api 前缀
      },
    },
  },
});
