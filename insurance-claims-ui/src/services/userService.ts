import api from "../utils/axiosInstance";

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  totalClaims: number;
  totalDocuments: number;
}

export interface PagedUsers {
  items: UserResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const userService = {
  getAll: async (params?: object): Promise<PagedUsers> => {
    const res = await api.get("/users", { params });
    return res.data;
  },
  getById: async (id: string): Promise<UserResponse> => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  create: async (data: object): Promise<UserResponse> => {
    const res = await api.post("/users", data);
    return res.data;
  },
  update: async (id: string, data: object): Promise<UserResponse> => {
    const res = await api.put(`/users/${id}`, data);
    return res.data;
  },
  toggleActive: async (id: string): Promise<UserResponse> => {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data;
  },
};