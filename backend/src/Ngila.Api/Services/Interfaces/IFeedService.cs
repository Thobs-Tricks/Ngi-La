using Ngila.Api.DTOs.Feed;

namespace Ngila.Api.Services.Interfaces;

public interface IFeedService
{
    Task<IReadOnlyList<FeedItemResponse>> GetFeedAsync(int take, CancellationToken ct = default);
}
