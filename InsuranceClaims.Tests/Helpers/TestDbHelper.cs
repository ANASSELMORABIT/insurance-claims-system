using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Enums;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Tests.Helpers;

public static class TestDbHelper
{
    public static ApplicationDbContext CreateInMemoryDb(string dbName = "TestDb")
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: dbName + Guid.NewGuid())
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    public static ApplicationUser CreateUser(
        string id = "user-001",
        string firstName = "Test",
        string lastName = "User",
        string email = "test@test.com",
        bool isActive = true)
    {
        return new ApplicationUser
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            UserName = email,
            NormalizedEmail = email.ToUpper(),
            NormalizedUserName = email.ToUpper(),
            EmailConfirmed = true,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            SecurityStamp = Guid.NewGuid().ToString(),
            PasswordHash = new PasswordHasher<ApplicationUser>()
                .HashPassword(null!, "Test@1234!"),
        };
    }

    public static Policy CreatePolicy(
        int id = 1,
        string policyNumber = "POL-001",
        bool isActive = true)
    {
        return new Policy
        {
            Id = id,
            PolicyNumber = policyNumber,
            HolderName = "Test Holder",
            HolderEmail = "holder@test.com",
            StartDate = DateTime.UtcNow.AddMonths(-6),
            EndDate = DateTime.UtcNow.AddMonths(6),
            IsActive = isActive,
            CoverageAmount = 50000,
        };
    }

    public static Core.Entities.Claim CreateClaim(
        int id = 1,
        string clientId = "user-001",
        string? agentId = null,
        int policyId = 1,
        ClaimStatusType status = ClaimStatusType.Pending)
    {
        return new Core.Entities.Claim
        {
            Id = id,
            Title = "Test Claim",
            Description = "Test description",
            Type = ClaimType.Auto,
            Status = status,
            IncidentDate = DateTime.UtcNow.AddDays(-10),
            CreatedAt = DateTime.UtcNow,
            EstimatedAmount = 2500,
            PolicyId = policyId,
            ClientId = clientId,
            AgentId = agentId,
        };
    }
}