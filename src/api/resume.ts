import { alovaInstance, type BaseResponse } from "@/api/index.ts";

export interface ResumeOption {
  id: number;
  name: string;
}

export const getResumeListApi = () =>
  alovaInstance.Get<BaseResponse<ResumeOption[]>>("/resume/list");
