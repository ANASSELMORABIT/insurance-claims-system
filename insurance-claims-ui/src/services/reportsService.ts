import api from "../utils/axiosInstance";

export interface ReportsOverview {
  totalClaimsThisMonth: number;
  totalClaimsLastMonth: number;
  claimsGrowthPct: number;
  totalAmountThisMonth: number;
  totalAmountLastMonth: number;
  amountGrowthPct: number;
  avgResolutionDays: number;
  resolutionDaysChange: number;
  openClaims: number;
  resolvedThisMonth: number;
  monthlyTrend: MonthlyTrend[];
  agentPerformance: AgentPerformance[];
  costByType: ClaimTypeCost[];
  dailyActivity: DailyActivity[];
  topCostlyClaims: TopClaim[];
  statusDistribution: StatusDistribution;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  created: number;
  resolved: number;
  totalAmount: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalAssigned: number;
  resolved: number;
  pending: number;
  avgResolutionDays: number;
  totalAmountHandled: number;
  resolutionRate: number;
}

export interface ClaimTypeCost {
  type: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
}

export interface DailyActivity {
  day: string;
  count: number;
}

export interface TopClaim {
  id: number;
  title: string;
  type: string;
  status: string;
  clientName: string;
  amount: number;
}

export interface StatusDistribution {
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  closed: number;
}

export const reportsService = {
  getOverview: async (): Promise<ReportsOverview> => {
    const res = await api.get("/reports/overview");
    return res.data;
  },
};