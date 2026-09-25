using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Stats;
using Ngila.Api.DTOs.Vendors;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class VendorService : IVendorService
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IActivityLogService _activityLog;

    public VendorService(ApplicationDbContext context, INotificationService notificationService, IActivityLogService activityLog)
    {
        _context = context;
        _notificationService = notificationService;
        _activityLog = activityLog;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name, c.VendorProfiles.Count))
            .ToListAsync(ct);
    }

    public async Task<ServiceResult<CategoryResponse>> CreateCategoryAsync(CategoryCreateRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();
        var exists = await _context.Categories.AnyAsync(c => c.Name == name, ct);
        if (exists)
            return ServiceResult<CategoryResponse>.Failure("A category with this name already exists.", 409);

        var category = new Category { Name = name };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<CategoryResponse>.Success(new CategoryResponse(category.Id, category.Name, 0), 201);
    }

    public async Task<IReadOnlyList<VendorResponse>> GetVendorsAsync(NearbyQuery query, CancellationToken ct = default)
    {
        var vendorQuery = DiscoverableVendors();

        if (query.CategoryId is not null)
            vendorQuery = vendorQuery.Where(v => v.CategoryId == query.CategoryId);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            vendorQuery = vendorQuery.Where(v =>
                v.BusinessName.Contains(term) ||
                (v.Category != null && v.Category.Name.Contains(term)));
        }

        var vendors = await vendorQuery.ToListAsync(ct);

        var latitude = query.Latitude ?? GeoUtils.DefaultLatitude;
        var longitude = query.Longitude ?? GeoUtils.DefaultLongitude;

        return vendors
            .Select(v => MapToResponse(v, latitude, longitude))
            .OrderBy(v => v.Distance)
            .ToList();
    }

    public async Task<VendorResponse?> GetVendorByIdAsync(Guid id, decimal? latitude, decimal? longitude, CancellationToken ct = default)
    {
        var vendor = await DiscoverableVendors().FirstOrDefaultAsync(v => v.Id == id, ct);

        if (vendor is null)
            return null;

        return MapToResponse(vendor, latitude ?? GeoUtils.DefaultLatitude, longitude ?? GeoUtils.DefaultLongitude);
    }

    public async Task<VendorResponse> AddVendorAsync(Guid addedByUserId, AddVendorRequest request, CancellationToken ct = default)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
            throw new InvalidOperationException("Selected category does not exist.");

        var vendor = new VendorProfile
        {
            UserId = null, // unclaimed - see product doc's "community vendor discovery"
            AddedByUserId = addedByUserId,
            BusinessName = request.BusinessName,
            Description = request.Description,
            CategoryId = request.CategoryId,
            LocationDescription = request.LocationDescription,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            ContactPhone = request.ContactPhone,
            ImageUrl = request.ImageUrl,
            Status = VendorStatus.PendingVerification,
        };

        _context.VendorProfiles.Add(vendor);
        await _context.SaveChangesAsync(ct);

        var category = await _context.Categories.FirstAsync(c => c.Id == request.CategoryId, ct);
        vendor.Category = category;

        await _activityLog.LogAsync(addedByUserId, $"added {vendor.BusinessName}", "vendor-added", ct);

        return MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude);
    }

    public async Task<ServiceResult<VendorResponse>> GetOwnProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .FirstOrDefaultAsync(v => v.UserId == userId, ct);

        if (vendor is null)
            return ServiceResult<VendorResponse>.Failure("You haven't set up your shop profile yet.", 404);

        return ServiceResult<VendorResponse>.Success(MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude));
    }

    public async Task<ServiceResult<VendorResponse>> UpsertOwnProfileAsync(Guid userId, UpsertVendorProfileRequest request, CancellationToken ct = default)
    {
        var categoryExists = await _context.Categories.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (!categoryExists)
            return ServiceResult<VendorResponse>.Failure("Selected category does not exist.", 400);

        var vendor = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .FirstOrDefaultAsync(v => v.UserId == userId, ct);

        var isNew = vendor is null;
        if (vendor is null)
        {
            vendor = new VendorProfile { UserId = userId, Status = VendorStatus.PendingVerification };
            _context.VendorProfiles.Add(vendor);
        }

        vendor.BusinessName = request.BusinessName;
        vendor.Description = request.Description;
        vendor.CategoryId = request.CategoryId;
        vendor.LocationDescription = request.LocationDescription;
        vendor.Latitude = request.Latitude;
        vendor.Longitude = request.Longitude;
        vendor.OpeningTime = request.OpeningTime;
        vendor.ClosingTime = request.ClosingTime;
        vendor.ImageUrl = request.ImageUrl;

        await _context.SaveChangesAsync(ct);

        if (isNew)
        {
            vendor.User = await _context.Users.FirstAsync(u => u.Id == userId, ct);
            vendor.Category = await _context.Categories.FirstAsync(c => c.Id == request.CategoryId, ct);
        }

        return ServiceResult<VendorResponse>.Success(
            MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude), isNew ? 201 : 200);
    }

    public async Task<IReadOnlyList<VerificationQueueItemResponse>> GetVerificationQueueAsync(CancellationToken ct = default)
    {
        var pending = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .Include(v => v.AddedByUser)
            .Where(v => v.Status == VendorStatus.PendingVerification && v.UserId != null)
            .OrderBy(v => v.CreatedAt)
            .ToListAsync(ct);

        return pending.Select(v => new VerificationQueueItemResponse(
            v.Id,
            v.BusinessName,
            v.Category?.Name ?? "Uncategorised",
            v.LocationDescription ?? "Location not set",
            DisplayFormatting.DisplayName(v.User!.FirstName, v.User.LastName),
            v.User.Email!,
            v.AddedByUser is null ? null : DisplayFormatting.DisplayName(v.AddedByUser.FirstName, v.AddedByUser.LastName),
            v.Description,
            v.ImageUrl,
            DisplayFormatting.RelativeTime(v.CreatedAt))).ToList();
    }

    public async Task<ServiceResult<VendorResponse>> VerifyVendorAsync(Guid vendorId, Guid adminUserId, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .FirstOrDefaultAsync(v => v.Id == vendorId, ct);

        if (vendor is null)
            return ServiceResult<VendorResponse>.Failure("Vendor not found.", 404);

        vendor.Status = VendorStatus.Verified;
        await _context.SaveChangesAsync(ct);

        if (vendor.UserId is not null)
        {
            await _notificationService.NotifyAsync(
                vendor.UserId.Value, "You're verified!",
                $"{vendor.BusinessName} has been verified by Ngila and is now shown as a trusted listing.",
                vendor.Id, ct);
        }

        await _activityLog.LogAsync(adminUserId, $"verified {vendor.BusinessName}", "vendor-verified", ct);

        return ServiceResult<VendorResponse>.Success(MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude));
    }

    public async Task<ServiceResult<MessageResponse>> RejectClaimAsync(Guid vendorId, Guid adminUserId, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles.FirstOrDefaultAsync(v => v.Id == vendorId, ct);
        if (vendor is null)
            return ServiceResult<MessageResponse>.Failure("Vendor not found.", 404);

        var claimantUserId = vendor.UserId;
        if (claimantUserId is null)
            return ServiceResult<MessageResponse>.Failure("This vendor has no pending claim to reject.", 400);

        // Revert to unclaimed rather than suspending - the claim itself is what's being rejected
        // (e.g. failed ID/GPS checks), not necessarily the underlying business listing, which
        // stays discoverable for a legitimate owner to claim later.
        vendor.UserId = null;
        await _context.SaveChangesAsync(ct);

        await _notificationService.NotifyAsync(
            claimantUserId.Value, "Your claim wasn't approved",
            $"Your claim on {vendor.BusinessName} was not approved. The listing is now open for claiming again.",
            vendor.Id, ct);

        await _activityLog.LogAsync(adminUserId, $"rejected a claim on {vendor.BusinessName}", "claim-rejected", ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Claim rejected. The listing is unclaimed again."));
    }

    public async Task<ServiceResult<MessageResponse>> RequestInfoAsync(Guid vendorId, RequestInfoRequest request, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles.FirstOrDefaultAsync(v => v.Id == vendorId, ct);
        if (vendor is null)
            return ServiceResult<MessageResponse>.Failure("Vendor not found.", 404);

        if (vendor.UserId is null)
            return ServiceResult<MessageResponse>.Failure("This vendor has no claimant to contact.", 400);

        await _notificationService.NotifyAsync(
            vendor.UserId.Value, $"More info needed for {vendor.BusinessName}",
            request.Message, vendor.Id, ct);

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Request sent to the claimant."));
    }

    public async Task<PlatformStatsResponse> GetStatsAsync(CancellationToken ct = default)
    {
        var vendorCount = await DiscoverableVendors().CountAsync(ct);
        var reviewCount = await _context.Reviews.CountAsync(ct);
        var areaCount = await DiscoverableVendors()
            .Where(v => v.LocationDescription != null)
            .Select(v => v.LocationDescription)
            .Distinct()
            .CountAsync(ct);

        return new PlatformStatsResponse(vendorCount, reviewCount, areaCount);
    }

    public async Task<IReadOnlyList<AdminVendorResponse>> GetAllForAdminAsync(CancellationToken ct = default)
    {
        var vendors = await _context.VendorProfiles
            .Include(v => v.Category)
            .Include(v => v.AddedByUser)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

        return vendors.Select(MapToAdminResponse).ToList();
    }

    public async Task<ServiceResult<AdminVendorResponse>> SetSuspendedAsync(Guid vendorId, bool suspended, Guid adminUserId, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles
            .Include(v => v.Category)
            .Include(v => v.AddedByUser)
            .FirstOrDefaultAsync(v => v.Id == vendorId, ct);

        if (vendor is null)
            return ServiceResult<AdminVendorResponse>.Failure("Vendor not found.", 404);

        // Suspension only makes sense for a vendor that was actually live (Verified) - a still-
        // pending listing should go through reject-claim instead, not suspend.
        if (suspended && vendor.Status != VendorStatus.Verified)
            return ServiceResult<AdminVendorResponse>.Failure("Only verified vendors can be suspended.", 400);
        if (!suspended && vendor.Status != VendorStatus.Suspended)
            return ServiceResult<AdminVendorResponse>.Failure("This vendor isn't suspended.", 400);

        vendor.Status = suspended ? VendorStatus.Suspended : VendorStatus.Verified;
        await _context.SaveChangesAsync(ct);

        if (vendor.UserId is not null)
        {
            await _notificationService.NotifyAsync(
                vendor.UserId.Value,
                suspended ? "Your listing was suspended" : "Your listing is active again",
                suspended
                    ? $"{vendor.BusinessName} has been suspended by Ngila and is no longer shown to customers."
                    : $"{vendor.BusinessName} is active again and visible to customers.",
                vendor.Id, ct);
        }

        await _activityLog.LogAsync(
            adminUserId,
            $"{(suspended ? "suspended" : "reinstated")} {vendor.BusinessName}",
            suspended ? "vendor-suspended" : "vendor-reinstated", ct);

        return ServiceResult<AdminVendorResponse>.Success(MapToAdminResponse(vendor));
    }

    private static AdminVendorResponse MapToAdminResponse(VendorProfile v) => new(
        v.Id,
        v.BusinessName,
        v.Category?.Name ?? "Uncategorised",
        v.LocationDescription ?? "Location not set",
        DeriveAdminStatus(v),
        v.Rating,
        v.ReviewsCount,
        v.AddedByUser is null ? null : DisplayFormatting.DisplayName(v.AddedByUser.FirstName, v.AddedByUser.LastName),
        DisplayFormatting.RelativeTime(v.CreatedAt),
        v.ImageUrl,
        v.UserId is not null);

    private static string DeriveAdminStatus(VendorProfile v) => v.Status switch
    {
        VendorStatus.Suspended => "Suspended",
        VendorStatus.Verified => "Verified",
        _ => v.UserId is null ? "CommunityAdded" : "Pending",
    };

    // A vendor is publicly discoverable if it's not suspended, and either unclaimed (community
    // added, no account to confirm an email on) or its owner has confirmed their email - closes
    // a spam-listing gap where an unconfirmed self-registration would otherwise be visible.
    private IQueryable<VendorProfile> DiscoverableVendors() =>
        _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .Where(v => v.Status != VendorStatus.Suspended && (v.UserId == null || v.User!.EmailConfirmed));

    private static VendorResponse MapToResponse(VendorProfile vendor, decimal latitude, decimal longitude)
    {
        var distance = vendor.Latitude is not null && vendor.Longitude is not null
            ? GeoUtils.DistanceMeters(latitude, longitude, vendor.Latitude.Value, vendor.Longitude.Value)
            : 0;

        return new VendorResponse(
            Id: vendor.Id,
            Name: vendor.BusinessName,
            Category: vendor.Category?.Name ?? "Uncategorised",
            Description: vendor.Description,
            Location: vendor.LocationDescription ?? "Location not set",
            Distance: Math.Round(distance, 0),
            Latitude: vendor.Latitude,
            Longitude: vendor.Longitude,
            Rating: vendor.Rating,
            ReviewsCount: vendor.ReviewsCount,
            IsOpen: DisplayFormatting.IsOpenNow(vendor.OpeningTime, vendor.ClosingTime),
            IsVerified: vendor.Status == VendorStatus.Verified,
            Claimed: vendor.UserId is not null,
            Image: vendor.ImageUrl,
            Phone: vendor.User?.PhoneNumber ?? vendor.ContactPhone,
            Hours: DisplayFormatting.FormatHours(vendor.OpeningTime, vendor.ClosingTime));
    }
}
