namespace InsuranceClaims.Core.DTOs.Dashboard;

public class DashboardStatsDto
{
    public int TotalClaims { get; set; }
    public int PendingClaims { get; set; }
    public int UnderReviewClaims { get; set; }
    public int ApprovedClaims { get; set; }
    public int RejectedClaims { get; set; }
    public int ClosedClaims { get; set; }
    public decimal TotalEstimatedAmount { get; set; }
    public decimal AverageEstimatedAmount { get; set; }
    public int TotalDocuments { get; set; }
    public int TotalClients { get; set; }
    public int TotalAgents { get; set; }
    public List<ClaimsByTypeDto> ClaimsByType { get; set; } = new();
    public List<ClaimsByMonthDto> ClaimsByMonth { get; set; } = new();
    public List<RecentClaimDto> RecentClaims { get; set; } = new();
}

public class ClaimsByTypeDto
{
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

public class ClaimsByMonthDto
{
    public string Month { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Count { get; set; }
    public decimal TotalAmount { get; set; }
}

public class RecentClaimDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public decimal? EstimatedAmount { get; set; }
}