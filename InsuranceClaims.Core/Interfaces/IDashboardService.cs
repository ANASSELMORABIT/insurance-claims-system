using InsuranceClaims.Core.DTOs.Dashboard;

namespace InsuranceClaims.Core.Interfaces;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
    Task<DashboardStatsDto> GetStatsByAgentAsync(string agentId);
    Task<DashboardStatsDto> GetStatsByClientAsync(string clientId);
}