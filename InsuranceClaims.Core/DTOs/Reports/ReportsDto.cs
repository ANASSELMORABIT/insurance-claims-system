namespace InsuranceClaims.Core.DTOs.Reports;

public class ReportsOverviewDto
{
    public int TotalClaimsThisMonth { get; set; }
    public int TotalClaimsLastMonth { get; set; }
    public double ClaimsGrowthPct { get; set; }
    public decimal TotalAmountThisMonth { get; set; }
    public decimal TotalAmountLastMonth { get; set; }
    public double AmountGrowthPct { get; set; }
    public double AvgResolutionDays { get; set; }
    public double ResolutionDaysChange { get; set; }
    public int OpenClaims { get; set; }
    public int ResolvedThisMonth { get; set; }
    public List<MonthlyTrendDto> MonthlyTrend { get; set; } = new();
    public List<AgentPerformanceDto> AgentPerformance { get; set; } = new();
    public List<ClaimTypeCostDto> CostByType { get; set; } = new();
    public List<DailyActivityDto> DailyActivity { get; set; } = new();
    public List<TopClaimDto> TopCostlyClaims { get; set; } = new();
    public StatusDistributionDto StatusDistribution { get; set; } = new();
}

public class MonthlyTrendDto
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Created { get; set; }
    public int Resolved { get; set; }
    public decimal TotalAmount { get; set; }
}

public class AgentPerformanceDto
{
    public string AgentId { get; set; } = string.Empty;
    public string AgentName { get; set; } = string.Empty;
    public int TotalAssigned { get; set; }
    public int Resolved { get; set; }
    public int Pending { get; set; }
    public double AvgResolutionDays { get; set; }
    public decimal TotalAmountHandled { get; set; }
    public double ResolutionRate { get; set; }
}

public class ClaimTypeCostDto
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal AvgAmount { get; set; }
}

public class DailyActivityDto
{
    public string Day { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopClaimDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}

public class StatusDistributionDto
{
    public int Pending { get; set; }
    public int UnderReview { get; set; }
    public int Approved { get; set; }
    public int Rejected { get; set; }
    public int Closed { get; set; }
}