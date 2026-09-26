using FluentValidation;
using Ngila.Api.DTOs.Feed;

namespace Ngila.Api.Validators;

public class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Content).NotEmpty().MaximumLength(500);
    }
}
