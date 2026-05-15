using InsuranceClaims.Core.DTOs;
using InsuranceClaims.Core.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace InsuranceClaims.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _settings = settings.Value;
    }

    public async Task SendClaimCreatedAsync(string toEmail, string clientName, int claimId, string claimTitle)
    {
        var subject = $"✅ Claim #{claimId} Created Successfully";
        var body = BuildEmailTemplate(
            title: "Claim Created",
            color: "#00D4FF",
            icon: "✅",
            clientName: clientName,
            content: $@"
                <p>Your insurance claim has been successfully submitted.</p>
                <div style='background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;'>
                    <strong>Claim ID:</strong> #{claimId}<br/>
                    <strong>Title:</strong> {claimTitle}<br/>
                    <strong>Status:</strong> Pending Review
                </div>
                <p>Our team will review your claim shortly. You will receive updates as the status changes.</p>
            "
        );

        await SendEmailAsync(toEmail, clientName, subject, body);
    }

    public async Task SendStatusChangedAsync(string toEmail, string clientName, int claimId, string claimTitle, string newStatus, string comment)
    {
        var statusColor = newStatus switch
        {
            "Approved" => "#00FF94",
            "Rejected" => "#FF6B6B",
            "UnderReview" => "#FFB800",
            "Closed" => "#94a3b8",
            _ => "#00D4FF"
        };

        var subject = $"📋 Claim #{claimId} Status Updated: {newStatus}";
        var body = BuildEmailTemplate(
            title: "Claim Status Updated",
            color: statusColor,
            icon: "📋",
            clientName: clientName,
            content: $@"
                <p>The status of your insurance claim has been updated.</p>
                <div style='background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;'>
                    <strong>Claim ID:</strong> #{claimId}<br/>
                    <strong>Title:</strong> {claimTitle}<br/>
                    <strong>New Status:</strong> 
                    <span style='color:{statusColor};font-weight:bold;'>{newStatus}</span>
                </div>
                {(string.IsNullOrEmpty(comment) ? "" : $"<p><strong>Agent Comment:</strong> {comment}</p>")}
            "
        );

        await SendEmailAsync(toEmail, clientName, subject, body);
    }

    public async Task SendClaimClosedAsync(string toEmail, string clientName, int claimId, string claimTitle, string finalStatus)
    {
        var subject = $"🔒 Claim #{claimId} Has Been Closed";
        var body = BuildEmailTemplate(
            title: "Claim Closed",
            color: "#94a3b8",
            icon: "🔒",
            clientName: clientName,
            content: $@"
                <p>Your insurance claim has been closed.</p>
                <div style='background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0;'>
                    <strong>Claim ID:</strong> #{claimId}<br/>
                    <strong>Title:</strong> {claimTitle}<br/>
                    <strong>Final Status:</strong> {finalStatus}
                </div>
                <p>Thank you for using our Insurance Claims System. If you have any questions, please contact your agent.</p>
            "
        );

        await SendEmailAsync(toEmail, clientName, subject, body);
    }

    public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
        message.To.Add(new MailboxAddress(toName, toEmail));
        message.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = htmlBody };
        message.Body = builder.ToMessageBody();

        using var client = new SmtpClient();
        await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_settings.Username, _settings.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }

    private static string BuildEmailTemplate(string title, string color, string icon, string clientName, string content)
    {
        return $@"
        <!DOCTYPE html>
        <html>
        <head><meta charset='utf-8'/></head>
        <body style='margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;'>
            <table width='100%' cellpadding='0' cellspacing='0'>
                <tr>
                    <td align='center' style='padding:40px 0;'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background:linear-gradient(135deg,#0d0d1a,#1a0d2e);padding:32px;text-align:center;'>
                                    <div style='font-size:40px;margin-bottom:8px;'>{icon}</div>
                                    <h1 style='color:{color};margin:0;font-size:24px;letter-spacing:1px;'>{title}</h1>
                                    <p style='color:#64748b;margin:8px 0 0;font-size:13px;'>Insurance Claims System</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style='padding:32px;color:#334155;font-size:15px;line-height:1.6;'>
                                    <p>Hello <strong>{clientName}</strong>,</p>
                                    {content}
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style='background:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;'>
                                    <p style='color:#94a3b8;font-size:12px;margin:0;'>
                                        This is an automated message from Insurance Claims System.<br/>
                                        Please do not reply to this email.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";
    }
}