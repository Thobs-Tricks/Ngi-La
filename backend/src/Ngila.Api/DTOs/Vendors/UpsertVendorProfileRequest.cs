namespace Ngila.Api.DTOs.Vendors;

// Creates the calling vendor's shop profile if they don't have one yet, or updates it if they
// do - covers "MySpaza" setup and later edits of the core business details. Trading hours and
// photos are saved separately via UpdateVendorTradingHoursRequest/UpdateVendorPhotosRequest, so
// the app can save one section without resending the others. CategoryIds is still a full
// replace - resend the whole set each time, not a diff/patch.
public record UpsertVendorProfileRequest(
    string BusinessName,
    string? Description,
    IReadOnlyList<Guid> CategoryIds,
    string LocationDescription,
    decimal? Latitude,
    decimal? Longitude,
    string? ContactPhone,
    string? ImageUrl);

// Full replace of the calling vendor's weekly trading hours.
public record UpdateVendorTradingHoursRequest(IReadOnlyList<TradingHourRequest> TradingHours);

// Full replace of the calling vendor's gallery photos (max 5, enforced in VendorService).
public record UpdateVendorPhotosRequest(IReadOnlyList<string> PhotoUrls);
