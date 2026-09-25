using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Auth;

// One shape for all three account types - UserType picks Customer/Vendor/Admin. Vendor accounts
// are personal details only here; shop setup happens separately via PUT /api/vendors/me.
// Creating UserType.Admin is only permitted when the caller is already an authenticated Admin
// with AdminTitle.OperationsAdmin - enforced in AuthService.RegisterAsync, not by this DTO.
// AdminTitle is required (and only meaningful) when UserType is Admin.
public record RegisterRequest(
    UserType UserType,
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    Gender? Gender,
    AdminTitle? AdminTitle);
