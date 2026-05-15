namespace InsuranceClaims.Core.Entities;

public class ClaimDocument
{
    public int Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string FileType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Foreign Keys
    public int ClaimId { get; set; }
    public string UploadedById { get; set; } = string.Empty;

    // Navigation
    public Claim Claim { get; set; } = null!;
    public ApplicationUser UploadedBy { get; set; } = null!;
}