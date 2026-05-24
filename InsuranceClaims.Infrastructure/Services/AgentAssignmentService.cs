using InsuranceClaims.Core.Enums;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class AgentAssignmentService : IAgentAssignmentService
{
    private readonly ApplicationDbContext _context;

    public AgentAssignmentService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string?> GetLeastLoadedAgentAsync()
    {
        var agentRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Agent");

        if (agentRole == null) return null;

        var agentIds = await _context.UserRoles
            .Where(ur => ur.RoleId == agentRole.Id)
            .Select(ur => ur.UserId)
            .ToListAsync();

        if (!agentIds.Any()) return null;

        var activeStatuses = new[] { ClaimStatusType.Pending, ClaimStatusType.UnderReview };

        var workloads = await _context.Claims
            .Where(c => c.AgentId != null && agentIds.Contains(c.AgentId!) && activeStatuses.Contains(c.Status))
            .GroupBy(c => c.AgentId)
            .Select(g => new { AgentId = g.Key!, Count = g.Count() })
            .ToListAsync();

        // Agentes sin claims asignados también cuentan
        var allWorkloads = agentIds.Select(id => new
        {
            AgentId = id,
            Count = workloads.FirstOrDefault(w => w.AgentId == id)?.Count ?? 0
        });

        return allWorkloads.OrderBy(w => w.Count).First().AgentId;
    }

    public async Task<List<AgentWorkloadDto>> GetAgentWorkloadsAsync()
    {
        var agentRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Agent");

        if (agentRole == null) return new();

        var agentIds = await _context.UserRoles
            .Where(ur => ur.RoleId == agentRole.Id)
            .Select(ur => ur.UserId)
            .ToListAsync();

        var agents = await _context.Users
            .Where(u => agentIds.Contains(u.Id))
            .ToListAsync();

        var activeStatuses = new[] { ClaimStatusType.Pending, ClaimStatusType.UnderReview };

        var result = new List<AgentWorkloadDto>();
        foreach (var agent in agents)
        {
            var totalClaims = await _context.Claims.CountAsync(c => c.AgentId == agent.Id);
            var activeClaims = await _context.Claims.CountAsync(c => c.AgentId == agent.Id && activeStatuses.Contains(c.Status));

            result.Add(new AgentWorkloadDto
            {
                AgentId = agent.Id,
                AgentName = $"{agent.FirstName} {agent.LastName}",
                ActiveClaims = activeClaims,
                TotalClaims = totalClaims,
                Status = activeClaims switch
                {
                    0 => "Available",
                    <= 3 => "Low",
                    <= 7 => "Medium",
                    _ => "High"
                }
            });
        }

        return result.OrderBy(a => a.ActiveClaims).ToList();
    }
}