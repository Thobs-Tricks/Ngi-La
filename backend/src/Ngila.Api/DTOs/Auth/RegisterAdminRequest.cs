using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Auth;

public record RegisterAdminRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    Gender? Gender);
