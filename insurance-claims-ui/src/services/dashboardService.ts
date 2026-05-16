import api from "../utils/axiosInstance";
import type { DashboardStats } from "../types";

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/dashboard/stats");
    return res.data;
  },

  getAgentStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/dashboard/stats/agent");
    return res.data;
  },

  getClientStats: async (): Promise<DashboardStats> => {
    const res = await api.get("/dashboard/stats/client");
    return res.data;
  },
};