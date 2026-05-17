using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Policies;
using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class PolicyService : IPolicyService
{
    private readonly ApplicationDbContext _context;

    public PolicyService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<PolicyResponseDto>> GetAllAsync(int page, int pageSize, bool? activeOnly)
    {
        var query = _context.Policies.AsQueryable();

        if (activeOnly.HasValue)
            query = query.Where(p => p.IsActive == activeOnly.Value);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<PolicyResponseDto>();
        foreach (var p in items)
            result.Add(await MapToDtoAsync(p));

        return new PagedResult<PolicyResponseDto>
        {
            Items = result,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PolicyResponseDto> GetByIdAsync(int id)
    {
        var policy = await _context.Policies.FindAsync(id)
            ?? throw new KeyNotFoundException($"Policy {id} not found.");
        return await MapToDtoAsync(policy);
    }

    public async Task<PolicyResponseDto> CreateAsync(CreatePolicyDto dto)
    {
        var policy = new Policy
        {
            PolicyNumber = dto.PolicyNumber,
            HolderName = dto.HolderName,
            HolderEmail = dto.HolderEmail,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            CoverageAmount = dto.CoverageAmount,
            IsActive = true,
        };

        _context.Policies.Add(policy);
        await _context.SaveChangesAsync();
        return await MapToDtoAsync(policy);
    }

    public async Task<PolicyResponseDto> UpdateAsync(int id, CreatePolicyDto dto)
    {
        var policy = await _context.Policies.FindAsync(id)
            ?? throw new KeyNotFoundException($"Policy {id} not found.");

        policy.PolicyNumber = dto.PolicyNumber;
        policy.HolderName = dto.HolderName;
        policy.HolderEmail = dto.HolderEmail;
        policy.StartDate = dto.StartDate;
        policy.EndDate = dto.EndDate;
        policy.CoverageAmount = dto.CoverageAmount;

        await _context.SaveChangesAsync();
        return await MapToDtoAsync(policy);
    }

    public async Task<PolicyResponseDto> ToggleActiveAsync(int id)
    {
        var policy = await _context.Policies.FindAsync(id)
            ?? throw new KeyNotFoundException($"Policy {id} not found.");

        policy.IsActive = !policy.IsActive;
        await _context.SaveChangesAsync();
        return await MapToDtoAsync(policy);
    }

    public async Task DeleteAsync(int id)
    {
        var policy = await _context.Policies.FindAsync(id)
            ?? throw new KeyNotFoundException($"Policy {id} not found.");

        _context.Policies.Remove(policy);
        await _context.SaveChangesAsync();
    }

    private async Task<PolicyResponseDto> MapToDtoAsync(Policy policy)
    {
        var totalClaims = await _context.Claims.CountAsync(c => c.PolicyId == policy.Id);
        return new PolicyResponseDto
        {
            Id = policy.Id,
            PolicyNumber = policy.PolicyNumber,
            HolderName = policy.HolderName,
            HolderEmail = policy.HolderEmail,
            StartDate = policy.StartDate,
            EndDate = policy.EndDate,
            IsActive = policy.IsActive,
            CoverageAmount = policy.CoverageAmount,
            TotalClaims = totalClaims,
        };
    }
}