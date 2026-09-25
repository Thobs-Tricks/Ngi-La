using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Services.Interfaces;

public record NearbyQuery(decimal? Latitude, decimal? Longitude, Guid? CategoryId, string? Search);

public interface IVendorService
{
    Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<VendorResponse>> GetVendorsAsync(NearbyQuery query, CancellationToken ct = default);
    Task<VendorResponse?> GetVendorByIdAsync(Guid id, decimal? latitude, decimal? longitude, CancellationToken ct = default);
}
