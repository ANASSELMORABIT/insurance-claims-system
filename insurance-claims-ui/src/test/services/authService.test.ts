import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../../services/authService";
import api from "../../utils/axiosInstance";

vi.mock("../../utils/axiosInstance", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockApi = api as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call POST /auth/login with credentials", async () => {
      const mockResponse = {
        data: {
          token: "fake-jwt-token",
          email: "admin@insurance.com",
          firstName: "Admin",
          lastName: "System",
          role: "Admin",
          expiresAt: new Date().toISOString(),
        },
      };
      mockApi.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login({
        email: "admin@insurance.com",
        password: "Admin@1234!",
      });

      expect(mockApi.post).toHaveBeenCalledWith("/auth/login", {
        email: "admin@insurance.com",
        password: "Admin@1234!",
      });
      expect(result.token).toBe("fake-jwt-token");
      expect(result.role).toBe("Admin");
    });

    it("should throw when API returns error", async () => {
      mockApi.post.mockRejectedValueOnce(new Error("Unauthorized"));

      await expect(
        authService.login({ email: "wrong@test.com", password: "wrong" })
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getProfileStats", () => {
    it("should call GET /auth/profile/stats", async () => {
      const mockStats = {
        data: {
          id: "user-001",
          firstName: "Admin",
          lastName: "System",
          email: "admin@insurance.com",
          role: "Admin",
          totalClaims: 5,
          totalDocuments: 3,
          pendingClaims: 2,
          approvedClaims: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      };
      mockApi.get.mockResolvedValueOnce(mockStats);

      const result = await authService.getProfileStats();

      expect(mockApi.get).toHaveBeenCalledWith("/auth/profile/stats");
      expect(result.firstName).toBe("Admin");
      expect(result.totalClaims).toBe(5);
    });
  });

  describe("updateProfile", () => {
    it("should call PUT /auth/profile with data", async () => {
      const mockResponse = { data: { firstName: "Updated" } };
      mockApi.put.mockResolvedValueOnce(mockResponse);

      await authService.updateProfile({
        firstName: "Updated",
        lastName: "Name",
      });

      expect(mockApi.put).toHaveBeenCalledWith("/auth/profile", {
        firstName: "Updated",
        lastName: "Name",
      });
    });
  });
});