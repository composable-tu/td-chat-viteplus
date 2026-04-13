import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";
import { useAccountStore } from "@/stores/account.ts";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
});

router.beforeEach((to, from) => {
  const accountStore = useAccountStore();
  const token = accountStore.token || localStorage.getItem("jwt_token");
  const hasToken = token && token.length > 0;

  // 排除登录页
  if (to.path === "/login") {
    return true;
  }

  // 其他页面都需要登录
  if (!hasToken) {
    return { path: "/login" };
  } else {
    return true;
  }
});

export default router;
