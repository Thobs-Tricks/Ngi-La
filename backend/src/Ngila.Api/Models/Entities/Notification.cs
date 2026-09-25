namespace Ngila.Api.Models.Entities;

public class Notification
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = default!;

    public string Title { get; set; } = default!;
    public string Body { get; set; } = default!;

    public Guid? VendorId { get; set; }
    public VendorProfile? Vendor { get; set; }

    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
