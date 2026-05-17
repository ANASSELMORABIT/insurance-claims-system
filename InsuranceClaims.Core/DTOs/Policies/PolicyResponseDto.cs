namespace InsuranceClaims.Core.DTOs.Policies;

public class PolicyResponseDto
{
    public int Id { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string HolderName { get; set; } = string.Empty;
    public string HolderEmail { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public decimal CoverageAmount { get; set; }
    public int TotalClaims { get; set; }
    public bool IsExpired => EndDate < DateTime.UtcNow;
}