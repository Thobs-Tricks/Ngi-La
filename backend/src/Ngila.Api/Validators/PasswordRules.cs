using FluentValidation;

namespace Ngila.Api.Validators;

public static class PasswordRules
{
    // Mirrors the ASP.NET Core Identity password policy configured in Program.cs, so clients
    // get the same feedback from FluentValidation before a request ever reaches Identity.
    public static IRuleBuilderOptions<T, string> MustBeAStrongPassword<T>(this IRuleBuilder<T, string> rule)
    {
        return rule
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one digit.")
            .Matches("[^a-zA-Z0-9]").WithMessage("Password must contain at least one special character.");
    }
}
