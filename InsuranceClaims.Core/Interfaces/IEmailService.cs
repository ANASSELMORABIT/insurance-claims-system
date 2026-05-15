namespace InsuranceClaims.Core.Interfaces;

public interface IEmailService
{
    Task SendClaimCreatedAsync(string toEmail, string clientName, int claimId, string claimTitle);
    Task SendStatusChangedAsync(string toEmail, string clientName, int claimId, string claimTitle, string newStatus, string comment);
    Task SendClaimClosedAsync(string toEmail, string clientName, int claimId, string claimTitle, string finalStatus);
    Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
}