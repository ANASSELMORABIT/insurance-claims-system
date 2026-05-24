using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.DTOs.Claims;

namespace InsuranceClaims.Core.Interfaces;

public interface IClaimService
{
    Task<PagedResult<ClaimResponseDto>> GetAllAsync(ClaimFilterDto filter);
    Task<ClaimResponseDto> GetByIdAsync(int id);
    Task<ClaimResponseDto> CreateAsync(CreateClaimDto dto, string createdByUserId);
    Task<ClaimResponseDto> UpdateAsync(int id, UpdateClaimDto dto);
    Task<ClaimResponseDto> UpdateStatusAsync(int id, UpdateClaimStatusDto dto, string changedByUserId);
    Task DeleteAsync(int id);
    Task<PagedResult<ClaimResponseDto>> GetMyClaimsAsync(string clientId, ClaimFilterDto filter);

    Task<ClaimResponseDto> AssignAgentAsync(int claimId, string? agentId);
}   