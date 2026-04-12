<script setup lang="ts">
import { reactive, ref } from "vue";
import { MessagePlugin } from "tdesign-vue-next";
import { DesktopIcon, LockOnIcon } from "tdesign-icons-vue-next";
import type { FormProps } from "tdesign-vue-next";

const formType = ref("login");

const formData: FormProps["data"] = reactive({
  account: "",
  password: "",
});
const onReset: FormProps["onReset"] = () => {
  MessagePlugin.success("重置成功");
};
const onSubmit: FormProps["onSubmit"] = ({ validateResult, firstError }) => {
  if (validateResult === true) {
    MessagePlugin.success("提交成功");
  } else {
    console.log("Validate Errors: ", firstError, validateResult);
    MessagePlugin.warning(firstError);
  }
};
</script>

<template>
  <div style="width: 350px">
    <t-radio-group class="tradio" v-model="formType" variant="default-filled">
      <t-radio-button value="login">登录</t-radio-button>
      <t-radio-button value="signup">注册</t-radio-button>
    </t-radio-group>
    <t-form
      ref="form"
      :data="formData"
      :colon="true"
      :label-width="0"
      @reset="onReset"
      @submit="onSubmit"
    >
      <t-form-item name="account">
        <t-input v-model="formData.account" clearable placeholder="请输入账户名">
          <template #prefix-icon>
            <desktop-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item name="password">
        <t-input v-model="formData.password" type="password" clearable placeholder="请输入密码">
          <template #prefix-icon>
            <lock-on-icon />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit" block>{{
          formType === "login" ? "登录" : "注册"
        }}</t-button>
      </t-form-item>
    </t-form>
  </div>
</template>

<style scoped>
.tradio {
  margin-bottom: 20px;
}
</style>
