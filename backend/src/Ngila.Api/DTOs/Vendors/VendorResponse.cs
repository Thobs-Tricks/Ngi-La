namespace Ngila.Api.DTOs.Vendors;

public record VendorResponse(
    Guid Id,
    string Name,
    string Category,
    string? Description,
    string Location,
    double Distance,
    decimal Rating,
    int ReviewsCount,
    bool IsOpen,
    bool IsVerified,
    bool Claimed,
    string? Image,
    string? Phone,
    string Hours);
