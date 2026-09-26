using Ngila.Api.Models.Enums;

namespace Ngila.Api.Models.Entities;

public class VendorProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Null = unclaimed - no owning account yet. New profiles are always created with a UserId
    // (self-registration via PUT /api/vendors/me); a null value here only ever comes from legacy
    // data or an admin explicitly reverting a claim (see VendorService.RejectClaimAsync).
    public Guid? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // Legacy attribution field from the retired "community-added vendor" feature - kept only so
    // the admin console's existing "suggested by" display keeps working for old rows. Never set
    // by any current code path.
    public Guid? AddedByUserId { get; set; }
    public ApplicationUser? AddedByUser { get; set; }

    public string BusinessName { get; set; } = default!;
    public string? Description { get; set; }
    public VendorStatus Status { get; set; } = VendorStatus.PendingVerification;

    // Many-to-many (EF skip navigation, no explicit join entity needed) - a spaza selling both
    // kota and airtime picks both categories.
    public ICollection<Category> Categories { get; set; } = new List<Category>();

    // Free-text location, since many informal vendors have no formal street address
    // (e.g. "next to the taxi rank") - see product doc section on location uncertainty.
    public string? LocationDescription { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    // One row per day of the week (0-7 rows in practice - see VendorService for how a full
    // replace is enforced). Replaced OpeningTime/ClosingTime, which couldn't express "closed
    // Sundays" or different weekend hours.
    public ICollection<VendorTradingHours> TradingHours { get; set; } = new List<VendorTradingHours>();

    // The main listing photo - shown in discovery/search results and cards.
    public string? ImageUrl { get; set; }

    // Extra gallery photos beyond the main one. Max 5, enforced in VendorService.
    public ICollection<VendorProfilePhoto> Photos { get; set; } = new List<VendorProfilePhoto>();

    // Fallback contact number for a listing nobody has claimed yet (no owning User to read a
    // phone number from). Once claimed, the owner's own ApplicationUser.PhoneNumber takes over.
    public string? ContactPhone { get; set; }

    // Denormalized aggregates, updated incrementally by ReviewService alongside each review
    // write - never accepted directly from a vendor-facing request, since a vendor should not be
    // able to set their own reputation.
    public decimal Rating { get; set; }
    public int ReviewsCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class VendorProfilePhoto
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VendorProfileId { get; set; }
    public VendorProfile VendorProfile { get; set; } = default!;

    public string Url { get; set; } = default!;
    public int SortOrder { get; set; }
}

public class VendorTradingHours
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid VendorProfileId { get; set; }
    public VendorProfile VendorProfile { get; set; } = default!;

    public DayOfWeek DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public TimeSpan? OpenTime { get; set; }
    public TimeSpan? CloseTime { get; set; }
}
