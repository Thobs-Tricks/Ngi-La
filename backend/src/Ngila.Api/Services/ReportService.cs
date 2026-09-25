using Microsoft.EntityFrameworkCore;
using Ngila.Api.Common;
using Ngila.Api.Data;
using Ngila.Api.DTOs.Common;
using Ngila.Api.DTOs.Reports;
using Ngila.Api.Models.Entities;
using Ngila.Api.Models.Enums;
using Ngila.Api.Services.Interfaces;

namespace Ngila.Api.Services;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;
    private readonly IActivityLogService _activityLog;

    public ReportService(ApplicationDbContext context, IActivityLogService activityLog)
    {
        _context = context;
        _activityLog = activityLog;
    }

    public async Task<ServiceResult<ReportResponse>> FileReportAsync(Guid reporterUserId, ReportRequest request, CancellationToken ct = default)
    {
        if (request.Kind == ReportKind.Flag)
        {
            var vendorExists = await _context.VendorProfiles.AnyAsync(v => v.Id == request.TargetVendorId, ct);
            if (!vendorExists)
                return ServiceResult<ReportResponse>.Failure("Reported vendor not found.", 404);
        }
        else
        {
            var reviewExists = await _context.Reviews.AnyAsync(r => r.Id == request.TargetReviewId, ct);
            if (!reviewExists)
                return ServiceResult<ReportResponse>.Failure("Reported review not found.", 404);
        }

        var report = new Report
        {
            ReporterUserId = reporterUserId,
            Kind = request.Kind,
            Title = request.Title,
            Detail = request.Detail,
            TargetVendorId = request.Kind == ReportKind.Flag ? request.TargetVendorId : null,
            TargetReviewId = request.Kind == ReportKind.ReviewDispute ? request.TargetReviewId : null,
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync(ct);

        return ServiceResult<ReportResponse>.Success(MapToResponse(report), 201);
    }

    public async Task<IReadOnlyList<ReportResponse>> GetReportsAsync(CancellationToken ct = default)
    {
        var reports = await _context.Reports
            .OrderBy(r => r.IsResolved)
            .ThenByDescending(r => r.Priority)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reports.Select(MapToResponse).ToList();
    }

    public async Task<ServiceResult<MessageResponse>> ResolveReportAsync(Guid reportId, Guid resolvedByUserId, CancellationToken ct = default)
    {
        var report = await _context.Reports.FirstOrDefaultAsync(r => r.Id == reportId, ct);
        if (report is null)
            return ServiceResult<MessageResponse>.Failure("Report not found.", 404);

        if (!report.IsResolved)
        {
            report.IsResolved = true;
            report.ResolvedByUserId = resolvedByUserId;
            report.ResolvedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);

            await _activityLog.LogAsync(resolvedByUserId, $"resolved a report — {report.Title}", "report-resolved", ct);
        }

        return ServiceResult<MessageResponse>.Success(new MessageResponse("Report marked resolved."));
    }

    private static ReportResponse MapToResponse(Report report) => new(
        report.Id,
        report.Kind.ToString(),
        report.Priority.ToString(),
        report.Title,
        report.Detail,
        report.IsResolved,
        DisplayFormatting.RelativeTime(report.CreatedAt));
}
