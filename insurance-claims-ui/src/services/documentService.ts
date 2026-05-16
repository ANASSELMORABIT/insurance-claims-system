import api from "../utils/axiosInstance";
import type { Document } from "../types";

export const documentService = {
  getByClaimId: async (claimId: number): Promise<Document[]> => {
    const res = await api.get(`/claims/${claimId}/documents`);
    return res.data;
  },

  upload: async (claimId: number, file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post(`/claims/${claimId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  download: async (documentId: number): Promise<Blob> => {
    const res = await api.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  delete: async (documentId: number): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },
};