using FluentValidation;
using Ngila.Api.DTOs.Vendors;

namespace Ngila.Api.Validators;

public class TradingHourRequestValidator : AbstractValidator<TradingHourRequest>
{
    private static readonly string[] ValidDays = Enum.GetNames<DayOfWeek>();

    public TradingHourRequestValidator()
    {
        RuleFor(x => x.Day).Must(d => ValidDays.Contains(d, StringComparer.Ordinal))
            .WithMessage("Day must be a full day name, e.g. \"Monday\".");

        RuleFor(x => x.OpenTime)
            .NotEmpty().WithMessage("OpenTime is required when IsOpen is true.")
            .Must(BeAValidTime).WithMessage("OpenTime must be in \"HH:mm\" format.")
            .When(x => x.IsOpen);

        RuleFor(x => x.CloseTime)
            .NotEmpty().WithMessage("CloseTime is required when IsOpen is true.")
            .Must(BeAValidTime).WithMessage("CloseTime must be in \"HH:mm\" format.")
            .When(x => x.IsOpen);
    }

    private static bool BeAValidTime(string? value) =>
        value is not null && TimeSpan.TryParseExact(value, "hh\\:mm", null, out _);
}
