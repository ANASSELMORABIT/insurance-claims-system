namespace InsuranceClaims.Core.DTOs.Auth;

public class ProfileStatsDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public int TotalClaims { get; set; }
    public int TotalDocuments { get; set; }
    public int PendingClaims { get; set; }
    public int ApprovedClaims { get; set; }
}