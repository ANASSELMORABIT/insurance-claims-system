import api from "../utils/axiosInstance";
import type { Claim, PagedResult } from "../types";

export const claimsService = {
  getAll: async (params?: object): Promise<PagedResult<Claim>> => {
    const res = await api.get("/claims", { params });
    return res.data;
  },

  getById: async (id: number): Promise<Claim> => {
    const res = await api.get(`/claims/${id}`);
    return res.data;
  },

  getMyClaims: async (params?: object): Promise<PagedResult<Claim>> => {
    const res = await api.get("/claims/my", { params });
    return res.data;
  },

  create: async (data: object): Promise<Claim> => {
    const res = await api.post("/claims", data);
    return res.data;
  },

  update: async (id: number, data: object): Promise<Claim> => {
    const res = await api.put(`/claims/${id}`, data);
    return res.data;
  },

  updateStatus: async (id: number, data: object): Promise<Claim> => {
    const res = await api.patch(`/claims/${id}/status`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/claims/${id}`);
  },
};