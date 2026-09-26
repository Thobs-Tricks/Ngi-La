namespace Ngila.Api.DTOs.Vendors;

// Creates the calling vendor's shop profile if they don't have one yet, or updates it if they
// do - one endpoint covers both "MySpaza" setup and later edits. Every list field here is a full
// replace, same as the scalar fields - resend the whole set each time, not a diff/patch.
public record UpsertVendorProfileRequest(
    string BusinessName,
    string? Description,
    IReadOnlyList<Guid> CategoryIds,
    string LocationDescription,
    decimal? Latitude,
    decimal? Longitude,
    string? ContactPhone,
    IReadOnlyList<TradingHourRequest>? TradingHours,
    string? ImageUrl,
    IReadOnlyList<string>? PhotoUrls);
