namespace Ngila.Api.DTOs.Vendors;

public record ReviewResponse(
    Guid Id,
    string ReviewerName,
    int Rating,
    string? Comment,
    string Time);
