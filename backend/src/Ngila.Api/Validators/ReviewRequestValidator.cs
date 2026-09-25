using FluentValidation;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Validators;

public class ReviewRequestValidator : AbstractValidator<ReviewRequest>
{
    public ReviewRequestValidator()
    {
        RuleFor(x => x.Rating).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(1000);
    }
}
