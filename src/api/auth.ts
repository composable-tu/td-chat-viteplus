import { alovaInstance } from "./index";

export interface AuthRequest {
  account: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: number;
    username: string;
  };
}

// 登录接口：输入为 AuthRequest，输出为 LoginResponse
export const loginApi = (data: AuthRequest) => alovaInstance.Post<LoginResponse>("/login", data);

// 注册接口：输入为 AuthRequest，200 OK 就算注册成功
export const signupApi = (data: AuthRequest) => alovaInstance.Post("/signup", data);
