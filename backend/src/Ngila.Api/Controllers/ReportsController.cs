using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Ngila.Api.Common;
using Ngila.Api.DTOs.Reports;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Controllers;

[ApiController]
[Authorize]
[EnableRateLimiting("public-read")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// File a report against a vendor listing (Flag) or a review (ReviewDispute). Any
    /// authenticated user can report - matches the product doc's community moderation flow.
    /// </summary>
    [HttpPost("api/reports")]
    public async Task<IActionResult> FileReport(ReportRequest request, CancellationToken ct)
    {
        var result = await _reportService.FileReportAsync(User.GetUserId(), request, ct);
        return result.Succeeded
            ? StatusCode(result.StatusCode, result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }

    [HttpGet("api/admin/reports")]
    [Authorize(Policy = AdminPolicies.CanManageReports)]
    public async Task<IActionResult> GetReports(CancellationToken ct)
    {
        var reports = await _reportService.GetReportsAsync(ct);
        return Ok(reports);
    }

    [HttpPost("api/admin/reports/{id:guid}/resolve")]
    [Authorize(Policy = AdminPolicies.CanManageReports)]
    public async Task<IActionResult> ResolveReport(Guid id, CancellationToken ct)
    {
        var result = await _reportService.ResolveReportAsync(id, User.GetUserId(), ct);
        return result.Succeeded
            ? Ok(result.Data)
            : StatusCode(result.StatusCode, new ProblemDetails { Title = result.Error, Status = result.StatusCode });
    }
}
