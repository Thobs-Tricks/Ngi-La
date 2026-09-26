using FluentValidation;
using Ngila.Api.DTOs.Admin;

namespace Ngila.Api.Validators;

public class AdminResetPasswordRequestValidator : AbstractValidator<AdminResetPasswordRequest>
{
    public AdminResetPasswordRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.NewPassword).MustBeAStrongPassword();
    }
}
