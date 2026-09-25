using Ngila.Api.DTOs.Admin;

namespace Ngila.Api.Services.Interfaces;

public interface IAdminService
{
    Task<AdminStatsResponse> GetStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(CancellationToken ct = default);
}
