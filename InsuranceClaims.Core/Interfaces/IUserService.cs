using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Users;

namespace InsuranceClaims.Core.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserResponseDto>> GetAllAsync(string? role, int page, int pageSize);
    Task<UserResponseDto> GetByIdAsync(string id);
    Task<UserResponseDto> CreateAsync(CreateUserDto dto);
    Task<UserResponseDto> UpdateAsync(string id, UpdateUserDto dto);
    Task<UserResponseDto> ToggleActiveAsync(string id);
}