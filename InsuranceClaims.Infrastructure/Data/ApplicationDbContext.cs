using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    public DbSet<Claim> Claims { get; set; }
    public DbSet<ClaimStatusHistory> ClaimStatusHistories { get; set; }
    public DbSet<ClaimDocument> ClaimDocuments { get; set; }
    public DbSet<Policy> Policies { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Claim → Client (restrict delete)
        builder.Entity<Claim>()
            .HasOne(c => c.Client)
            .WithMany(u => u.ClientClaims)
            .HasForeignKey(c => c.ClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // Claim → Agent (no action)
        builder.Entity<Claim>()
            .HasOne(c => c.Agent)
            .WithMany(u => u.AgentClaims)
            .HasForeignKey(c => c.AgentId)
            .OnDelete(DeleteBehavior.NoAction);

        // ClaimStatusHistory → ChangedBy
        builder.Entity<ClaimStatusHistory>()
            .HasOne(s => s.ChangedBy)
            .WithMany()
            .HasForeignKey(s => s.ChangedById)
            .OnDelete(DeleteBehavior.NoAction);

        // ClaimDocument → UploadedBy
        builder.Entity<ClaimDocument>()
            .HasOne(d => d.UploadedBy)
            .WithMany()
            .HasForeignKey(d => d.UploadedById)
            .OnDelete(DeleteBehavior.NoAction);

        // Decimal precision
        builder.Entity<Claim>()
            .Property(c => c.EstimatedAmount)
            .HasColumnType("decimal(18,2)");

        builder.Entity<Policy>()
            .Property(p => p.CoverageAmount)
            .HasColumnType("decimal(18,2)");

        // Seed Roles
        var adminRoleId = "1";
        var agentRoleId = "2";
        var clientRoleId = "3";

        builder.Entity<IdentityRole>().HasData(
            new IdentityRole { Id = adminRoleId, Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole { Id = agentRoleId, Name = "Agent", NormalizedName = "AGENT" },
            new IdentityRole { Id = clientRoleId, Name = "Client", NormalizedName = "CLIENT" }
        );

        // Seed Admin User
        var adminId = "admin-user-id-001";
        var hasher = new PasswordHasher<ApplicationUser>();
        var admin = new ApplicationUser
        {
            Id = adminId,
            UserName = "admin@insurance.com",
            NormalizedUserName = "ADMIN@INSURANCE.COM",
            Email = "admin@insurance.com",
            NormalizedEmail = "ADMIN@INSURANCE.COM",
            FirstName = "Admin",
            LastName = "System",
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString()
        };
        admin.PasswordHash = hasher.HashPassword(admin, "Admin@1234!");

        builder.Entity<ApplicationUser>().HasData(admin);
        builder.Entity<IdentityUserRole<string>>().HasData(
            new IdentityUserRole<string> { UserId = adminId, RoleId = adminRoleId }
        );
    }
}