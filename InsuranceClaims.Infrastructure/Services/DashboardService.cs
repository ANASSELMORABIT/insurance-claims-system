using InsuranceClaims.Core.DTOs.Dashboard;
using InsuranceClaims.Core.Enums;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ApplicationDbContext _context;

    public DashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        return await BuildStatsAsync(null, null);
    }

    public async Task<DashboardStatsDto> GetStatsByAgentAsync(string agentId)
    {
        return await BuildStatsAsync(agentId: agentId, clientId: null);
    }

    public async Task<DashboardStatsDto> GetStatsByClientAsync(string clientId)
    {
        return await BuildStatsAsync(agentId: null, clientId: clientId);
    }

    private async Task<DashboardStatsDto> BuildStatsAsync(string? agentId, string? clientId)
    {
        var query = _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Policy)
            .AsQueryable();

        if (!string.IsNullOrEmpty(agentId))
            query = query.Where(c => c.AgentId == agentId);

        if (!string.IsNullOrEmpty(clientId))
            query = query.Where(c => c.ClientId == clientId);

        var claims = await query.ToListAsync();
        var totalClaims = claims.Count;

        // Counts por estado
        var pendingClaims = claims.Count(c => c.Status == ClaimStatusType.Pending);
        var underReviewClaims = claims.Count(c => c.Status == ClaimStatusType.UnderReview);
        var approvedClaims = claims.Count(c => c.Status == ClaimStatusType.Approved);
        var rejectedClaims = claims.Count(c => c.Status == ClaimStatusType.Rejected);
        var closedClaims = claims.Count(c => c.Status == ClaimStatusType.Closed);

        // Amounts
        var totalAmount = claims
            .Where(c => c.EstimatedAmount.HasValue)
            .Sum(c => c.EstimatedAmount!.Value);

        var avgAmount = claims.Any(c => c.EstimatedAmount.HasValue)
            ? claims.Where(c => c.EstimatedAmount.HasValue)
                    .Average(c => c.EstimatedAmount!.Value)
            : 0;

        // Documentos
        var totalDocuments = await _context.ClaimDocuments
            .Where(d => claims.Select(c => c.Id).Contains(d.ClaimId))
            .CountAsync();

        // Usuarios
        var clientRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Client");
        var agentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Agent");

        var totalClients = clientRole != null
            ? await _context.UserRoles.CountAsync(ur => ur.RoleId == clientRole.Id)
            : 0;

        var totalAgents = agentRole != null
            ? await _context.UserRoles.CountAsync(ur => ur.RoleId == agentRole.Id)
            : 0;

        // Por tipo
        var claimsByType = claims
            .GroupBy(c => c.Type)
            .Select(g => new ClaimsByTypeDto
            {
                Type = g.Key.ToString(),
                Count = g.Count(),
                Percentage = totalClaims > 0
                    ? Math.Round((decimal)g.Count() / totalClaims * 100, 1)
                    : 0
            })
            .OrderByDescending(x => x.Count)
            .ToList();

        // Por mes (últimos 6 meses)
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var claimsByMonth = claims
            .Where(c => c.CreatedAt >= sixMonthsAgo)
            .GroupBy(c => new { c.CreatedAt.Year, c.CreatedAt.Month })
            .Select(g => new ClaimsByMonthDto
            {
                Year = g.Key.Year,
                Month = new DateTime(g.Key.Year, g.Key.Month, 1)
                    .ToString("MMM"),
                Count = g.Count(),
                TotalAmount = g.Where(c => c.EstimatedAmount.HasValue)
                               .Sum(c => c.EstimatedAmount!.Value)
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToList();

        // Recientes
        var recentClaims = claims
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => new RecentClaimDto
            {
                Id = c.Id,
                Title = c.Title,
                Type = c.Type.ToString(),
                Status = c.Status.ToString(),
                ClientName = c.Client != null
                    ? $"{c.Client.FirstName} {c.Client.LastName}"
                    : "",
                CreatedAt = c.CreatedAt,
                EstimatedAmount = c.EstimatedAmount
            })
            .ToList();

        return new DashboardStatsDto
        {
            TotalClaims = totalClaims,
            PendingClaims = pendingClaims,
            UnderReviewClaims = underReviewClaims,
            ApprovedClaims = approvedClaims,
            RejectedClaims = rejectedClaims,
            ClosedClaims = closedClaims,
            TotalEstimatedAmount = totalAmount,
            AverageEstimatedAmount = avgAmount,
            TotalDocuments = totalDocuments,
            TotalClients = totalClients,
            TotalAgents = totalAgents,
            ClaimsByType = claimsByType,
            ClaimsByMonth = claimsByMonth,
            RecentClaims = recentClaims
        };
    }
}