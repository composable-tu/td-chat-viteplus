<script setup lang="ts">
import { ref, watch } from "vue";
import { ChatAddIcon } from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import { chatFirstApi, type ChatFirstRequest } from "@/api/interview";
import { getResumeListApi, type ResumeOption } from "@/api/resume.ts";

const createNewChatVisible = ref(false);
const loading = ref(false);
const resumeList = ref<ResumeOption[]>([]);
const resumeLoading = ref(false);

const formData = ref<ChatFirstRequest>({
  resume_id: undefined as unknown as number,
  interviewType: "TECH",
});

const interviewTypeOptions = [
  { label: "技术岗", value: "TECH" },
  { label: "考研复试", value: "POSTGRADUATE" },
  { label: "公务员", value: "CIVIL_SERVICE" },
];

const fetchResumeList = async () => {
  resumeLoading.value = true;
  try {
    const res = await getResumeListApi();
    resumeList.value = (res.data || []).map((r) => ({ id: r.id, name: r.name }));
  } catch (e: any) {
    MessagePlugin.error("获取简历列表失败");
  } finally {
    resumeLoading.value = false;
  }
};

watch(createNewChatVisible, (visible) => {
  if (visible) fetchResumeList();
});

const handleCreateChat = async () => {
  if (!formData.value.resume_id) {
    MessagePlugin.warning("请选择简历");
    return;
  }
  loading.value = true;
  try {
    const res = await chatFirstApi(formData.value);
    MessagePlugin.success("新建成功");
    createNewChatVisible.value = false;
    console.log(res);
  } catch (e: any) {
    MessagePlugin.error(e.message || "新建失败");
  } finally {
    loading.value = false;
  }
};

const handleDialogClose = () => {
  formData.value = { resume_id: undefined as unknown as number, interviewType: "TECH" };
};
</script>

<template>
  <div class="page-wrapper">
    <t-layout style="height: 100%; display: flex">
      <t-aside>
        <t-menu>
          <t-button block theme="primary" @click="createNewChatVisible = true">
            <template #icon>
              <chat-add-icon />
            </template>
            新建
          </t-button>
          <t-menu-item :value="`temp-id-${i}`" v-for="i in 5">
            {{ `占位历史对话 ${i}` }}
          </t-menu-item>
        </t-menu>
      </t-aside>
      <t-layout>
        <t-chatbot class="chatbot" />
      </t-layout>
    </t-layout>
  </div>

  <t-dialog
    v-model:visible="createNewChatVisible"
    header="新建模拟面试"
    :on-confirm="handleCreateChat"
    :on-close="handleDialogClose"
    :close-on-overlay-click="!loading"
  >
    <t-form label-align="top" style="padding: 0 2px">
      <t-form-item label="面试类型">
        <t-radio-group v-model="formData.interviewType" :options="interviewTypeOptions" />
      </t-form-item>
      <t-form-item label="选择简历">
        <t-select
          v-model="formData.resume_id"
          :options="resumeList.map((r) => ({ label: r.name, value: r.id }))"
          :loading="resumeLoading"
          :placeholder="resumeList.length > 0 ? '请选择简历' : '请先在简历管理页上传简历'"
          :disabled="resumeLoading"
          style="width: 100%"
        />
      </t-form-item>
    </t-form>
  </t-dialog>
</template>

<style scoped>
.page-wrapper {
  height: calc(100vh - var(--td-comp-size-xxxl, 56px));
  display: flex;
  overflow: hidden;
}

.chatbot {
  height: 100%;
  display: flex;
  padding: 0 24px 24px 24px;
}
</style>
