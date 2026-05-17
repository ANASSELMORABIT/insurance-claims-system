namespace InsuranceClaims.Core.DTOs.Notifications;

public class NotificationResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? RelatedUrl { get; set; }
}