using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Feed;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class FeedService : IFeedService
{
    private readonly ApplicationDbContext _context;

    public FeedService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<FeedItemResponse>> GetFeedAsync(int take, CancellationToken ct = default)
    {
        var posts = await _context.FeedPosts
            .Include(f => f.AuthorUser)
            .Include(f => f.Vendor)
            .ThenInclude(v => v!.Category)
            .OrderByDescending(f => f.CreatedAt)
            .Take(take)
            .ToListAsync(ct);

        return posts.Select(f => new FeedItemResponse(
            Id: f.Id,
            User: DisplayFormatting.DisplayName(f.AuthorUser.FirstName, f.AuthorUser.LastName),
            Role: f.AuthorDisplayRole,
            Time: DisplayFormatting.RelativeTime(f.CreatedAt),
            Content: f.Content,
            VendorName: f.Vendor?.BusinessName,
            VendorCategory: f.Vendor?.Category?.Name,
            Likes: f.LikesCount,
            Comments: f.CommentsCount,
            Avatar: DisplayFormatting.Initials(f.AuthorUser.FirstName, f.AuthorUser.LastName),
            VendorImage: f.Vendor?.ImageUrl
        )).ToList();
    }
}
