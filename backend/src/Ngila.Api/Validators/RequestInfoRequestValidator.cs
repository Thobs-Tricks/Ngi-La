using FluentValidation;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Validators;

public class RequestInfoRequestValidator : AbstractValidator<RequestInfoRequest>
{
    public RequestInfoRequestValidator()
    {
        RuleFor(x => x.Message).NotEmpty().MaximumLength(500);
    }
}
