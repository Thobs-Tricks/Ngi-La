using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
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
        var vendorQuery = _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            // Excludes suspended vendors and anyone who never confirmed their email - an
            // unconfirmed registration shouldn't be able to appear as a public listing.
            .Where(v => v.Status != VendorStatus.Suspended && v.User.EmailConfirmed)
            .AsQueryable();

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
        var vendor = await _context.VendorProfiles
            .Include(v => v.User)
            .Include(v => v.Category)
            .Where(v => v.Status != VendorStatus.Suspended && v.User.EmailConfirmed)
            .FirstOrDefaultAsync(v => v.Id == id, ct);

        if (vendor is null)
            return null;

        return MapToResponse(vendor, latitude ?? GeoUtils.DefaultLatitude, longitude ?? GeoUtils.DefaultLongitude);
    }

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
            Rating: vendor.Rating,
            ReviewsCount: vendor.ReviewsCount,
            IsOpen: DisplayFormatting.IsOpenNow(vendor.OpeningTime, vendor.ClosingTime),
            IsVerified: vendor.Status == VendorStatus.Verified,
            // Every vendor today is created via self-registration, so it always has an owning,
            // authenticated account - "claimed" only becomes meaningful once community-added
            // (unclaimed) listings exist as a feature.
            Claimed: true,
            Image: vendor.ImageUrl,
            Phone: vendor.User.PhoneNumber,
            Hours: DisplayFormatting.FormatHours(vendor.OpeningTime, vendor.ClosingTime));
    }
}
