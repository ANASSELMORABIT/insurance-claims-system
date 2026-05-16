using InsuranceClaims.Core.DTOs.Auth;
using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Interfaces;
using Microsoft.AspNetCore.Identity;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InsuranceClaims.Infrastructure.Services;

public class AuthService : IAuthService
{
   private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly ApplicationDbContext _context;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _context = context;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        var isValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValid)
            throw new UnauthorizedAccessException("Invalid email or password.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is disabled.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Client";
        var (token, expiresAt) = _tokenService.GenerateToken(user, role);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new InvalidOperationException("Email already registered.");

        var validRoles = new[] { "Admin", "Agent", "Client" };
        var role = validRoles.Contains(request.Role) ? request.Role : "Client";

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = true,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException(errors);
        }

        await _userManager.AddToRoleAsync(user, role);

        var (token, expiresAt) = _tokenService.GenerateToken(user, role);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            ExpiresAt = expiresAt
        };
    }

    public async Task<AuthResponse> GetCurrentUserAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var roles = await _userManager.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "Client";
        var (token, expiresAt) = _tokenService.GenerateToken(user, role);

        return new AuthResponse
        {
            Token = token,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = role,
            ExpiresAt = expiresAt
        };
    }

    public async Task<ProfileStatsDto> GetProfileStatsAsync(string userId)
{
    var user = await _userManager.FindByIdAsync(userId)
        ?? throw new KeyNotFoundException("User not found.");

    var roles = await _userManager.GetRolesAsync(user);
    var role = roles.FirstOrDefault() ?? "Client";

    // Stats de claims
    var claims = await _context.Claims
        .Where(c => c.ClientId == userId || c.AgentId == userId)
        .ToListAsync();

    var totalDocuments = await _context.ClaimDocuments
        .Where(d => d.UploadedById == userId)
        .CountAsync();

    return new ProfileStatsDto
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        Email = user.Email!,
        PhoneNumber = user.PhoneNumber,
        Role = role,
        CreatedAt = user.CreatedAt,
        IsActive = user.IsActive,
        TotalClaims = claims.Count,
        TotalDocuments = totalDocuments,
        PendingClaims = claims.Count(c => c.Status == Core.Enums.ClaimStatusType.Pending),
        ApprovedClaims = claims.Count(c => c.Status == Core.Enums.ClaimStatusType.Approved),
    };
}

public async Task<ProfileStatsDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
{
    var user = await _userManager.FindByIdAsync(userId)
        ?? throw new KeyNotFoundException("User not found.");

    user.FirstName = dto.FirstName;
    user.LastName = dto.LastName;
    user.PhoneNumber = dto.PhoneNumber;

    var result = await _userManager.UpdateAsync(user);
    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException(errors);
    }

    return await GetProfileStatsAsync(userId);
}

public async Task ChangePasswordAsync(string userId, ChangePasswordDto dto)
{
    var user = await _userManager.FindByIdAsync(userId)
        ?? throw new KeyNotFoundException("User not found.");

    var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        throw new InvalidOperationException(errors);
    }
}
}