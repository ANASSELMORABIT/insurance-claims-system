using FluentAssertions;
using InsuranceClaims.Core.DTOs.Claims;
using InsuranceClaims.Core.Enums;
using InsuranceClaims.Infrastructure.Services;
using InsuranceClaims.Tests.Helpers;
using Moq;
using InsuranceClaims.Core.Interfaces;

namespace InsuranceClaims.Tests.Services;

public class ClaimServiceTests
{
    private ClaimService CreateService(
        Microsoft.EntityFrameworkCore.DbContext? ctx = null,
        IEmailService? emailService = null,
        INotificationService? notificationService = null,
        IAgentAssignmentService? assignmentService = null)
    {
        var context = (ctx as InsuranceClaims.Infrastructure.Data.ApplicationDbContext)
            ?? TestDbHelper.CreateInMemoryDb();
        var email = emailService ?? Mock.Of<IEmailService>();
        var notifications = notificationService ?? Mock.Of<INotificationService>();
        var assignment = assignmentService ?? Mock.Of<IAgentAssignmentService>();
        return new ClaimService(context, email, notifications, assignment);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrow_WhenClaimNotFound()
    {
        // Arrange
        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.GetByIdAsync(999))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*999*");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnEmpty_WhenNoClaims()
    {
        // Arrange
        var service = CreateService();
        var filter = new ClaimFilterDto { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetAllAsync(filter);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }

    [Fact]
    public async Task GetAllAsync_ShouldFilterByStatus()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var client = TestDbHelper.CreateUser("client-001");
        var policy = TestDbHelper.CreatePolicy(1);
        context.Users.Add(client);
        context.Policies.Add(policy);

        var claim1 = TestDbHelper.CreateClaim(1, "client-001", status: ClaimStatusType.Pending);
        var claim2 = TestDbHelper.CreateClaim(2, "client-001", status: ClaimStatusType.Approved);
        var claim3 = TestDbHelper.CreateClaim(3, "client-001", status: ClaimStatusType.Pending);
        context.Claims.AddRange(claim1, claim2, claim3);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var filter = new ClaimFilterDto
        {
            Page = 1, PageSize = 10,
            Status = ClaimStatusType.Pending
        };

        // Act
        var result = await service.GetAllAsync(filter);

        // Assert
        result.TotalCount.Should().Be(2);
        result.Items.Should().AllSatisfy(c => c.Status.Should().Be("Pending"));
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldChangeStatus()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var client = TestDbHelper.CreateUser("client-001");
        var policy = TestDbHelper.CreatePolicy(1);
        var claim = TestDbHelper.CreateClaim(1, "client-001", status: ClaimStatusType.Pending);

        context.Users.Add(client);
        context.Policies.Add(policy);
        context.Claims.Add(claim);
        await context.SaveChangesAsync();

        var mockNotifications = new Mock<INotificationService>();
        var service = CreateService(context, notificationService: mockNotifications.Object);

        var dto = new UpdateClaimStatusDto
        {
            Status = ClaimStatusType.Approved,
            Comment = "Approved after review"
        };

        // Act
        var result = await service.UpdateStatusAsync(1, dto, "admin-001");

        // Assert
        result.Status.Should().Be("Approved");
        mockNotifications.Verify(
            n => n.CreateAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()),
            Times.AtLeastOnce
        );
    }

    [Fact]
    public async Task UpdateStatusAsync_ShouldAddStatusHistory()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var client = TestDbHelper.CreateUser("client-001");
        var policy = TestDbHelper.CreatePolicy(1);
        var claim = TestDbHelper.CreateClaim(1, "client-001");

        context.Users.Add(client);
        context.Policies.Add(policy);
        context.Claims.Add(claim);
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var dto = new UpdateClaimStatusDto
        {
            Status = ClaimStatusType.UnderReview,
            Comment = "Under review now"
        };

        // Act
        await service.UpdateStatusAsync(1, dto, "admin-001");

        // Assert
        var history = context.ClaimStatusHistories.Where(h => h.ClaimId == 1).ToList();
        history.Should().HaveCount(1);
        history[0].Status.Should().Be(ClaimStatusType.UnderReview);
        history[0].Comment.Should().Be("Under review now");
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_WhenClaimNotFound()
    {
        // Arrange
        var service = CreateService();

        // Act & Assert
        await service.Invoking(s => s.DeleteAsync(999))
            .Should().ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task GetMyClaimsAsync_ShouldReturnOnlyClientClaims()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var client1 = TestDbHelper.CreateUser("client-001", email: "c1@test.com");
        var client2 = TestDbHelper.CreateUser("client-002", email: "c2@test.com");
        var policy = TestDbHelper.CreatePolicy(1);

        context.Users.AddRange(client1, client2);
        context.Policies.Add(policy);
        context.Claims.AddRange(
            TestDbHelper.CreateClaim(1, "client-001"),
            TestDbHelper.CreateClaim(2, "client-002"),
            TestDbHelper.CreateClaim(3, "client-001")
        );
        await context.SaveChangesAsync();

        var service = CreateService(context);
        var filter = new ClaimFilterDto { Page = 1, PageSize = 10 };

        // Act
        var result = await service.GetMyClaimsAsync("client-001", filter);

        // Assert
        result.TotalCount.Should().Be(2);
        result.Items.Should().AllSatisfy(c => c.ClientId.Should().Be("client-001"));
    }
}