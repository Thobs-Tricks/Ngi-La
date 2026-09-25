using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Vendors;

// Creates the vendor's account and attaches it to an existing unclaimed (community-added)
// listing in one atomic step - the real business "claiming" a listing someone else added.
public record ClaimVendorRequest(
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string Password,
    Gender? Gender);
