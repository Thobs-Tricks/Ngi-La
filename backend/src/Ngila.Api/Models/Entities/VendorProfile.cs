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

    // Nullable at the storage level so community-added vendors (a future feature) can exist
    // without a category picked yet, even though self-registration always requires one today.
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    // Free-text location, since many informal vendors have no formal street address
    // (e.g. "next to the taxi rank") - see product doc section on location uncertainty.
    public string? LocationDescription { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public TimeSpan? OpeningTime { get; set; }
    public TimeSpan? ClosingTime { get; set; }

    public string? ImageUrl { get; set; }

    // Only ever changed by a future review/rating feature or seed data - never accepted from a
    // vendor-facing request, since a vendor should not be able to set their own reputation.
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
