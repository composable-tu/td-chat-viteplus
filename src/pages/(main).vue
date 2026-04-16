<script lang="ts" setup>
import { RouterView, useRoute, useRouter } from "vue-router";
import {
  type DropdownProps,
  type HeadMenuProps,
  type RequestMethodResponse,
  type UploadFile,
  type UploadProps,
} from "tdesign-vue-next";
import { ref } from "vue";
import { useAccountStore } from "@/stores/account.ts";
import { CloudUploadIcon } from "tdesign-icons-vue-next";
import { uploadResumeApi } from "@/api/upload.ts";

const router = useRouter();
const route = useRoute();
const accountStore = useAccountStore();

const uploadResumeVisible = ref(false);

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

const openUploadResumeDrawer = () => {
  uploadResumeVisible.value = true;
};

const onClickUpload = () => {
  uploadResumeVisible.value = false;
};

const files = ref<UploadProps["value"]>([]);
const uploadResumeRequest = async (files: UploadFile[]): Promise<RequestMethodResponse> => {
  try {
    const file = files[0];
    console.log(file);
    if (!file || !file.raw || !file.name) {
      return {
        status: "fail",
        error: "文件不存在",
        response: {},
      };
    }

    const response = await uploadResumeApi(file.raw, file.name);
    return {
      status: "success",
      response: {
        message: response.message,
      },
    };
  } catch (error: any) {
    return {
      status: "fail",
      error: error.message || "上传失败",
      response: {},
    };
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
          <t-button v-if="route.path === '/resume'" theme="primary" @click="openUploadResumeDrawer">
            <template #icon>
              <cloud-upload-icon />
            </template>
            上传简历
          </t-button>
          <t-dropdown :options="options" trigger="click" @click="clickDropdownHandler">
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
  <t-drawer
    v-model:visible="uploadResumeVisible"
    :close-btn="true"
    :on-confirm="onClickUpload"
    confirmBtn="确定"
    size="large"
  >
    <template #header>上传简历</template>
    <t-upload
      v-model="files"
      :abridge-name="[10, 8]"
      :allow-upload-duplicate-file="false"
      :auto-upload="true"
      :is-batch-upload="false"
      :max="10"
      :request-method="uploadResumeRequest"
      :show-thumbnail="false"
      :upload-all-files-in-one-request="false"
      multiple
      placeholder="支持批量上传文件，文件格式不限，最多只能上传 10 份文件"
      theme="file-flow"
    ></t-upload>
  </t-drawer>
</template>

<style lang="less" scoped>
.t-menu__operations {
  .t-button {
    margin-left: 8px;
  }
}
</style>
