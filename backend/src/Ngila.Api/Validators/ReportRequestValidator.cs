using FluentValidation;
using Ngila.Api.DTOs.Reports;
using Ngila.Api.Models.Enums;

namespace Ngila.Api.Validators;

public class ReportRequestValidator : AbstractValidator<ReportRequest>
{
    public ReportRequestValidator()
    {
        RuleFor(x => x.Kind).IsInEnum();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Detail).NotEmpty().MaximumLength(1000);

        RuleFor(x => x.TargetVendorId)
            .NotEmpty().WithMessage("TargetVendorId is required for a Flag report.")
            .When(x => x.Kind == ReportKind.Flag);

        RuleFor(x => x.TargetReviewId)
            .NotEmpty().WithMessage("TargetReviewId is required for a ReviewDispute report.")
            .When(x => x.Kind == ReportKind.ReviewDispute);
    }
}
