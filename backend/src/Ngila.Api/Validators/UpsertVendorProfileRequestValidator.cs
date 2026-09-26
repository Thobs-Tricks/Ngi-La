using FluentValidation;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Validators;

public class UpsertVendorProfileRequestValidator : AbstractValidator<UpsertVendorProfileRequest>
{
    public UpsertVendorProfileRequestValidator()
    {
        RuleFor(x => x.BusinessName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(1000);
        RuleFor(x => x.CategoryIds)
            .NotEmpty().WithMessage("Select at least one business category.")
            .Must(ids => ids.All(id => id != Guid.Empty)).WithMessage("Invalid category selected.");
        RuleFor(x => x.LocationDescription).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Latitude).InclusiveBetween(-90m, 90m).When(x => x.Latitude.HasValue);
        RuleFor(x => x.Longitude).InclusiveBetween(-180m, 180m).When(x => x.Longitude.HasValue);
        RuleFor(x => x.ContactPhone)
            .Matches(@"^\+?[0-9\s\-()]{7,20}$")
            .When(x => !string.IsNullOrWhiteSpace(x.ContactPhone))
            .WithMessage("Contact phone is not in a valid format.");
        RuleFor(x => x.ImageUrl)
            .Must(url => Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .When(x => !string.IsNullOrWhiteSpace(x.ImageUrl))
            .WithMessage("ImageUrl must be a valid absolute http(s) URL.");
        RuleFor(x => x.PhotoUrls).Must(urls => urls is null || urls.Count <= 5)
            .WithMessage("You can add up to 5 photos.");
        RuleForEach(x => x.TradingHours).SetValidator(new TradingHourRequestValidator());
        RuleFor(x => x.TradingHours)
            .Must(hours => hours is null || hours.Select(h => h.Day).Distinct().Count() == hours.Count)
            .WithMessage("Each day can only appear once in TradingHours.");
    }
}
