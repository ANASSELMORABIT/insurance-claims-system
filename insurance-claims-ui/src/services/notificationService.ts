import api from "../utils/axiosInstance";

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedUrl?: string;
}

export const notificationService = {
  getAll: async (): Promise<NotificationResponse[]> => {
    const res = await api.get("/notifications");
    return res.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const res = await api.get("/notifications/unread-count");
    return res.data.count;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};