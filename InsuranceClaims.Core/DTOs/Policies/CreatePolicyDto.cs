namespace InsuranceClaims.Core.DTOs.Policies;

public class CreatePolicyDto
{
    public string PolicyNumber { get; set; } = string.Empty;
    public string HolderName { get; set; } = string.Empty;
    public string HolderEmail { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal CoverageAmount { get; set; }
}