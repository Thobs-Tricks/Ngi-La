using Ngila.Api.Common;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Reports;

namespace Ngila.Api.Services.Interfaces;

public interface IReportService
{
    Task<ServiceResult<ReportResponse>> FileReportAsync(Guid reporterUserId, ReportRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ReportResponse>> GetReportsAsync(CancellationToken ct = default);
    Task<ServiceResult<MessageResponse>> ResolveReportAsync(Guid reportId, Guid resolvedByUserId, CancellationToken ct = default);
}
