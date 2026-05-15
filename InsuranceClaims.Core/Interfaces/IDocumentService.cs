using InsuranceClaims.Core.DTOs.Documents;
using Microsoft.AspNetCore.Http;

namespace InsuranceClaims.Core.Interfaces;

public interface IDocumentService
{
    Task<DocumentResponseDto> UploadAsync(int claimId, IFormFile file, string uploadedById);
    Task<List<DocumentResponseDto>> GetByClaimAsync(int claimId);
    Task<(byte[] fileBytes, string fileName, string contentType)> DownloadAsync(int documentId);
    Task DeleteAsync(int documentId);
}