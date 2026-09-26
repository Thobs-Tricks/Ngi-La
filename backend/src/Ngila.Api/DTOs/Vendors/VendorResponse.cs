namespace Ngila.Api.DTOs.Vendors;

public record VendorResponse(
    Guid Id,
    string Name,
    IReadOnlyList<string> Categories,
    string? Description,
    string Location,
    double Distance,
    decimal? Latitude,
    decimal? Longitude,
    decimal Rating,
    int ReviewsCount,
    bool IsOpen,
    bool IsVerified,
    bool Claimed,
    string? Image,
    IReadOnlyList<string> Photos,
    string? Phone,
    IReadOnlyList<TradingHourResponse> TradingHours);
