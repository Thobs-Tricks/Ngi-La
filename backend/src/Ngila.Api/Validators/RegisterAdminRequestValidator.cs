using FluentValidation;
using Ngila.Api.DTOs.Auth;

namespace Ngila.Api.Validators;

public class RegisterAdminRequestValidator : AbstractValidator<RegisterAdminRequest>
{
    public RegisterAdminRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.PhoneNumber)
            .Matches(@"^\+?[0-9\s\-()]{7,20}$")
            .When(x => !string.IsNullOrWhiteSpace(x.PhoneNumber))
            .WithMessage("Phone number is not in a valid format.");
        RuleFor(x => x.Password).MustBeAStrongPassword();
    }
}
