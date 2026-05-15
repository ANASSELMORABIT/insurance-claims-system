using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.Entities;

public class Claim
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ClaimType Type { get; set; }
    public ClaimStatusType Status { get; set; } = ClaimStatusType.Pending;
    public DateTime IncidentDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public decimal? EstimatedAmount { get; set; }

    // Foreign Keys
    public int PolicyId { get; set; }
    public string ClientId { get; set; } = string.Empty;
    public string? AgentId { get; set; }

    // Navigation
    public Policy Policy { get; set; } = null!;
    public ApplicationUser Client { get; set; } = null!;
    public ApplicationUser? Agent { get; set; }
    public ICollection<ClaimStatusHistory> StatusHistory { get; set; } = new List<ClaimStatusHistory>();
    public ICollection<ClaimDocument> Documents { get; set; } = new List<ClaimDocument>();
}