using Ngila.Api.DTOs.Admin;

namespace Ngila.Api.Services.Interfaces;

public interface IActivityLogService
{
    Task LogAsync(Guid actorUserId, string description, string tone, CancellationToken ct = default);
    Task<IReadOnlyList<ActivityItemResponse>> GetRecentAsync(int take, CancellationToken ct = default);
}
