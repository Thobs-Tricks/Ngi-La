using Ngila.Api.Common;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Feed;

namespace Ngila.Api.Services.Interfaces;

public interface IFeedService
{
    Task<IReadOnlyList<FeedItemResponse>> GetFeedAsync(int take, Guid? callerUserId, CancellationToken ct = default);
    Task<ServiceResult<FeedItemResponse>> CreatePostAsync(Guid authorUserId, string authorDisplayRole, CreateFeedPostRequest request, CancellationToken ct = default);
    Task<ServiceResult<LikeResponse>> ToggleLikeAsync(Guid postId, Guid userId, CancellationToken ct = default);
    Task<ServiceResult<IReadOnlyList<CommentResponse>>> GetCommentsAsync(Guid postId, CancellationToken ct = default);
    Task<ServiceResult<CommentResponse>> AddCommentAsync(Guid postId, Guid userId, CreateCommentRequest request, CancellationToken ct = default);
}
