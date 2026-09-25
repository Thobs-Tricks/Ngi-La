namespace Ngila.Api.DTOs.Vendors;

// Creates the calling vendor's shop profile if they don't have one yet, or updates it if they
// do - one endpoint covers both "MySpaza" setup and later edits.
public record UpsertVendorProfileRequest(
    string BusinessName,
    string? Description,
    Guid CategoryId,
    string LocationDescription,
    decimal? Latitude,
    decimal? Longitude,
    TimeSpan? OpeningTime,
    TimeSpan? ClosingTime,
    string? ImageUrl);
