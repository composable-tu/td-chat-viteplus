import { createAlova } from "alova";
import VueHook from "alova/vue";
import adapterFetch from "alova/fetch";
import { useAccountStore } from "@/stores/account.ts";

export const alovaInstance = createAlova({
  // 这里写 /api，Vite 自动映射到 http://localhost:8080
  baseURL: "/api",
  timeout: 5 * 60 * 1000, // AI Agent 处理时间较长，超时设为 5 分钟
  beforeRequest(method) {
    const userStore = useAccountStore(); // 获取 Store 实例
    if (userStore.token) {
      method.config.headers.Authorization = `Bearer ${userStore.token}`;
    }
  },
  statesHook: VueHook,
  requestAdapter: adapterFetch(),
  responded: {
    onSuccess: async (response) => {
      const json = await response.json();
      if (response.status >= 400) {
        throw new Error(json.message || "请求失败");
      }
      return json;
    },
  },
});

export interface BaseResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}
