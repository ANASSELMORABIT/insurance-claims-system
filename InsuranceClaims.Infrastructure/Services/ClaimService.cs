using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Claims;
using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using ClaimEntity = InsuranceClaims.Core.Entities.Claim;

namespace InsuranceClaims.Infrastructure.Services;

public class ClaimService : IClaimService
{
    private readonly ApplicationDbContext _context;

    public ClaimService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<ClaimResponseDto>> GetAllAsync(ClaimFilterDto filter)
    {
        var query = _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Agent)
            .Include(c => c.Policy)
            .Include(c => c.StatusHistory).ThenInclude(h => h.ChangedBy)
            .Include(c => c.Documents)
            .AsQueryable();

        if (filter.Status.HasValue)
            query = query.Where(c => c.Status == filter.Status.Value);

        if (filter.Type.HasValue)
            query = query.Where(c => c.Type == filter.Type.Value);

        if (!string.IsNullOrEmpty(filter.ClientId))
            query = query.Where(c => c.ClientId == filter.ClientId);

        if (!string.IsNullOrEmpty(filter.AgentId))
            query = query.Where(c => c.AgentId == filter.AgentId);

        if (filter.From.HasValue)
            query = query.Where(c => c.CreatedAt >= filter.From.Value);

        if (filter.To.HasValue)
            query = query.Where(c => c.CreatedAt <= filter.To.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        return new PagedResult<ClaimResponseDto>
        {
            Items = items.Select(c => MapToDto(c)).ToList(),
            TotalCount = totalCount,
            Page = filter.Page,
            PageSize = filter.PageSize
        };
    }

    public async Task<ClaimResponseDto> GetByIdAsync(int id)
    {
        var claim = await _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Agent)
            .Include(c => c.Policy)
            .Include(c => c.StatusHistory).ThenInclude(h => h.ChangedBy)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Id == id)
            ?? throw new KeyNotFoundException($"Claim {id} not found.");

        return MapToDto(claim);
    }

    public async Task<ClaimResponseDto> CreateAsync(CreateClaimDto dto, string createdByUserId)
    {
        var policy = await _context.Policies.FindAsync(dto.PolicyId)
            ?? throw new KeyNotFoundException($"Policy {dto.PolicyId} not found.");

        var claim = new ClaimEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            Type = dto.Type,
            IncidentDate = dto.IncidentDate,
            EstimatedAmount = dto.EstimatedAmount,
            PolicyId = dto.PolicyId,
            ClientId = dto.ClientId,
            Status = Core.Enums.ClaimStatusType.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _context.Claims.Add(claim);
        await _context.SaveChangesAsync();

        var history = new ClaimStatusHistory
        {
            ClaimId = claim.Id,
            Status = Core.Enums.ClaimStatusType.Pending,
            Comment = "Claim created.",
            ChangedById = createdByUserId,
            ChangedAt = DateTime.UtcNow
        };

        _context.ClaimStatusHistories.Add(history);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(claim.Id);
    }

    public async Task<ClaimResponseDto> UpdateAsync(int id, UpdateClaimDto dto)
    {
        var claim = await _context.Claims.FindAsync(id)
            ?? throw new KeyNotFoundException($"Claim {id} not found.");

        claim.Title = dto.Title;
        claim.Description = dto.Description;
        claim.Type = dto.Type;
        claim.IncidentDate = dto.IncidentDate;
        claim.EstimatedAmount = dto.EstimatedAmount;
        claim.AgentId = dto.AgentId;
        claim.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<ClaimResponseDto> UpdateStatusAsync(int id, UpdateClaimStatusDto dto, string changedByUserId)
    {
        var claim = await _context.Claims.FindAsync(id)
            ?? throw new KeyNotFoundException($"Claim {id} not found.");

        claim.Status = dto.Status;
        claim.UpdatedAt = DateTime.UtcNow;

        var history = new ClaimStatusHistory
        {
            ClaimId = claim.Id,
            Status = dto.Status,
            Comment = dto.Comment,
            ChangedById = changedByUserId,
            ChangedAt = DateTime.UtcNow
        };

        _context.ClaimStatusHistories.Add(history);
        await _context.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var claim = await _context.Claims.FindAsync(id)
            ?? throw new KeyNotFoundException($"Claim {id} not found.");

        _context.Claims.Remove(claim);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResult<ClaimResponseDto>> GetMyClaimsAsync(string clientId, ClaimFilterDto filter)
    {
        filter.ClientId = clientId;
        return await GetAllAsync(filter);
    }

    private static ClaimResponseDto MapToDto(ClaimEntity claim) => new()
    {
        Id = claim.Id,
        Title = claim.Title,
        Description = claim.Description,
        Type = claim.Type.ToString(),
        Status = claim.Status.ToString(),
        IncidentDate = claim.IncidentDate,
        CreatedAt = claim.CreatedAt,
        UpdatedAt = claim.UpdatedAt,
        EstimatedAmount = claim.EstimatedAmount,
        PolicyId = claim.PolicyId,
        PolicyNumber = claim.Policy?.PolicyNumber ?? "",
        ClientId = claim.ClientId,
        ClientName = claim.Client != null ? $"{claim.Client.FirstName} {claim.Client.LastName}" : "",
        AgentId = claim.AgentId,
        AgentName = claim.Agent != null ? $"{claim.Agent.FirstName} {claim.Agent.LastName}" : null,
        DocumentCount = claim.Documents?.Count ?? 0,
        StatusHistory = claim.StatusHistory?.Select(h => new ClaimStatusHistoryDto
        {
            Id = h.Id,
            Status = h.Status.ToString(),
            Comment = h.Comment,
            ChangedAt = h.ChangedAt,
            ChangedBy = h.ChangedBy != null ? $"{h.ChangedBy.FirstName} {h.ChangedBy.LastName}" : ""
        }).OrderByDescending(h => h.ChangedAt).ToList() ?? new()
    };
}