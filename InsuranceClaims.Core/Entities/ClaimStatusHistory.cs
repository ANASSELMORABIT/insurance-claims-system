using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.Entities;

public class ClaimStatusHistory
{
    public int Id { get; set; }
    public ClaimStatusType Status { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string ChangedById { get; set; } = string.Empty;

    // Foreign Keys
    public int ClaimId { get; set; }

    // Navigation
    public Claim Claim { get; set; } = null!;
    public ApplicationUser ChangedBy { get; set; } = null!;
}