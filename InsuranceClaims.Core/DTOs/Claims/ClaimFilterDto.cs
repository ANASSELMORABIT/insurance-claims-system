using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.DTOs.Claims;

public class ClaimFilterDto
{
    public ClaimStatusType? Status { get; set; }
    public ClaimType? Type { get; set; }
    public string? ClientId { get; set; }
    public string? AgentId { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}