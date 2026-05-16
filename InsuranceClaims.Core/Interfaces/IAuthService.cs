using InsuranceClaims.Core.DTOs.Auth;

namespace InsuranceClaims.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> GetCurrentUserAsync(string userId);
    Task<ProfileStatsDto> GetProfileStatsAsync(string userId);
    Task<ProfileStatsDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    Task ChangePasswordAsync(string userId, ChangePasswordDto dto);
}