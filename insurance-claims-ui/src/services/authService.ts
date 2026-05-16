import api from "../utils/axiosInstance";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  me: async (): Promise<AuthResponse> => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};