using Ngila.Api.Models.Enums;

namespace Ngila.Api.Models.Entities;

public class VendorProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = default!;

    public string BusinessName { get; set; } = default!;
    public string? Description { get; set; }
    public VendorStatus Status { get; set; } = VendorStatus.PendingVerification;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
