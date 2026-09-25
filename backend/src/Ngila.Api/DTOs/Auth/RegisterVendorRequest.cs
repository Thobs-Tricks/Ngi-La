using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Auth;

// Personal details only - the vendor's shop profile (business name, category, location, hours)
// is set up separately after registration via PUT /api/vendors/me, once they're logged in.
public record RegisterVendorRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    Gender? Gender);
