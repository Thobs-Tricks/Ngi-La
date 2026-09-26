using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Ngila.Api.Common;
using Ngila.Api.Configuration;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;
using Ngila.Api.Models.Entities;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class EmailSettingsService : IEmailSettingsService
{
    private readonly ApplicationDbContext _context;
    private readonly string _encryptionKeySeed;

    public EmailSettingsService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings)
    {
        _context = context;
        // Tied to the JWT secret purely as a stable, already-deployed value to key encryption
        // with - unrelated to JWT signing itself. See SecretProtector for why not DataProtection.
        _encryptionKeySeed = jwtSettings.Value.Secret;
    }

    public async Task<EmailSettingsResponse> GetAsync(CancellationToken ct = default)
    {
        var settings = await _context.EmailSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        return new EmailSettingsResponse(
            settings?.SenderEmail,
            !string.IsNullOrEmpty(settings?.EncryptedAppPassword),
            settings?.UpdatedAt);
    }

    public async Task<ServiceResult<EmailSettingsResponse>> UpdateAsync(Guid adminUserId, EmailSettingsRequest request, CancellationToken ct = default)
    {
        var settings = await _context.EmailSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);

        // Google displays a freshly generated app password grouped as "abcd efgh ijkl mnop" for
        // readability, and copying it usually brings those spaces along - the real credential
        // has none, so strip all whitespace before anything else touches it.
        var appPassword = request.AppPassword is null ? null : new string(request.AppPassword.Where(c => !char.IsWhiteSpace(c)).ToArray());

        if (settings is null && string.IsNullOrEmpty(appPassword))
            return ServiceResult<EmailSettingsResponse>.Failure("An app password is required to set up outgoing email.", 400);

        if (settings is null)
        {
            settings = new EmailSettings { Id = 1 };
            _context.EmailSettings.Add(settings);
        }

        settings.SenderEmail = request.SenderEmail.Trim();
        // Blank means "keep the existing one" - only overwrite when a new password was actually
        // provided, so correcting the sender email alone doesn't wipe out what's already stored.
        if (!string.IsNullOrEmpty(appPassword))
            settings.EncryptedAppPassword = SecretProtector.Encrypt(appPassword, _encryptionKeySeed);
        settings.UpdatedAt = DateTime.UtcNow;
        settings.UpdatedByUserId = adminUserId;

        await _context.SaveChangesAsync(ct);

        return ServiceResult<EmailSettingsResponse>.Success(
            new EmailSettingsResponse(settings.SenderEmail, true, settings.UpdatedAt));
    }

    public async Task<EmailCredentials?> GetCredentialsAsync(CancellationToken ct = default)
    {
        var settings = await _context.EmailSettings.FirstOrDefaultAsync(s => s.Id == 1, ct);
        if (settings?.SenderEmail is null || settings.EncryptedAppPassword is null)
            return null;

        var appPassword = SecretProtector.Decrypt(settings.EncryptedAppPassword, _encryptionKeySeed);
        return new EmailCredentials(settings.SenderEmail, appPassword);
    }
}
