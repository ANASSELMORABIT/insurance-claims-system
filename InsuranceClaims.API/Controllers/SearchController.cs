using InsuranceClaims.Core.DTOs.Search;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SearchController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return Ok(new SearchResultDto { Query = q });

        var results = new List<SearchItemDto>();
        var search = q.ToLower();

        // Claims
        var claims = await _context.Claims
            .Include(c => c.Client)
            .Where(c => c.Title.ToLower().Contains(search) ||
                        c.Description.ToLower().Contains(search))
            .Take(5)
            .ToListAsync();

        results.AddRange(claims.Select(c => new SearchItemDto
        {
            Id = c.Id.ToString(),
            Title = c.Title,
            Subtitle = $"Client: {c.Client?.FirstName} {c.Client?.LastName}",
            Type = "claim",
            Url = $"/claims/{c.Id}",
            Badge = c.Status.ToString(),
            BadgeColor = c.Status.ToString() switch
            {
                "Pending" => "#FFB800",
                "Approved" => "#00FF94",
                "Rejected" => "#FF6B6B",
                _ => "#00D4FF"
            }
        }));

        // Policies
        var policies = await _context.Policies
            .Where(p => p.PolicyNumber.ToLower().Contains(search) ||
                        p.HolderName.ToLower().Contains(search) ||
                        p.HolderEmail.ToLower().Contains(search))
            .Take(5)
            .ToListAsync();

        results.AddRange(policies.Select(p => new SearchItemDto
        {
            Id = p.Id.ToString(),
            Title = p.PolicyNumber,
            Subtitle = $"Holder: {p.HolderName}",
            Type = "policy",
            Url = $"/policies",
            Badge = p.IsActive ? "Active" : "Inactive",
            BadgeColor = p.IsActive ? "#00FF94" : "#64748b"
        }));

        // Users (solo Admin)
        if (User.IsInRole("Admin"))
        {
            var users = await _context.Users
                .Where(u => u.FirstName.ToLower().Contains(search) ||
                            u.LastName.ToLower().Contains(search) ||
                            u.Email!.ToLower().Contains(search))
                .Take(5)
                .ToListAsync();

            results.AddRange(users.Select(u => new SearchItemDto
            {
                Id = u.Id,
                Title = $"{u.FirstName} {u.LastName}",
                Subtitle = u.Email!,
                Type = "user",
                Url = $"/users",
                Badge = u.IsActive ? "Active" : "Inactive",
                BadgeColor = u.IsActive ? "#00FF94" : "#64748b"
            }));
        }

        return Ok(new SearchResultDto
        {
            Results = results,
            TotalCount = results.Count,
            Query = q
        });
    }
}