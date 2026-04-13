<script lang="ts" setup>
import { reactive, ref } from "vue";
import type { FormProps } from "tdesign-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import { DesktopIcon, LockOnIcon } from "tdesign-icons-vue-next";
import { useRequest } from "alova/client";
import { loginApi, signupApi } from "@/api/auth.ts";
import { useAccountStore } from "@/stores/account.ts";

const accountStore = useAccountStore();
const formType = ref("login");

const { loading: loginLoading, send: sendLogin } = useRequest((data) => loginApi(data), {
  immediate: false,
});

const { loading: signupLoading, send: sendSignup } = useRequest((data) => signupApi(data), {
  immediate: false,
});

const formData: FormProps["data"] = reactive({
  account: "",
  password: "",
});

const onSubmit: FormProps["onSubmit"] = async ({ validateResult, firstError }) => {
  try {
    if (validateResult === true && formData.account && formData.password) {
      if (formType.value === "signup") {
        await sendSignup({
          account: formData.account,
          password: formData.password,
        });
        MessagePlugin.success("注册成功");
      } else {
        const res = await sendLogin({
          account: formData.account,
          password: formData.password,
        });
        accountStore.setToken(res.token);
        MessagePlugin.success("登录成功");
      }
    } else {
      console.log("Validate Errors: ", firstError, validateResult);
      MessagePlugin.error("请检查你填写的内容");
    }
  } catch (e) {
    console.error(e);
    MessagePlugin.error("操作失败");
  }
};
</script>

<template>
  <div style="width: 350px">
    <t-radio-group v-model="formType" class="tradio" variant="default-filled">
      <t-radio-button value="login">登录</t-radio-button>
      <t-radio-button value="signup">注册</t-radio-button>
    </t-radio-group>
    <t-form ref="form" :colon="true" :data="formData" :label-width="0" @submit="onSubmit">
      <t-form-item name="account">
        <t-input v-model="formData.account" clearable placeholder="请输入账户名">
          <template #prefix-icon>
            <desktop-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item name="password">
        <t-input v-model="formData.password" clearable placeholder="请输入密码" type="password">
          <template #prefix-icon>
            <lock-on-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item>
        <t-button
          block
          :loading="formType === 'login' ? loginLoading : signupLoading"
          theme="primary"
          type="submit"
          >{{ formType === "login" ? "登录" : "注册" }}
        </t-button>
      </t-form-item>
    </t-form>
  </div>
</template>

<style scoped>
.tradio {
  margin-bottom: 20px;
}
</style>
