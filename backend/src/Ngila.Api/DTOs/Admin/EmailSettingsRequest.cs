namespace Ngila.Api.DTOs.Admin;

// AppPassword is optional on an update - leaving it blank keeps whatever is already stored, so
// the sender email can be corrected without having to paste the app password in again every time.
public record EmailSettingsRequest(string SenderEmail, string? AppPassword);
