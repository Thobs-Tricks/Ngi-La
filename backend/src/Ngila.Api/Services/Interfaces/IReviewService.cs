using Ngila.Api.Common;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Services.Interfaces;

public interface IReviewService
{
    Task<ServiceResult<ReviewResponse>> SubmitReviewAsync(Guid vendorId, Guid userId, ReviewRequest request, CancellationToken ct = default);
    Task<ServiceResult<IReadOnlyList<ReviewResponse>>> GetReviewsAsync(Guid vendorId, CancellationToken ct = default);
}
