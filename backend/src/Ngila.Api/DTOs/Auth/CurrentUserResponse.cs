namespace Ngila.Api.DTOs.Auth;

public record CurrentUserResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    string Role,
    bool EmailConfirmed,
    DateTime CreatedAt);
