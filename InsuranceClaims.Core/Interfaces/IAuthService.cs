using InsuranceClaims.Core.DTOs.Auth;

namespace InsuranceClaims.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> GetCurrentUserAsync(string userId);
}