using FluentValidation;
using Ngila.Api.DTOs.Admin;

namespace Ngila.Api.Validators;

public class EmailSettingsRequestValidator : AbstractValidator<EmailSettingsRequest>
{
    public EmailSettingsRequestValidator()
    {
        RuleFor(x => x.SenderEmail).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.AppPassword).NotEmpty().MaximumLength(200);
    }
}
