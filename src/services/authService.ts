import apiClient from "./apiClient";
import { setCookie, deleteCookie } from "../utils/cookie";

export interface SignUpData {
  name: string;
  email: string;
  password?: string;
  companyName?: string;
}

export interface LogInData {
  email: string;
  password?: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  companyId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export const signUp = async (data: SignUpData) => {
  const response = await apiClient.post("/auth/signup", data);
  return response.data;
};

export const login = async (data: LogInData): Promise<AuthResponse> => {
  const response = await apiClient.post("/auth/login", data);
  const { accessToken, user } = response.data;
  
  // Store accessToken in cookie so apiClient request interceptor can read it
  setCookie("access_token", accessToken, 1);
  // Also store in localStorage for compatibility with other clients/components
  localStorage.setItem("token", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  
  return response.data;
};

export const logout = async () => {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    deleteCookie("access_token");
    deleteCookie("refresh_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

export const getCurrentUser = (): UserResponse | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};
