using FluentAssertions;
using InsuranceClaims.Core.DTOs.Policies;
using InsuranceClaims.Infrastructure.Services;
using InsuranceClaims.Tests.Helpers;

namespace InsuranceClaims.Tests.Services;

public class PolicyServiceTests
{
    [Fact]
    public async Task CreateAsync_ShouldCreatePolicy_WhenValidData()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var service = new PolicyService(context);
        var dto = new CreatePolicyDto
        {
            PolicyNumber = "POL-TEST-001",
            HolderName = "John Doe",
            HolderEmail = "john@test.com",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(1),
            CoverageAmount = 100000,
        };

        // Act
        var result = await service.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.PolicyNumber.Should().Be("POL-TEST-001");
        result.HolderName.Should().Be("John Doe");
        result.IsActive.Should().BeTrue();
        result.TotalClaims.Should().Be(0);
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPaginatedPolicies()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        context.Policies.AddRange(
            TestDbHelper.CreatePolicy(1, "POL-001"),
            TestDbHelper.CreatePolicy(2, "POL-002"),
            TestDbHelper.CreatePolicy(3, "POL-003")
        );
        await context.SaveChangesAsync();

        var service = new PolicyService(context);

        // Act
        var result = await service.GetAllAsync(page: 1, pageSize: 2, activeOnly: null);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(3);
        result.TotalPages.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_ShouldFilterByActiveOnly()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        context.Policies.AddRange(
            TestDbHelper.CreatePolicy(1, "POL-001", isActive: true),
            TestDbHelper.CreatePolicy(2, "POL-002", isActive: false),
            TestDbHelper.CreatePolicy(3, "POL-003", isActive: true)
        );
        await context.SaveChangesAsync();

        var service = new PolicyService(context);

        // Act
        var result = await service.GetAllAsync(page: 1, pageSize: 10, activeOnly: true);

        // Assert
        result.Items.Should().HaveCount(2);
        result.Items.Should().AllSatisfy(p => p.IsActive.Should().BeTrue());
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrow_WhenPolicyNotFound()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        var service = new PolicyService(context);

        // Act & Assert
        await service.Invoking(s => s.GetByIdAsync(999))
            .Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("*999*");
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdatePolicy_WhenExists()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        context.Policies.Add(TestDbHelper.CreatePolicy(1, "POL-OLD"));
        await context.SaveChangesAsync();

        var service = new PolicyService(context);
        var dto = new CreatePolicyDto
        {
            PolicyNumber = "POL-NEW",
            HolderName = "Updated Holder",
            HolderEmail = "updated@test.com",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddYears(2),
            CoverageAmount = 200000,
        };

        // Act
        var result = await service.UpdateAsync(1, dto);

        // Assert
        result.PolicyNumber.Should().Be("POL-NEW");
        result.HolderName.Should().Be("Updated Holder");
        result.CoverageAmount.Should().Be(200000);
    }

    [Fact]
    public async Task ToggleActiveAsync_ShouldToggleIsActive()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        context.Policies.Add(TestDbHelper.CreatePolicy(1, isActive: true));
        await context.SaveChangesAsync();

        var service = new PolicyService(context);

        // Act
        var result = await service.ToggleActiveAsync(1);

        // Assert
        result.IsActive.Should().BeFalse();

        // Toggle back
        var result2 = await service.ToggleActiveAsync(1);
        result2.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemovePolicy()
    {
        // Arrange
        var context = TestDbHelper.CreateInMemoryDb();
        context.Policies.Add(TestDbHelper.CreatePolicy(1));
        await context.SaveChangesAsync();

        var service = new PolicyService(context);

        // Act
        await service.DeleteAsync(1);

        // Assert
        var policies = await service.GetAllAsync(1, 10, null);
        policies.TotalCount.Should().Be(0);
    }
}