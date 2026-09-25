using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Vendors;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class ReviewService : IReviewService
{
    private readonly ApplicationDbContext _context;

    public ReviewService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ServiceResult<ReviewResponse>> SubmitReviewAsync(
        Guid vendorId, Guid userId, ReviewRequest request, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles.FirstOrDefaultAsync(v => v.Id == vendorId, ct);
        if (vendor is null || vendor.Status == VendorStatus.Suspended)
            return ServiceResult<ReviewResponse>.Failure("Vendor not found.", 404);

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.VendorId == vendorId && r.UserId == userId, ct);

        if (existingReview is not null)
        {
            // Weighted-average update: remove the reviewer's old score, add their new one, count
            // stays the same since this is an edit, not a new review.
            var totalExcludingOld = vendor.Rating * vendor.ReviewsCount - existingReview.Rating;
            vendor.Rating = vendor.ReviewsCount > 0
                ? Math.Round((totalExcludingOld + request.Rating) / vendor.ReviewsCount, 2)
                : request.Rating;

            existingReview.Rating = request.Rating;
            existingReview.Comment = request.Comment;
            existingReview.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var newCount = vendor.ReviewsCount + 1;
            vendor.Rating = Math.Round((vendor.Rating * vendor.ReviewsCount + request.Rating) / newCount, 2);
            vendor.ReviewsCount = newCount;

            existingReview = new Review
            {
                VendorId = vendorId,
                UserId = userId,
                Rating = request.Rating,
                Comment = request.Comment,
            };
            _context.Reviews.Add(existingReview);
        }

        await _context.SaveChangesAsync(ct);

        var user = await _context.Users.FirstAsync(u => u.Id == userId, ct);

        return ServiceResult<ReviewResponse>.Success(new ReviewResponse(
            existingReview.Id,
            DisplayFormatting.DisplayName(user.FirstName, user.LastName),
            existingReview.Rating,
            existingReview.Comment,
            DisplayFormatting.RelativeTime(existingReview.UpdatedAt ?? existingReview.CreatedAt)));
    }

    public async Task<ServiceResult<IReadOnlyList<ReviewResponse>>> GetReviewsAsync(Guid vendorId, CancellationToken ct = default)
    {
        var vendorExists = await _context.VendorProfiles.AnyAsync(v => v.Id == vendorId, ct);
        if (!vendorExists)
            return ServiceResult<IReadOnlyList<ReviewResponse>>.Failure("Vendor not found.", 404);

        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.VendorId == vendorId)
            .OrderByDescending(r => r.UpdatedAt ?? r.CreatedAt)
            .ToListAsync(ct);

        var response = reviews.Select(r => new ReviewResponse(
            r.Id,
            DisplayFormatting.DisplayName(r.User.FirstName, r.User.LastName),
            r.Rating,
            r.Comment,
            DisplayFormatting.RelativeTime(r.UpdatedAt ?? r.CreatedAt))).ToList();

        return ServiceResult<IReadOnlyList<ReviewResponse>>.Success(response);
    }
}
