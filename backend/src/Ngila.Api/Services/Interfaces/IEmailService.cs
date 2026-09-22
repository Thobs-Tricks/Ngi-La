namespace Ngila.Api.Services.Interfaces;

public interface IEmailService
{
    Task SendEmailConfirmationAsync(string toEmail, Guid userId, string token, CancellationToken ct = default);
    Task SendPasswordResetAsync(string toEmail, string token, CancellationToken ct = default);
}
