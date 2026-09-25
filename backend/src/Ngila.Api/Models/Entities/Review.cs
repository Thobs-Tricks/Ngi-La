namespace Ngila.Api.Models.Entities;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VendorId { get; set; }
    public VendorProfile Vendor { get; set; } = default!;

    public Guid UserId { get; set; }
    public ApplicationUser User { get; set; } = default!;

    public int Rating { get; set; }
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
