using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Auth;

public record CurrentUserResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    Gender? Gender,
    string Role,
    bool EmailConfirmed,
    DateTime CreatedAt);
