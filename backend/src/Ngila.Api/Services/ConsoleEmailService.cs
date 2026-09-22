using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

// Hackathon-stage stand-in for a real mail provider. Logs the confirmation/reset link instead of
// sending an email, so the flow is fully testable without SMTP/SendGrid credentials.
// Swap for Azure Communication Services or SendGrid before going to production.
public class ConsoleEmailService : IEmailService
{
    private readonly ILogger<ConsoleEmailService> _logger;

    public ConsoleEmailService(ILogger<ConsoleEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendEmailConfirmationAsync(string toEmail, Guid userId, string token, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[EMAIL:ConfirmAccount] To={Email} userId={UserId} token={Token}",
            toEmail, userId, token);
        return Task.CompletedTask;
    }

    public Task SendPasswordResetAsync(string toEmail, string token, CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[EMAIL:ResetPassword] To={Email} token={Token}",
            toEmail, token);
        return Task.CompletedTask;
    }
}
