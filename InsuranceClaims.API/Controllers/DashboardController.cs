using System.Security.Claims;
using InsuranceClaims.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceClaims.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _dashboardService.GetStatsAsync();
        return Ok(result);
    }

    [HttpGet("stats/agent")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetAgentStats()
    {
        var agentId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        var result = await _dashboardService.GetStatsByAgentAsync(agentId!);
        return Ok(result);
    }

    [HttpGet("stats/client")]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> GetClientStats()
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        var result = await _dashboardService.GetStatsByClientAsync(clientId!);
        return Ok(result);
    }
}