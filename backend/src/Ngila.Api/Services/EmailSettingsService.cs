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
        if (settings is null)
        {
            settings = new EmailSettings { Id = 1 };
            _context.EmailSettings.Add(settings);
        }

        settings.SenderEmail = request.SenderEmail.Trim();
        settings.EncryptedAppPassword = SecretProtector.Encrypt(request.AppPassword, _encryptionKeySeed);
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
