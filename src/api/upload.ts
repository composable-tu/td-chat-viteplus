import { alovaInstance, type BaseResponse } from "@/api/index.ts";

export const uploadResumeApi = (file: File, name: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);

  return alovaInstance.Post<BaseResponse>("/resume/upload", formData, {
    headers: {
      "Content-Type": undefined, // 浏览器自动设置 multipart/form-data
    },
  });
};
