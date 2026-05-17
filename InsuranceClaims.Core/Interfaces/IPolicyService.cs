using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Policies;

namespace InsuranceClaims.Core.Interfaces;

public interface IPolicyService
{
    Task<PagedResult<PolicyResponseDto>> GetAllAsync(int page, int pageSize, bool? activeOnly);
    Task<PolicyResponseDto> GetByIdAsync(int id);
    Task<PolicyResponseDto> CreateAsync(CreatePolicyDto dto);
    Task<PolicyResponseDto> UpdateAsync(int id, CreatePolicyDto dto);
    Task<PolicyResponseDto> ToggleActiveAsync(int id);
    Task DeleteAsync(int id);
}