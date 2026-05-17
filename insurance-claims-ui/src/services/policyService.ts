import api from "../utils/axiosInstance";

export interface PolicyResponse {
  id: number;
  policyNumber: string;
  holderName: string;
  holderEmail: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  coverageAmount: number;
  totalClaims: number;
  isExpired: boolean;
}

export interface PagedPolicies {
  items: PolicyResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const policyService = {
  getAll: async (params?: object): Promise<PagedPolicies> => {
    const res = await api.get("/policies", { params });
    return res.data;
  },
  getById: async (id: number): Promise<PolicyResponse> => {
    const res = await api.get(`/policies/${id}`);
    return res.data;
  },
  create: async (data: object): Promise<PolicyResponse> => {
    const res = await api.post("/policies", data);
    return res.data;
  },
  update: async (id: number, data: object): Promise<PolicyResponse> => {
    const res = await api.put(`/policies/${id}`, data);
    return res.data;
  },
  toggle: async (id: number): Promise<PolicyResponse> => {
    const res = await api.patch(`/policies/${id}/toggle`);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/policies/${id}`);
  },
};