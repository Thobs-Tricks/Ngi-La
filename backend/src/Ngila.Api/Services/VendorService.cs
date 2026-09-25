using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Stats;
using Ngila.Api.DTOs.Vendors;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class VendorService : IVendorService
{
    private readonly ApplicationDbContext _context;

    public VendorService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken ct = default)
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryResponse(c.Id, c.Name))
            .ToListAsync(ct);
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

        return MapToResponse(vendor, GeoUtils.DefaultLatitude, GeoUtils.DefaultLongitude);
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
