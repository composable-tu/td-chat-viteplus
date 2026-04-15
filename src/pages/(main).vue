<script lang="ts" setup>
import { RouterView, useRoute, useRouter } from "vue-router";
import type { DropdownProps, HeadMenuProps } from "tdesign-vue-next";
import { ref } from "vue";
import { useAccountStore } from "@/stores/account.ts";

const router = useRouter();
const route = useRoute();
const accountStore = useAccountStore();

const menu1Value = ref(route.path === "/" ? "index" : route.path === "/resume" ? "resume" : "");
const changeHandler: HeadMenuProps["onChange"] = (active) => {
  if (active === "index") {
    router.push("/");
  } else if (active === "resume") {
    router.push("/resume");
  }
};

const options: DropdownProps["options"] = [
  {
    content: "退出登录",
    value: "logout",
    theme: "error",
  },
];

const clickDropdownHandler: DropdownProps["onClick"] = (data) => {
  if (data.value === "logout") {
    accountStore.clearToken();
    router.push("/login");
  }
};
</script>

<template>
  <t-layout>
    <t-header>
      <t-head-menu v-model="menu1Value" theme="light" @change="changeHandler">
        <template #logo>
          <img alt="logo" height="28" src="https://tdesign.gtimg.com/site/baseLogo-light.png" />
        </template>
        <t-menu-item value="index">模拟面试</t-menu-item>
        <t-menu-item value="resume">简历管理</t-menu-item>
        <template #operations>
          <t-dropdown :options="options" @click="clickDropdownHandler" trigger="click">
            <t-button shape="square" variant="text">
              <template #icon>
                <t-icon name="user" />
              </template>
            </t-button>
          </t-dropdown>
        </template>
      </t-head-menu>
    </t-header>
    <t-content>
      <RouterView />
    </t-content>
  </t-layout>
</template>

<style lang="less" scoped>
.t-menu__operations {
  .t-button {
    margin-left: 8px;
  }
}
</style>
