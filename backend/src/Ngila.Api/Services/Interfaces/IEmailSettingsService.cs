using Ngila.Api.Common;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;

namespace Ngila.Api.Services.Interfaces;

public record EmailCredentials(string SenderEmail, string AppPassword);

public interface IEmailSettingsService
{
    Task<EmailSettingsResponse> GetAsync(CancellationToken ct = default);
    Task<ServiceResult<EmailSettingsResponse>> UpdateAsync(Guid adminUserId, EmailSettingsRequest request, CancellationToken ct = default);

    // Decrypted credentials for SmtpEmailService to actually send with - null if never configured.
    Task<EmailCredentials?> GetCredentialsAsync(CancellationToken ct = default);
}
