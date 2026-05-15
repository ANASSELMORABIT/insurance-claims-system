using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.DTOs.Claims;

public class UpdateClaimDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ClaimType Type { get; set; }
    public DateTime IncidentDate { get; set; }
    public decimal? EstimatedAmount { get; set; }
    public string? AgentId { get; set; }
}