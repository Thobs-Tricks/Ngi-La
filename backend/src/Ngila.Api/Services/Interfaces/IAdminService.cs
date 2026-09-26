using Ngila.Api.Common;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;

namespace Ngila.Api.Services.Interfaces;

public interface IAdminService
{
    Task<AdminStatsResponse> GetStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(CancellationToken ct = default);

    // Disables/re-enables a Customer or Vendor account's ability to log in (revokes any live
    // sessions when suspending). Admin accounts are rejected here as a safety rail.
    Task<ServiceResult<AdminUserResponse>> SetUserActiveAsync(Guid targetUserId, bool active, Guid adminUserId, CancellationToken ct = default);

    // Support tool for accounts stuck on the confirmation/reset-password email step - there's no
    // real email provider wired up yet (see ConsoleEmailService), so this is currently the only
    // way to unblock a self-registered user. Also marks the account email-confirmed.
    Task<ServiceResult<MessageResponse>> ResetUserPasswordAsync(Guid adminUserId, AdminResetPasswordRequest request, CancellationToken ct = default);
}
