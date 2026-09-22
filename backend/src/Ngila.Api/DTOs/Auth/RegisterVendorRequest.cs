namespace Ngila.Api.DTOs.Auth;

public record RegisterVendorRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    string ConfirmPassword,
    string BusinessName,
    string? BusinessDescription);
