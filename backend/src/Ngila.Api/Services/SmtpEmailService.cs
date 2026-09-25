using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Ngila.Api.Common;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

// Sends real email via Gmail SMTP using whatever sender address/app password is currently
// configured through the Admin console (see EmailSettingsService). Falls back to logging the
// link - same as the old ConsoleEmailService - when nothing has been configured yet, so the app
// keeps working (just not delivering real email) before an admin sets this up.
public class SmtpEmailService : IEmailService
{
    private const string SmtpHost = "smtp.gmail.com";
    private const int SmtpPort = 587;

    private readonly IEmailSettingsService _settings;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IEmailSettingsService settings, IConfiguration configuration, ILogger<SmtpEmailService> logger)
    {
        _settings = settings;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailConfirmationAsync(string toEmail, Guid userId, string token, CancellationToken ct = default)
    {
        var link = $"{AdminBaseUrl()}/verify-email?userId={userId}&token={Uri.EscapeDataString(token)}";

        var body = EmailTemplates.BuildActionEmail(
            LogoUrl(),
            "Confirm your Ngila account",
            "<p style=\"margin:0 0 12px 0;\">Thanks for joining Ngila! Confirm your email address to start discovering (or listing) local vendors.</p>" +
            "<p style=\"margin:0;\">This link is valid for a limited time - if it's expired, you can request a new one from the app.</p>",
            "Confirm my email",
            link);

        await SendOrLogAsync(toEmail, "Confirm your Ngila account", body,
            "[EMAIL:ConfirmAccount]", $"userId={userId} link={link}", ct);
    }

    public async Task SendPasswordResetAsync(string toEmail, string token, CancellationToken ct = default)
    {
        var link = $"{AdminBaseUrl()}/reset-password?email={Uri.EscapeDataString(toEmail)}&token={Uri.EscapeDataString(token)}";

        var body = EmailTemplates.BuildActionEmail(
            LogoUrl(),
            "Reset your Ngila password",
            "<p style=\"margin:0 0 12px 0;\">We received a request to reset the password on your Ngila account.</p>" +
            "<p style=\"margin:0;\">If you didn't request this, you can safely ignore this email - your password won't change.</p>",
            "Choose a new password",
            link);

        await SendOrLogAsync(toEmail, "Reset your Ngila password", body,
            "[EMAIL:ResetPassword]", $"link={link}", ct);
    }

    private async Task SendOrLogAsync(string toEmail, string subject, string htmlBody, string logTag, string logDetail, CancellationToken ct)
    {
        var credentials = await _settings.GetCredentialsAsync(ct);
        if (credentials is null)
        {
            _logger.LogInformation("{Tag} (no SMTP configured - set it up in the Admin console) To={Email} {Detail}", logTag, toEmail, logDetail);
            return;
        }

        try
        {
            using var client = new SmtpClient(SmtpHost, SmtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(credentials.SenderEmail, credentials.AppPassword),
            };

            using var message = new MailMessage
            {
                From = new MailAddress(credentials.SenderEmail, "Ngila"),
                Subject = subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };
            message.To.Add(toEmail);

            await client.SendMailAsync(message, ct);
        }
        catch (Exception ex)
        {
            // Never let an email delivery failure break the calling flow (registration, forgot-
            // password) - log it and let the user retry or ask an admin for the manual
            // reset/confirm tool instead.
            _logger.LogError(ex, "{Tag} SMTP send failed To={Email}", logTag, toEmail);
        }
    }

    private string AdminBaseUrl() => (_configuration["Frontend:AdminBaseUrl"] ?? "http://localhost:8080").TrimEnd('/');
    private string LogoUrl() => $"{AdminBaseUrl()}/ngila-logo.png";
}
