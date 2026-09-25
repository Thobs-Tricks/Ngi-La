namespace Ngila.Api.DTOs.Admin;

// AppPassword is never returned once set - only whether one is configured.
public record EmailSettingsResponse(string? SenderEmail, bool IsConfigured, DateTime? UpdatedAt);
