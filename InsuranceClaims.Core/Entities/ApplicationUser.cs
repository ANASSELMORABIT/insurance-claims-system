using Microsoft.AspNetCore.Identity;

namespace InsuranceClaims.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Claim> ClientClaims { get; set; } = new List<Claim>();
    public ICollection<Claim> AgentClaims { get; set; } = new List<Claim>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}