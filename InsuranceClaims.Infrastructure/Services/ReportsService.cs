using InsuranceClaims.Core.DTOs.Reports;
using InsuranceClaims.Core.Enums;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class ReportsService : IReportsService
{
    private readonly ApplicationDbContext _context;

    public ReportsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ReportsOverviewDto> GetOverviewAsync()
    {
        var now = DateTime.UtcNow;
        var thisMonthStart = new DateTime(now.Year, now.Month, 1);
        var lastMonthStart = thisMonthStart.AddMonths(-1);
        var lastMonthEnd = thisMonthStart.AddSeconds(-1);

        var allClaims = await _context.Claims
            .Include(c => c.Client)
            .Include(c => c.Agent)
            .Include(c => c.StatusHistory)
            .ToListAsync();

        // Growth metrics
        var thisMonth = allClaims.Where(c => c.CreatedAt >= thisMonthStart).ToList();
        var lastMonth = allClaims.Where(c => c.CreatedAt >= lastMonthStart && c.CreatedAt <= lastMonthEnd).ToList();

        var thisMonthAmount = thisMonth.Sum(c => c.EstimatedAmount ?? 0);
        var lastMonthAmount = lastMonth.Sum(c => c.EstimatedAmount ?? 0);

        double claimsGrowth = lastMonth.Count > 0
            ? Math.Round((double)(thisMonth.Count - lastMonth.Count) / lastMonth.Count * 100, 1)
            : 100;

        double amountGrowth = lastMonthAmount > 0
            ? Math.Round((double)(thisMonthAmount - lastMonthAmount) / (double)lastMonthAmount * 100, 1)
            : 100;

        // Avg resolution days
        var resolvedClaims = allClaims.Where(c => c.Status == ClaimStatusType.Closed || c.Status == ClaimStatusType.Approved).ToList();
        var avgResolutionDays = resolvedClaims.Any()
            ? resolvedClaims.Average(c => (c.UpdatedAt ?? c.CreatedAt).Subtract(c.CreatedAt).TotalDays)
            : 0;

        // Monthly trend (last 6 months)
        var monthlyTrend = new List<MonthlyTrendDto>();
        for (int i = 5; i >= 0; i--)
        {
            var month = now.AddMonths(-i);
            var start = new DateTime(month.Year, month.Month, 1);
            var end = start.AddMonths(1).AddSeconds(-1);
            var monthClaims = allClaims.Where(c => c.CreatedAt >= start && c.CreatedAt <= end).ToList();
            monthlyTrend.Add(new MonthlyTrendDto
            {
                Month = month.ToString("MMM"),
                Year = month.Year,
                Created = monthClaims.Count,
                Resolved = monthClaims.Count(c => c.Status == ClaimStatusType.Closed || c.Status == ClaimStatusType.Approved),
                TotalAmount = monthClaims.Sum(c => c.EstimatedAmount ?? 0),
            });
        }

        // Agent performance
        var agentRole = await _context.Roles.FirstOrDefaultAsync(r => r.Name == "Agent");
        var agentIds = agentRole != null
            ? await _context.UserRoles.Where(ur => ur.RoleId == agentRole.Id).Select(ur => ur.UserId).ToListAsync()
            : new List<string>();

        var agents = await _context.Users.Where(u => agentIds.Contains(u.Id)).ToListAsync();
        var agentPerformance = agents.Select(agent =>
        {
            var agentClaims = allClaims.Where(c => c.AgentId == agent.Id).ToList();
            var agentResolved = agentClaims.Where(c => c.Status == ClaimStatusType.Closed || c.Status == ClaimStatusType.Approved).ToList();
            var avgDays = agentResolved.Any()
                ? agentResolved.Average(c => (c.UpdatedAt ?? c.CreatedAt).Subtract(c.CreatedAt).TotalDays)
                : 0;
            return new AgentPerformanceDto
            {
                AgentId = agent.Id,
                AgentName = $"{agent.FirstName} {agent.LastName}",
                TotalAssigned = agentClaims.Count,
                Resolved = agentResolved.Count,
                Pending = agentClaims.Count(c => c.Status == ClaimStatusType.Pending || c.Status == ClaimStatusType.UnderReview),
                AvgResolutionDays = Math.Round(avgDays, 1),
                TotalAmountHandled = agentClaims.Sum(c => c.EstimatedAmount ?? 0),
                ResolutionRate = agentClaims.Any() ? Math.Round((double)agentResolved.Count / agentClaims.Count * 100, 1) : 0,
            };
        }).OrderByDescending(a => a.TotalAssigned).ToList();

        // Cost by type
        var costByType = allClaims
            .GroupBy(c => c.Type.ToString())
            .Select(g => new ClaimTypeCostDto
            {
                Type = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(c => c.EstimatedAmount ?? 0),
                AvgAmount = g.Any(c => c.EstimatedAmount.HasValue)
                    ? g.Where(c => c.EstimatedAmount.HasValue).Average(c => c.EstimatedAmount!.Value)
                    : 0,
            })
            .OrderByDescending(x => x.TotalAmount)
            .ToList();

        // Daily activity (last 7 days)
        var dailyActivity = Enumerable.Range(0, 7).Select(i =>
        {
            var day = now.AddDays(-i).Date;
            return new DailyActivityDto
            {
                Day = day.ToString("ddd"),
                Count = allClaims.Count(c => c.CreatedAt.Date == day),
            };
        }).Reverse().ToList();

        // Top 5 costly claims
        var topClaims = allClaims
            .Where(c => c.EstimatedAmount.HasValue)
            .OrderByDescending(c => c.EstimatedAmount)
            .Take(5)
            .Select(c => new TopClaimDto
            {
                Id = c.Id,
                Title = c.Title,
                Type = c.Type.ToString(),
                Status = c.Status.ToString(),
                ClientName = c.Client != null ? $"{c.Client.FirstName} {c.Client.LastName}" : "",
                Amount = c.EstimatedAmount!.Value,
            })
            .ToList();

        // Status distribution
        var statusDist = new StatusDistributionDto
        {
            Pending = allClaims.Count(c => c.Status == ClaimStatusType.Pending),
            UnderReview = allClaims.Count(c => c.Status == ClaimStatusType.UnderReview),
            Approved = allClaims.Count(c => c.Status == ClaimStatusType.Approved),
            Rejected = allClaims.Count(c => c.Status == ClaimStatusType.Rejected),
            Closed = allClaims.Count(c => c.Status == ClaimStatusType.Closed),
        };

        return new ReportsOverviewDto
        {
            TotalClaimsThisMonth = thisMonth.Count,
            TotalClaimsLastMonth = lastMonth.Count,
            ClaimsGrowthPct = claimsGrowth,
            TotalAmountThisMonth = thisMonthAmount,
            TotalAmountLastMonth = lastMonthAmount,
            AmountGrowthPct = amountGrowth,
            AvgResolutionDays = Math.Round(avgResolutionDays, 1),
            ResolutionDaysChange = 0,
            OpenClaims = allClaims.Count(c => c.Status == ClaimStatusType.Pending || c.Status == ClaimStatusType.UnderReview),
            ResolvedThisMonth = thisMonth.Count(c => c.Status == ClaimStatusType.Closed || c.Status == ClaimStatusType.Approved),
            MonthlyTrend = monthlyTrend,
            AgentPerformance = agentPerformance,
            CostByType = costByType,
            DailyActivity = dailyActivity,
            TopCostlyClaims = topClaims,
            StatusDistribution = statusDist,
        };
    }
}