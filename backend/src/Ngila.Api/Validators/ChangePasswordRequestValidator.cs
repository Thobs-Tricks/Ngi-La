using FluentValidation;
using Ngila.Api.DTOs.Auth;

namespace Ngila.Api.Validators;

public class ChangePasswordRequestValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordRequestValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).MustBeAStrongPassword();
    }
}
