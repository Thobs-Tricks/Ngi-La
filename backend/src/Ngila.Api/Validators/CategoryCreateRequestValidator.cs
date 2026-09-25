using FluentValidation;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Validators;

public class CategoryCreateRequestValidator : AbstractValidator<CategoryCreateRequest>
{
    public CategoryCreateRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
