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
    private const int MaxGalleryPhotos = 5;

    // Monday-first, matching the vendor app's trading-hours editor - DayOfWeek numbers Sunday=0,
    // which would otherwise sort Sunday to the front of every response.
    private static readonly DayOfWeek[] WeekOrder =
    {
        DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday,
        DayOfWeek.Friday, DayOfWeek.Saturday, DayOfWeek.Sunday,
    };

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
            vendorQuery = vendorQuery.Where(v => v.Categories.Any(c => c.Id == query.CategoryId));

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            vendorQuery = vendorQuery.Where(v =>
                v.BusinessName.Contains(term) ||
                v.Categories.Any(c => c.Name.Contains(term)));
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

    public async Task<ServiceResult<VendorResponse>> GetOwnProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var vendor = await OwnProfileQuery().FirstOrDefaultAsync(v => v.UserId == userId, ct);

        if (vendor is null)
            return ServiceResult<VendorResponse>.Failure("You haven't set up your shop profile yet.", 404);

        return ServiceResult<VendorResponse>.Success(MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude));
    }

    public async Task<ServiceResult<VendorResponse>> UpsertOwnProfileAsync(Guid userId, UpsertVendorProfileRequest request, CancellationToken ct = default)
    {
        var categories = await _context.Categories.Where(c => request.CategoryIds.Contains(c.Id)).ToListAsync(ct);
        if (categories.Count != request.CategoryIds.Distinct().Count())
            return ServiceResult<VendorResponse>.Failure("One or more selected categories does not exist.", 400);

        var vendor = await OwnProfileQuery().FirstOrDefaultAsync(v => v.UserId == userId, ct);

        var isNew = vendor is null;
        if (vendor is null)
        {
            vendor = new VendorProfile { UserId = userId, Status = VendorStatus.PendingVerification };
            _context.VendorProfiles.Add(vendor);
        }

        vendor.BusinessName = request.BusinessName;
        vendor.Description = request.Description;
        vendor.LocationDescription = request.LocationDescription;
        vendor.Latitude = request.Latitude;
        vendor.Longitude = request.Longitude;
        vendor.ContactPhone = request.ContactPhone;
        vendor.ImageUrl = request.ImageUrl;

        // Full replace - resend the whole set each time, not a diff/patch. Categories are
        // pre-existing rows being re-linked (not created), so mutating the tracked collection in
        // place is safe here - unlike the Photos/TradingHours replace pattern below, there's no
        // "new row with an already-set key" ambiguity for EF to misread.
        vendor.Categories.Clear();
        foreach (var category in categories)
            vendor.Categories.Add(category);

        await _context.SaveChangesAsync(ct);

        if (isNew)
            vendor.User = await _context.Users.FirstAsync(u => u.Id == userId, ct);

        return ServiceResult<VendorResponse>.Success(
            MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude), isNew ? 201 : 200);
    }

    public async Task<ServiceResult<VendorResponse>> UpdateOwnTradingHoursAsync(Guid userId, UpdateVendorTradingHoursRequest request, CancellationToken ct = default)
    {
        var vendor = await OwnProfileQuery().FirstOrDefaultAsync(v => v.UserId == userId, ct);
        if (vendor is null)
            return ServiceResult<VendorResponse>.Failure("You haven't set up your shop profile yet.", 404);

        // Added straight to the DbSet rather than through the navigation collection: the entity
        // carries a non-default Guid Id (set by its own constructor), and when EF only discovers
        // new rows via navigation-collection fixup on an already-tracked parent, it assumes a
        // non-default key means "existing row" and marks them Modified instead of Added -
        // producing UPDATEs that hit zero rows. Adding via the DbSet directly forces Added state
        // unambiguously regardless of the key's value.
        if (vendor.TradingHours.Count > 0)
            _context.VendorTradingHours.RemoveRange(vendor.TradingHours);
        vendor.TradingHours.Clear();
        _context.VendorTradingHours.AddRange(request.TradingHours.Select(h => new VendorTradingHours
        {
            VendorProfileId = vendor.Id,
            DayOfWeek = Enum.Parse<DayOfWeek>(h.Day),
            IsOpen = h.IsOpen,
            OpenTime = h.IsOpen && h.OpenTime is not null ? TimeSpan.ParseExact(h.OpenTime, "hh\\:mm", null) : null,
            CloseTime = h.IsOpen && h.CloseTime is not null ? TimeSpan.ParseExact(h.CloseTime, "hh\\:mm", null) : null,
        }));

        await _context.SaveChangesAsync(ct);

        return ServiceResult<VendorResponse>.Success(
            MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude));
    }

    public async Task<ServiceResult<VendorResponse>> UpdateOwnPhotosAsync(Guid userId, UpdateVendorPhotosRequest request, CancellationToken ct = default)
    {
        if (request.PhotoUrls.Count > MaxGalleryPhotos)
            return ServiceResult<VendorResponse>.Failure($"You can add up to {MaxGalleryPhotos} photos.", 400);

        var vendor = await OwnProfileQuery().FirstOrDefaultAsync(v => v.UserId == userId, ct);
        if (vendor is null)
            return ServiceResult<VendorResponse>.Failure("You haven't set up your shop profile yet.", 404);

        // Same DbSet-direct pattern as trading hours above, for the same reason.
        if (vendor.Photos.Count > 0)
            _context.VendorProfilePhotos.RemoveRange(vendor.Photos);
        vendor.Photos.Clear();
        _context.VendorProfilePhotos.AddRange(
            request.PhotoUrls.Select((url, index) => new VendorProfilePhoto { VendorProfileId = vendor.Id, Url = url, SortOrder = index }));

        await _context.SaveChangesAsync(ct);

        return ServiceResult<VendorResponse>.Success(
            MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude));
    }

    public async Task<IReadOnlyList<VerificationQueueItemResponse>> GetVerificationQueueAsync(CancellationToken ct = default)
    {
        var pending = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Categories)
            .Include(v => v.AddedByUser)
            .Where(v => v.Status == VendorStatus.PendingVerification && v.UserId != null)
            .OrderBy(v => v.CreatedAt)
            .ToListAsync(ct);

        return pending.Select(v => new VerificationQueueItemResponse(
            v.Id,
            v.BusinessName,
            CategoryNames(v),
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
        var vendor = await OwnProfileQuery().FirstOrDefaultAsync(v => v.Id == vendorId, ct);

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
            .Include(v => v.Categories)
            .Include(v => v.AddedByUser)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

        return vendors.Select(MapToAdminResponse).ToList();
    }

    public async Task<ServiceResult<AdminVendorResponse>> SetSuspendedAsync(Guid vendorId, bool suspended, Guid adminUserId, CancellationToken ct = default)
    {
        var vendor = await _context.VendorProfiles
            .Include(v => v.Categories)
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
        CategoryNames(v),
        v.LocationDescription ?? "Location not set",
        v.Latitude,
        v.Longitude,
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
        _ => "Pending",
    };

    private static string CategoryNames(VendorProfile v) =>
        v.Categories.Count > 0 ? string.Join(", ", v.Categories.Select(c => c.Name).OrderBy(n => n)) : "Uncategorised";

    // Everything a VendorResponse needs to be built from, in one place - used by every read path
    // (discovery, own-profile, verification decisions) so nobody forgets an Include and gets a
    // silently-empty Categories/Photos/TradingHours list back.
    private IQueryable<VendorProfile> OwnProfileQuery() =>
        _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Categories)
            .Include(v => v.Photos)
            .Include(v => v.TradingHours);

    // A vendor is publicly discoverable if it's not suspended, and either unclaimed (community
    // added, no account to confirm an email on) or its owner has confirmed their email - closes
    // a spam-listing gap where an unconfirmed self-registration would otherwise be visible.
    private IQueryable<VendorProfile> DiscoverableVendors() =>
        OwnProfileQuery().Where(v => v.Status != VendorStatus.Suspended && (v.UserId == null || v.User!.EmailConfirmed));

    private static VendorResponse MapToResponse(VendorProfile vendor, decimal latitude, decimal longitude)
    {
        var distance = vendor.Latitude is not null && vendor.Longitude is not null
            ? GeoUtils.DistanceMeters(latitude, longitude, vendor.Latitude.Value, vendor.Longitude.Value)
            : 0;

        var tradingHours = WeekOrder
            .Select(day => vendor.TradingHours.FirstOrDefault(h => h.DayOfWeek == day) is { } h
                ? new TradingHourResponse(day.ToString(), h.IsOpen, h.OpenTime is null ? null : DisplayFormatting.FormatTime(h.OpenTime.Value), h.CloseTime is null ? null : DisplayFormatting.FormatTime(h.CloseTime.Value))
                : new TradingHourResponse(day.ToString(), false, null, null))
            .ToList();

        return new VendorResponse(
            Id: vendor.Id,
            Name: vendor.BusinessName,
            Categories: vendor.Categories.Select(c => c.Name).OrderBy(n => n).ToList(),
            Description: vendor.Description,
            Location: vendor.LocationDescription ?? "Location not set",
            Distance: Math.Round(distance, 0),
            Latitude: vendor.Latitude,
            Longitude: vendor.Longitude,
            Rating: vendor.Rating,
            ReviewsCount: vendor.ReviewsCount,
            IsOpen: DisplayFormatting.IsOpenNow(vendor.TradingHours),
            IsVerified: vendor.Status == VendorStatus.Verified,
            Claimed: vendor.UserId is not null,
            Image: vendor.ImageUrl,
            Photos: vendor.Photos.OrderBy(p => p.SortOrder).Select(p => p.Url).ToList(),
            // The vendor's own business contact number takes priority over their personal
            // account phone, since they may want customers calling a different line.
            Phone: vendor.ContactPhone ?? vendor.User?.PhoneNumber,
            TradingHours: tradingHours);
    }
}
