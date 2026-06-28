<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ChatAddIcon, RefreshIcon } from "tdesign-icons-vue-next";
import { MessagePlugin } from "tdesign-vue-next";
import { Chatbot, type ChatRequestParams, type ChatServiceConfig } from "@tdesign-vue-next/chat";
import {
  chatFirstApi,
  type ChatFirstRequest,
  type ChatRequest,
  getAllThreadsApi,
  getChatHistoryApi,
  type InterviewThread,
  type LangChainMessage,
} from "@/api/interview";
import { getResumeListApi, type ResumeOption } from "@/api/resume.ts";
import { useAccountStore } from "@/stores/account.ts";

const route = useRoute();
const router = useRouter();

const threads = ref<InterviewThread[]>([]);
const activeThreadId = ref((route.query.chatId as string) || "");
const threadsLoading = ref(false);
const chatHistoryLoading = ref(false);
const chatbotRef = ref<InstanceType<typeof Chatbot>>();
const hasFinished = ref(false);
const sendingMessage = ref(false);

const chatServiceConfig = computed((): ChatServiceConfig | undefined => {
  if (!activeThreadId.value) return undefined;
  const userStore = useAccountStore();
  return {
    stream: false,
    endpoint: `/api/interview/chat/${activeThreadId.value}`,
    onRequest: (params: ChatRequestParams) => {
      sendingMessage.value = true;
      return {
        body: JSON.stringify({ message: params.prompt } as ChatRequest),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userStore.token}`,
        },
      };
    },
    onComplete: (_aborted: boolean, _req, data) => {
      sendingMessage.value = false;
      const response = data?.data;
      if (!response?.messages) return [];
      hasFinished.value = !!response.has_finished;
      const messages = response.messages;
      const lastUserIdx = messages
        .map((m: LangChainMessage) => m.role as string)
        .lastIndexOf("human");
      return messages.slice(lastUserIdx + 1).map((m: LangChainMessage) => {
        if (m.role === "tool") {
          return {
            type: "thinking" as const,
            data: { text: m.content, title: "工具调用" },
            status: "complete" as const,
            ext: { collapsed: true },
          };
        }
        return { type: "text" as const, data: m.content };
      });
    },
  };
});

const createNewChatVisible = ref(false);
const chatCreating = ref(false);
const resumeList = ref<ResumeOption[]>([]);

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
  chatCreating.value = true;
  try {
    const res = await getResumeListApi();
    resumeList.value = (res.data || []).map((r) => ({ id: r.id, name: r.name }));
  } catch (e: any) {
    MessagePlugin.error("获取简历列表失败");
  } finally {
    chatCreating.value = false;
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
  chatCreating.value = true;
  try {
    const res = await chatFirstApi(formData.value);
    if (!res.data) throw new Error("创建失败：返回数据为空");
    MessagePlugin.success("新建成功");
    createNewChatVisible.value = false;
    activeThreadId.value = res.data.thread_id;
  } catch (e: any) {
    MessagePlugin.error(e.message || "新建失败");
  } finally {
    chatCreating.value = false;
    fetchThreads();
  }
};

const handleDialogClose = () => {
  formData.value = { resume_id: undefined as unknown as number, interviewType: "TECH" };
};

const fetchThreads = async () => {
  threadsLoading.value = true;
  try {
    const res = await getAllThreadsApi();
    threads.value = (res.data || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    MessagePlugin.error("获取对话列表失败");
  } finally {
    threadsLoading.value = false;
  }
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const senderProps = computed(() => ({
  disabled: hasFinished.value,
  placeholder: hasFinished.value ? "当前面试已结束" : "请输入文本…",
  loading: false,
  sendBtnDisabled: sendingMessage.value,
}));

const fetchChatHistory = async (threadId: string) => {
  if (!threadId) {
    chatbotRef.value?.setMessages([], "replace");
    return;
  }
  chatHistoryLoading.value = true;
  try {
    const res = await getChatHistoryApi(threadId);
    hasFinished.value = !!res.data?.has_finished;
    if (res.data?.messages) {
      chatbotRef.value?.setMessages(
        res.data.messages.map((msg, index) => ({
          role: (msg.role === "human"
            ? "user"
            : msg.role === "tool"
              ? "assistant"
              : "assistant") as "user" | "assistant",
          content:
            msg.role === "tool"
              ? [
                  {
                    type: "thinking" as const,
                    data: { text: msg.content, title: "工具调用" },
                    status: "complete" as const,
                    ext: { collapsed: true },
                  },
                ]
              : [{ type: "text" as const, data: msg.content }],
          id: `${threadId}-${index}`,
        })),
        "replace",
      );
    }
  } catch {
    MessagePlugin.error("获取对话历史失败");
  } finally {
    chatHistoryLoading.value = false;
  }
};

// 对话线程 ID 映射到网址栏
watch(activeThreadId, (id) => {
  const query = id ? { chatId: id } : {};
  router.replace({ query });
});

watch(
  () => route.query.chatId,
  (chatId) => {
    if (chatId && chatId !== activeThreadId.value) {
      activeThreadId.value = chatId as string;
    }
  },
);

watch(activeThreadId, (id) => {
  fetchChatHistory(id);
});

onMounted(() => {
  fetchThreads();
  if (activeThreadId.value) {
    fetchChatHistory(activeThreadId.value);
  }
});
</script>

<template>
  <div class="page-wrapper">
    <t-layout style="height: 100%; display: flex">
      <t-aside>
        <t-menu :value="activeThreadId">
          <div class="aside-header">
            <t-button theme="primary" @click="createNewChatVisible = true">
              <template #icon>
                <chat-add-icon />
              </template>
              新建
            </t-button>
            <t-button
              :disabled="threadsLoading"
              :loading="threadsLoading"
              shape="square"
              theme="primary"
              variant="outline"
              @click="fetchThreads"
            >
              <template v-if="!threadsLoading" #icon>
                <refresh-icon />
              </template>
            </t-button>
          </div>
          <t-menu-item
            v-for="thread in threads"
            :key="thread.id"
            :value="thread.id"
            @click="activeThreadId = thread.id"
          >
            {{ formatTime(thread.createdAt) }}
          </t-menu-item>
        </t-menu>
      </t-aside>
      <t-layout>
        <t-chatbot
          :key="activeThreadId"
          ref="chatbotRef"
          :chat-service-config="chatServiceConfig"
          :sender-props="senderProps"
          :text-loading="chatHistoryLoading"
          class="chatbot"
        />
      </t-layout>
    </t-layout>
  </div>

  <t-dialog
    v-model:visible="createNewChatVisible"
    :close-on-overlay-click="!chatCreating"
    :confirmLoading="chatCreating"
    :on-close="handleDialogClose"
    :on-confirm="handleCreateChat"
    header="新建模拟面试"
  >
    <t-form label-align="top" style="padding: 0 2px">
      <t-form-item label="面试类型">
        <t-radio-group v-model="formData.interviewType" :options="interviewTypeOptions" />
      </t-form-item>
      <t-form-item label="选择简历">
        <t-select
          v-model="formData.resume_id"
          :disabled="chatCreating"
          :loading="chatCreating"
          :options="resumeList.map((r) => ({ label: r.name, value: r.id }))"
          :placeholder="resumeList.length > 0 ? '请选择简历' : '请先在简历管理页上传简历'"
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
  box-sizing: border-box;
  padding: 0 24px 24px 24px;
  overflow: hidden;

  :deep(.t-chat-list) {
    padding: 0 0 24px 0;
  }
}

.aside-header {
  display: flex;
  gap: 4px;

  .t-button:first-child {
    flex: 1;
  }
}
</style>
