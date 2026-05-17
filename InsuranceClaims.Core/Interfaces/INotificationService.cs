using InsuranceClaims.Core.DTOs.Notifications;

namespace InsuranceClaims.Core.Interfaces;

public interface INotificationService
{
    Task<List<NotificationResponseDto>> GetByUserAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(string userId);
    Task DeleteAsync(int id);
    Task CreateAsync(string userId, string title, string message, string? relatedUrl = null);
}