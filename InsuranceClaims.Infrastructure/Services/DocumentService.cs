using InsuranceClaims.Core.DTOs.Documents;
using InsuranceClaims.Core.Entities;
using InsuranceClaims.Core.Interfaces;
using InsuranceClaims.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;



namespace InsuranceClaims.Infrastructure.Services;

public class DocumentService : IDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly string _uploadsPath;

    public DocumentService(ApplicationDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _uploadsPath = Path.Combine(env.WebRootPath, "uploads");
        Directory.CreateDirectory(_uploadsPath);
    }

    public async Task<DocumentResponseDto> UploadAsync(int claimId, IFormFile file, string uploadedById)
    {
        // Validar que el claim existe
        var claim = await _context.Claims.FindAsync(claimId)
            ?? throw new KeyNotFoundException($"Claim {claimId} not found.");

        // Validar extensión
        var allowedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            throw new InvalidOperationException($"File type {extension} is not allowed.");

        // Validar tamaño (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            throw new InvalidOperationException("File size cannot exceed 10MB.");

        // Guardar archivo con nombre único
        var uniqueFileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(_uploadsPath, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Guardar en DB
        var document = new ClaimDocument
        {
            ClaimId = claimId,
            FileName = file.FileName,
            FilePath = uniqueFileName,
            FileType = extension,
            FileSize = file.Length,
            UploadedAt = DateTime.UtcNow,
            UploadedById = uploadedById
        };

        _context.ClaimDocuments.Add(document);
        await _context.SaveChangesAsync();

        return await MapToDtoAsync(document);
    }

    public async Task<List<DocumentResponseDto>> GetByClaimAsync(int claimId)
    {
        var documents = await _context.ClaimDocuments
            .Include(d => d.UploadedBy)
            .Where(d => d.ClaimId == claimId)
            .OrderByDescending(d => d.UploadedAt)
            .ToListAsync();

        var result = new List<DocumentResponseDto>();
        foreach (var doc in documents)
            result.Add(await MapToDtoAsync(doc));

        return result;
    }

    public async Task<(byte[] fileBytes, string fileName, string contentType)> DownloadAsync(int documentId)
    {
        var document = await _context.ClaimDocuments.FindAsync(documentId)
            ?? throw new KeyNotFoundException($"Document {documentId} not found.");

        var filePath = Path.Combine(_uploadsPath, document.FilePath);
        if (!File.Exists(filePath))
            throw new FileNotFoundException("File not found on server.");

        var fileBytes = await File.ReadAllBytesAsync(filePath);
        var contentType = GetContentType(document.FileType);

        return (fileBytes, document.FileName, contentType);
    }

    public async Task DeleteAsync(int documentId)
    {
        var document = await _context.ClaimDocuments.FindAsync(documentId)
            ?? throw new KeyNotFoundException($"Document {documentId} not found.");

        // Borrar archivo físico
        var filePath = Path.Combine(_uploadsPath, document.FilePath);
        if (File.Exists(filePath))
            File.Delete(filePath);

        _context.ClaimDocuments.Remove(document);
        await _context.SaveChangesAsync();
    }

    private async Task<DocumentResponseDto> MapToDtoAsync(ClaimDocument doc)
    {
        // Cargar UploadedBy si no está cargado
        if (doc.UploadedBy == null)
        {
            await _context.Entry(doc).Reference(d => d.UploadedBy).LoadAsync();
        }

        return new DocumentResponseDto
        {
            Id = doc.Id,
            FileName = doc.FileName,
            FileType = doc.FileType,
            FileSize = doc.FileSize,
            FileSizeFormatted = FormatFileSize(doc.FileSize),
            UploadedAt = doc.UploadedAt,
            UploadedBy = doc.UploadedBy != null
                ? $"{doc.UploadedBy.FirstName} {doc.UploadedBy.LastName}"
                : "",
            ClaimId = doc.ClaimId
        };
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes < 1024) return $"{bytes} B";
        if (bytes < 1024 * 1024) return $"{bytes / 1024.0:F1} KB";
        return $"{bytes / (1024.0 * 1024):F1} MB";
    }

    private static string GetContentType(string extension) => extension switch
    {
        ".pdf" => "application/pdf",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        ".doc" => "application/msword",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        _ => "application/octet-stream"
    };
}