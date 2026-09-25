namespace Ngila.Api.DTOs.Admin;

public record AdminVendorResponse(
    Guid Id,
    string Name,
    string Category,
    string Location,
    string Status,
    decimal Rating,
    int ReviewsCount,
    string? AddedBy,
    string Updated,
    string? Image,
    bool Claimed);
