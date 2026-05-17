using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Users;
using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ApplicationDbContext _context;

    public UserService(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
    {
        _userManager = userManager;
        _context = context;
    }

    public async Task<PagedResult<UserResponseDto>> GetAllAsync(string? role, int page, int pageSize)
    {
        var query = _userManager.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role))
        {
            var roleEntity = await _context.Roles.FirstOrDefaultAsync(r => r.Name == role);
            if (roleEntity != null)
            {
                var userIds = await _context.UserRoles
                    .Where(ur => ur.RoleId == roleEntity.Id)
                    .Select(ur => ur.UserId)
                    .ToListAsync();
                query = query.Where(u => userIds.Contains(u.Id));
            }
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<UserResponseDto>();
        foreach (var user in users)
        {
            result.Add(await MapToDtoAsync(user));
        }

        return new PagedResult<UserResponseDto>
        {
            Items = result,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<UserResponseDto> GetByIdAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"User {id} not found.");
        return await MapToDtoAsync(user);
    }

    public async Task<UserResponseDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await _userManager.FindByEmailAsync(dto.Email);
        if (existing != null)
            throw new InvalidOperationException("Email already registered.");

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            EmailConfirmed = true,
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        var validRoles = new[] { "Admin", "Agent", "Client" };
        var role = validRoles.Contains(dto.Role) ? dto.Role : "Client";
        await _userManager.AddToRoleAsync(user, role);

        return await MapToDtoAsync(user);
    }

    public async Task<UserResponseDto> UpdateAsync(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.PhoneNumber = dto.PhoneNumber;

        await _userManager.UpdateAsync(user);
        return await MapToDtoAsync(user);
    }

    public async Task<UserResponseDto> ToggleActiveAsync(string id)
    {
        var user = await _userManager.FindByIdAsync(id)
            ?? throw new KeyNotFoundException($"User {id} not found.");

        user.IsActive = !user.IsActive;
        await _userManager.UpdateAsync(user);
        return await MapToDtoAsync(user);
    }

    private async Task<UserResponseDto> MapToDtoAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Client";

        var totalClaims = await _context.Claims
            .CountAsync(c => c.ClientId == user.Id || c.AgentId == user.Id);

        var totalDocuments = await _context.ClaimDocuments
            .CountAsync(d => d.UploadedById == user.Id);

        return new UserResponseDto
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            PhoneNumber = user.PhoneNumber,
            Role = role,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            TotalClaims = totalClaims,
            TotalDocuments = totalDocuments,
        };
    }
}