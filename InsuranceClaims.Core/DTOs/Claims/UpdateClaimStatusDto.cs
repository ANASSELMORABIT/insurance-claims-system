using InsuranceClaims.Core.Enums;

namespace InsuranceClaims.Core.DTOs.Claims;

public class UpdateClaimStatusDto
{
    public ClaimStatusType Status { get; set; }
    public string Comment { get; set; } = string.Empty;
}