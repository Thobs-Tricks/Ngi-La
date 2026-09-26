namespace Ngila.Api.Models.Entities;

// Single-row table (Id is always 1) holding the SMTP sender Ngila uses for confirmation/reset
// emails, configurable from the Admin console instead of a redeploy. AppPassword is stored
// encrypted (see Common/SecretProtector) - never returned to the client once set.
public class EmailSettings
{
    public int Id { get; set; } = 1;
    public string? SenderEmail { get; set; }
    public string? EncryptedAppPassword { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
}
