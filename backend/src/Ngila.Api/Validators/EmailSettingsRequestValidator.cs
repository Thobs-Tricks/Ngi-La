using FluentValidation;
using Ngila.Api.DTOs.Admin;

namespace Ngila.Api.Validators;

public class EmailSettingsRequestValidator : AbstractValidator<EmailSettingsRequest>
{
    public EmailSettingsRequestValidator()
    {
        RuleFor(x => x.SenderEmail).NotEmpty().EmailAddress().MaximumLength(256);
        // Generous headroom over the real 16-character app password - Google displays it grouped
        // with spaces ("abcd efgh ijkl mnop"), which the service strips before storing.
        RuleFor(x => x.AppPassword).MaximumLength(250);
    }
}
