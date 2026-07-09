import { alovaInstance, type BaseResponse } from "./index";

export interface InterviewThread {
  id: string;
  createdAt: string;
}

export interface LangChainMessage {
  role: string;
  content: string;
}

export interface LangChainResponse {
  thread_id: string;
  messages: LangChainMessage[];
  has_finished: boolean;
}

export interface ChatFirstRequest {
  resume_id: number;
  interviewType: "TECH" | "POSTGRADUATE" | "CIVIL_SERVICE";
}

export interface ChatRequest {
  message: string;
}

export const getAllThreadsApi = () =>
  alovaInstance.Post<BaseResponse<InterviewThread[]>>("/interview/allThreads");

export const getChatHistoryApi = (threadId: string) =>
  alovaInstance.Get<BaseResponse<LangChainResponse>>(`/interview/history/${threadId}`);

export const chatFirstApi = (data: ChatFirstRequest) =>
  alovaInstance.Post<BaseResponse<LangChainResponse>>("/interview/chatfirst", data);
