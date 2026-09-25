namespace Ngila.Api.DTOs.Auth;

public record RegisterVendorRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    string BusinessName,
    string? BusinessDescription,
    Guid CategoryId,
    string LocationDescription,
    decimal? Latitude,
    decimal? Longitude,
    TimeSpan? OpeningTime,
    TimeSpan? ClosingTime,
    string? ImageUrl);
