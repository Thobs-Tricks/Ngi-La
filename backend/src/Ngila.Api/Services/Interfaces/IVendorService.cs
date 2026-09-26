using Ngila.Api.Common;
using Ngila.Api.DTOs.Admin;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Stats;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Services.Interfaces;

public record NearbyQuery(decimal? Latitude, decimal? Longitude, Guid? CategoryId, string? Search);

public interface IVendorService
{
    Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken ct = default);
    Task<ServiceResult<CategoryResponse>> CreateCategoryAsync(CategoryCreateRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<VendorResponse>> GetVendorsAsync(NearbyQuery query, CancellationToken ct = default);
    Task<VendorResponse?> GetVendorByIdAsync(Guid id, decimal? latitude, decimal? longitude, CancellationToken ct = default);
    Task<PlatformStatsResponse> GetStatsAsync(CancellationToken ct = default);

    // "MySpaza" - the calling vendor's own shop profile, created the first time they set it up.
    // Split into three independent calls so the app can save each section (details, trading
    // hours, photos) on its own without resending the whole profile every time.
    Task<ServiceResult<VendorResponse>> GetOwnProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ServiceResult<VendorResponse>> UpsertOwnProfileAsync(Guid userId, UpsertVendorProfileRequest request, CancellationToken ct = default);
    Task<ServiceResult<VendorResponse>> UpdateOwnTradingHoursAsync(Guid userId, UpdateVendorTradingHoursRequest request, CancellationToken ct = default);
    Task<ServiceResult<VendorResponse>> UpdateOwnPhotosAsync(Guid userId, UpdateVendorPhotosRequest request, CancellationToken ct = default);

    // Admin verification queue: vendors with a claimant (UserId set) still awaiting a decision.
    Task<IReadOnlyList<VerificationQueueItemResponse>> GetVerificationQueueAsync(CancellationToken ct = default);
    Task<ServiceResult<VendorResponse>> VerifyVendorAsync(Guid vendorId, Guid adminUserId, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RejectClaimAsync(Guid vendorId, Guid adminUserId, CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> RequestInfoAsync(Guid vendorId, RequestInfoRequest request, CancellationToken ct = default);

    // Full vendor list for the "Claims & Vendors" admin table - unlike GetVendorsAsync, this
    // includes suspended and unconfirmed-owner listings, since an admin needs to see everything.
    Task<IReadOnlyList<AdminVendorResponse>> GetAllForAdminAsync(CancellationToken ct = default);
    Task<ServiceResult<AdminVendorResponse>> SetSuspendedAsync(Guid vendorId, bool suspended, Guid adminUserId, CancellationToken ct = default);
}
