namespace InsuranceClaims.Core.Entities;

public class Policy
{
    public int Id { get; set; }
    public string PolicyNumber { get; set; } = string.Empty;
    public string HolderName { get; set; } = string.Empty;
    public string HolderEmail { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
    public decimal CoverageAmount { get; set; }

    // Navigation
    public ICollection<Claim> Claims { get; set; } = new List<Claim>();
}