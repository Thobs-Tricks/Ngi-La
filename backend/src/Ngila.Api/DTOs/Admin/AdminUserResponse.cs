namespace Ngila.Api.DTOs.Admin;

public record AdminUserResponse(
    Guid Id,
    string Name,
    string Email,
    string Role,
    bool IsActive,
    string Joined,
    int VendorsAdded,
    int ReviewsWritten);
