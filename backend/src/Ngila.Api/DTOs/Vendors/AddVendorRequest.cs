namespace Ngila.Api.DTOs.Vendors;

// Lets a logged-in customer (or vendor) submit a vendor they've spotted but that isn't on Ngila
// yet - the listing starts unclaimed (no owning account) until the real business claims it.
public record AddVendorRequest(
    string BusinessName,
    string? Description,
    Guid CategoryId,
    string LocationDescription,
    decimal? Latitude,
    decimal? Longitude,
    string? ContactPhone,
    string? ImageUrl);
