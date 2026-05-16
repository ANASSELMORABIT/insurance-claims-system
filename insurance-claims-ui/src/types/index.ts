export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface Claim {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  incidentDate: string;
  createdAt: string;
  updatedAt?: string;
  estimatedAmount?: number;
  policyId: number;
  policyNumber: string;
  clientId: string;
  clientName: string;
  agentId?: string;
  agentName?: string;
  documentCount: number;
  statusHistory: StatusHistory[];
}

export interface StatusHistory {
  id: number;
  status: string;
  comment: string;
  changedAt: string;
  changedBy: string;
}

export interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileSizeFormatted: string;
  uploadedAt: string;
  uploadedBy: string;
  claimId: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface DashboardStats {
  totalClaims: number;
  pendingClaims: number;
  underReviewClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  closedClaims: number;
  totalEstimatedAmount: number;
  averageEstimatedAmount: number;
  totalDocuments: number;
  totalClients: number;
  totalAgents: number;
  claimsByType: ClaimsByType[];
  claimsByMonth: ClaimsByMonth[];
  recentClaims: RecentClaim[];
}

export interface ClaimsByType {
  type: string;
  count: number;
  percentage: number;
}

export interface ClaimsByMonth {
  month: string;
  year: number;
  count: number;
  totalAmount: number;
}

export interface RecentClaim {
  id: number;
  title: string;
  type: string;
  status: string;
  clientName: string;
  createdAt: string;
  estimatedAmount?: number;
}