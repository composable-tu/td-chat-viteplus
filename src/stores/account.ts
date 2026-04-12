import { defineStore } from "pinia";
import { ref } from "vue";

export const useAccountStore = defineStore("account", () => {
  // 初始化时从 Local Storage 获取
  const token = ref(localStorage.getItem("jwt_token") || "");

  // 设置 Token，登录时调用
  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("jwt_token", newToken); // 同步到本地
  };

  // 清除 Token，退出登录时调用
  const clearToken = () => {
    token.value = "";
    localStorage.removeItem("jwt_token");
  };

  return { token, setToken, clearToken };
});
