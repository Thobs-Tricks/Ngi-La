using Ngila.Api.Models.Enums;

namespace Ngila.Api.DTOs.Reports;

// Exactly one target is expected, matching Kind: TargetVendorId for Flag, TargetReviewId for
// ReviewDispute - enforced in ReportService, not here.
public record ReportRequest(
    ReportKind Kind,
    string Title,
    string Detail,
    Guid? TargetVendorId,
    Guid? TargetReviewId);
