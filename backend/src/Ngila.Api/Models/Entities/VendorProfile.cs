using Ngila.Api.Models.Enums;

namespace Ngila.Api.Models.Entities;

public class VendorProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Null = "community-added" and not yet claimed by the actual business owner - the core
    // Ngila mechanic where a customer can add a vendor before it has any account at all.
    public Guid? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    // The customer (or vendor) who community-added this listing, for attribution and so we can
    // notify them once it gets claimed. Null for vendors created via ordinary self-registration.
    public Guid? AddedByUserId { get; set; }
    public ApplicationUser? AddedByUser { get; set; }

    public string BusinessName { get; set; } = default!;
    public string? Description { get; set; }
    public VendorStatus Status { get; set; } = VendorStatus.PendingVerification;

    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }

    // Free-text location, since many informal vendors have no formal street address
    // (e.g. "next to the taxi rank") - see product doc section on location uncertainty.
    public string? LocationDescription { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }

    public TimeSpan? OpeningTime { get; set; }
    public TimeSpan? ClosingTime { get; set; }

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
