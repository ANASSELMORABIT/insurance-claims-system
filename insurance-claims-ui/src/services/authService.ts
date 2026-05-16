import type { AuthResponse, LoginRequest, RegisterRequest } from "../types";
import api from "../utils/axiosInstance";

export interface ProfileStats {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  createdAt: string;
  isActive: boolean;
  totalClaims: number;
  totalDocuments: number;
  pendingClaims: number;
  approvedClaims: number;
}

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

  getProfileStats: async (): Promise<ProfileStats> => {
    const res = await api.get("/auth/profile/stats");
    return res.data;
  },

  updateProfile: async (data: { firstName: string; lastName: string; phoneNumber?: string }): Promise<ProfileStats> => {
    const res = await api.put("/auth/profile", data);
    return res.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put("/auth/change-password", data);
  },
};