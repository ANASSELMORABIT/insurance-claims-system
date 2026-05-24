import { describe, it, expect, vi, beforeEach } from "vitest";
import { claimsService } from "../../services/claimsService";
import api from "../../utils/axiosInstance";

vi.mock("../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const mockClaim = {
  id: 1,
  title: "Test Claim",
  description: "Test description",
  type: "Auto",
  status: "Pending",
  incidentDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  estimatedAmount: 2500,
  policyId: 1,
  policyNumber: "POL-001",
  clientId: "user-001",
  clientName: "Test User",
  documentCount: 0,
  statusHistory: [],
};

describe("claimsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll should call GET /claims with params", async () => {
    const mockResponse = {
      data: { items: [mockClaim], totalCount: 1, page: 1, pageSize: 10, totalPages: 1 },
    };
    mockApi.get.mockResolvedValueOnce(mockResponse);

    const result = await claimsService.getAll({ page: 1, pageSize: 10 });

    expect(mockApi.get).toHaveBeenCalledWith("/claims", { params: { page: 1, pageSize: 10 } });
    expect(result.items).toHaveLength(1);
    expect(result.totalCount).toBe(1);
  });

  it("getById should call GET /claims/:id", async () => {
    mockApi.get.mockResolvedValueOnce({ data: mockClaim });

    const result = await claimsService.getById(1);

    expect(mockApi.get).toHaveBeenCalledWith("/claims/1");
    expect(result.id).toBe(1);
    expect(result.title).toBe("Test Claim");
  });

  it("create should call POST /claims", async () => {
    mockApi.post.mockResolvedValueOnce({ data: mockClaim });

    const newClaim = {
      title: "Test Claim",
      description: "Test",
      type: 1,
      incidentDate: new Date().toISOString(),
      policyId: 1,
      clientId: "user-001",
    };

    await claimsService.create(newClaim);

    expect(mockApi.post).toHaveBeenCalledWith("/claims", newClaim);
  });

  it("updateStatus should call PATCH /claims/:id/status", async () => {
    mockApi.patch.mockResolvedValueOnce({ data: { ...mockClaim, status: "Approved" } });

    const result = await claimsService.updateStatus(1, { status: 3, comment: "Approved" });

    expect(mockApi.patch).toHaveBeenCalledWith("/claims/1/status", { status: 3, comment: "Approved" });
    expect(result.status).toBe("Approved");
  });

  it("delete should call DELETE /claims/:id", async () => {
    mockApi.delete.mockResolvedValueOnce({ data: null });

    await claimsService.delete(1);

    expect(mockApi.delete).toHaveBeenCalledWith("/claims/1");
  });
});