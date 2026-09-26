using FluentValidation;
using Ngila.Api.DTOs.Feed;

namespace Ngila.Api.Validators;

public class CreateFeedPostRequestValidator : AbstractValidator<CreateFeedPostRequest>
{
    public CreateFeedPostRequestValidator()
    {
        RuleFor(x => x.Content).NotEmpty().MaximumLength(500);
        RuleFor(x => x.PhotoUrls).Must(urls => urls is null || urls.Count <= 5)
            .WithMessage("You can attach up to 5 photos.");
    }
}
