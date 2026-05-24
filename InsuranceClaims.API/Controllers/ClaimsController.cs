using System.Security.Claims;
using InsuranceClaims.Core.DTOs.Claims;
using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InsuranceClaims.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClaimsController : ControllerBase
{
    private readonly IClaimService _claimService;

    public ClaimsController(IClaimService claimService)
    {
        _claimService = claimService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> GetAll([FromQuery] ClaimFilterDto filter)
    {
        var result = await _claimService.GetAllAsync(filter);
        return Ok(result);
    }

    [HttpGet("my")]
    [Authorize(Roles = "Client")]
    public async Task<IActionResult> GetMyClaims([FromQuery] ClaimFilterDto filter)
    {
        var clientId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(clientId))
            return Unauthorized();

        var result = await _claimService.GetMyClaimsAsync(clientId, filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _claimService.GetByIdAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> Create([FromBody] CreateClaimDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            var result = await _claimService.CreateAsync(dto, userId!);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClaimDto dto)
    {
        try
        {
            var result = await _claimService.UpdateAsync(id, dto);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateClaimStatusDto dto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");

            var result = await _claimService.UpdateStatusAsync(id, dto, userId!);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _claimService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("agent-workloads")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAgentWorkloads(
        [FromServices] IAgentAssignmentService assignmentService)
    {
        var result = await assignmentService.GetAgentWorkloadsAsync();
        return Ok(result);
    }

    [HttpPatch("{id}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignAgent(int id, [FromBody] AssignAgentDto dto)
    {
        try
        {
            var result = await _claimService.AssignAgentAsync(id, dto.AgentId);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}