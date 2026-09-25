using Ngila.Api.Models.Enums;

namespace Ngila.Api.Models.Entities;

public class Report
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ReporterUserId { get; set; }
    public ApplicationUser ReporterUser { get; set; } = default!;

    public ReportKind Kind { get; set; }
    public ReportPriority Priority { get; set; } = ReportPriority.Normal;

    public string Title { get; set; } = default!;
    public string Detail { get; set; } = default!;

    // What's being reported - a vendor listing (fake business, wrong location, duplicate,
    // closed) or a specific review (fraudulent/disputed). Exactly one is expected to be set,
    // matching Kind, but both stay nullable rather than enforced via a DB constraint - simpler
    // for a hackathon timeline, validated at the DTO/service layer instead.
    public Guid? TargetVendorId { get; set; }
    public VendorProfile? TargetVendor { get; set; }

    public Guid? TargetReviewId { get; set; }
    public Review? TargetReview { get; set; }

    public bool IsResolved { get; set; }
    public Guid? ResolvedByUserId { get; set; }
    public ApplicationUser? ResolvedByUser { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
