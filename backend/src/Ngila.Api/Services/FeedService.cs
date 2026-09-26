using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Feed;
using Ngila.Api.Models.Entities;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class FeedService : IFeedService
{
    private const int MaxPhotosPerPost = 5;

    private readonly ApplicationDbContext _context;

    public FeedService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FeedItemResponse>> GetFeedAsync(int take, Guid? callerUserId, CancellationToken ct = default)
    {
        var posts = await _context.FeedPosts
            .Include(f => f.AuthorUser)
            .Include(f => f.Vendor)
            .ThenInclude(v => v!.Category)
            .Include(f => f.Photos)
            .OrderByDescending(f => f.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

        var likedPostIds = callerUserId is null
            ? new HashSet<Guid>()
            : (await _context.FeedPostLikes
                .Where(l => l.UserId == callerUserId && posts.Select(p => p.Id).Contains(l.FeedPostId))
                .Select(l => l.FeedPostId)
                .ToListAsync(ct)).ToHashSet();

        return posts.Select(f => MapToResponse(f, likedPostIds.Contains(f.Id))).ToList();
    }

    public async Task<ServiceResult<FeedItemResponse>> CreatePostAsync(
        Guid authorUserId, string authorDisplayRole, CreateFeedPostRequest request, CancellationToken ct = default)
    {
        if (request.PhotoUrls is { Count: > MaxPhotosPerPost })
            return ServiceResult<FeedItemResponse>.Failure($"You can attach up to {MaxPhotosPerPost} photos.", 400);

        if (request.VendorId is not null && !await _context.VendorProfiles.AnyAsync(v => v.Id == request.VendorId, ct))
            return ServiceResult<FeedItemResponse>.Failure("Vendor not found.", 404);

        var post = new FeedPost
        {
            AuthorUserId = authorUserId,
            AuthorDisplayRole = authorDisplayRole,
            Content = request.Content,
            VendorId = request.VendorId,
            Photos = (request.PhotoUrls ?? Array.Empty<string>())
                .Select((url, index) => new FeedPostPhoto { Url = url, SortOrder = index })
                .ToList(),
        };

        _context.FeedPosts.Add(post);
        await _context.SaveChangesAsync(ct);

        post.AuthorUser = await _context.Users.FirstAsync(u => u.Id == authorUserId, ct);
        post.Vendor = request.VendorId is null
            ? null
            : await _context.VendorProfiles.Include(v => v.Category).FirstOrDefaultAsync(v => v.Id == request.VendorId, ct);

        return ServiceResult<FeedItemResponse>.Success(MapToResponse(post, likedByMe: false), 201);
    }

    public async Task<ServiceResult<LikeResponse>> ToggleLikeAsync(Guid postId, Guid userId, CancellationToken ct = default)
    {
        var post = await _context.FeedPosts.FirstOrDefaultAsync(f => f.Id == postId, ct);
        if (post is null)
            return ServiceResult<LikeResponse>.Failure("Post not found.", 404);

        var existingLike = await _context.FeedPostLikes
            .FirstOrDefaultAsync(l => l.FeedPostId == postId && l.UserId == userId, ct);

        bool liked;
        if (existingLike is null)
        {
            _context.FeedPostLikes.Add(new FeedPostLike { FeedPostId = postId, UserId = userId });
            post.LikesCount++;
            liked = true;
        }
        else
        {
            _context.FeedPostLikes.Remove(existingLike);
            post.LikesCount = Math.Max(0, post.LikesCount - 1);
            liked = false;
        }

        await _context.SaveChangesAsync(ct);

        return ServiceResult<LikeResponse>.Success(new LikeResponse(liked, post.LikesCount));
    }

    public async Task<ServiceResult<IReadOnlyList<CommentResponse>>> GetCommentsAsync(Guid postId, CancellationToken ct = default)
    {
        if (!await _context.FeedPosts.AnyAsync(f => f.Id == postId, ct))
            return ServiceResult<IReadOnlyList<CommentResponse>>.Failure("Post not found.", 404);

        var comments = await _context.FeedPostComments
            .Include(c => c.User)
            .Where(c => c.FeedPostId == postId)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync(ct);

        return ServiceResult<IReadOnlyList<CommentResponse>>.Success(comments.Select(c => new CommentResponse(
            c.Id,
            DisplayFormatting.DisplayName(c.User.FirstName, c.User.LastName),
            DisplayFormatting.Initials(c.User.FirstName, c.User.LastName),
            c.Content,
            DisplayFormatting.RelativeTime(c.CreatedAt))).ToList());
    }

    public async Task<ServiceResult<CommentResponse>> AddCommentAsync(Guid postId, Guid userId, CreateCommentRequest request, CancellationToken ct = default)
    {
        var post = await _context.FeedPosts.FirstOrDefaultAsync(f => f.Id == postId, ct);
        if (post is null)
            return ServiceResult<CommentResponse>.Failure("Post not found.", 404);

        var comment = new FeedPostComment
        {
            FeedPostId = postId,
            UserId = userId,
            Content = request.Content,
        };

        _context.FeedPostComments.Add(comment);
        post.CommentsCount++;
        await _context.SaveChangesAsync(ct);

        var author = await _context.Users.FirstAsync(u => u.Id == userId, ct);

        return ServiceResult<CommentResponse>.Success(new CommentResponse(
            comment.Id,
            DisplayFormatting.DisplayName(author.FirstName, author.LastName),
            DisplayFormatting.Initials(author.FirstName, author.LastName),
            comment.Content,
            DisplayFormatting.RelativeTime(comment.CreatedAt)), 201);
    }

    private static FeedItemResponse MapToResponse(FeedPost f, bool likedByMe) => new(
        Id: f.Id,
        User: DisplayFormatting.DisplayName(f.AuthorUser.FirstName, f.AuthorUser.LastName),
        Role: f.AuthorDisplayRole,
        Time: DisplayFormatting.RelativeTime(f.CreatedAt),
        Content: f.Content,
        VendorId: f.VendorId,
        VendorName: f.Vendor?.BusinessName,
        VendorCategory: f.Vendor?.Category?.Name,
        Likes: f.LikesCount,
        Comments: f.CommentsCount,
        Avatar: DisplayFormatting.Initials(f.AuthorUser.FirstName, f.AuthorUser.LastName),
        VendorImage: f.Vendor?.ImageUrl,
        Photos: f.Photos.OrderBy(p => p.SortOrder).Select(p => p.Url).ToList(),
        LikedByMe: likedByMe);
}
