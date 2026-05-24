namespace InsuranceClaims.Core.Interfaces;

public interface IAgentAssignmentService
{
    Task<string?> GetLeastLoadedAgentAsync();
    Task<List<AgentWorkloadDto>> GetAgentWorkloadsAsync();
}

public class AgentWorkloadDto
{
    public string AgentId { get; set; } = string.Empty;
    public string AgentName { get; set; } = string.Empty;
    public int ActiveClaims { get; set; }
    public int TotalClaims { get; set; }
    public string Status { get; set; } = string.Empty;
}