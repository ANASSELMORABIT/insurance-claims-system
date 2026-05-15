using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.DTOs.Claims;

public class ClaimResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime IncidentDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public decimal? EstimatedAmount { get; set; }
    public int PolicyId { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string ClientId { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string? AgentId { get; set; }
    public string? AgentName { get; set; }
    public List<ClaimStatusHistoryDto> StatusHistory { get; set; } = new();
    public int DocumentCount { get; set; }
}

public class ClaimStatusHistoryDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
}