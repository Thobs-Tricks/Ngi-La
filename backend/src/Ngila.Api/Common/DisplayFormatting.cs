namespace Ngila.Api.Common;

public static class DisplayFormatting
{
    private static readonly TimeZoneInfo SouthAfricaTimeZone = ResolveSouthAfricaTimeZone();

    // Africa/Johannesburg has no DST, so the IANA and Windows IDs always agree - this just
    // covers the two different id formats .NET expects depending on OS.
    private static TimeZoneInfo ResolveSouthAfricaTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById("Africa/Johannesburg");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById("South Africa Standard Time");
        }
    }

    public static string Initials(string firstName, string lastName)
    {
        var first = firstName.Length > 0 ? firstName[0].ToString() : string.Empty;
        var last = lastName.Length > 0 ? lastName[0].ToString() : string.Empty;
        return (first + last).ToUpperInvariant();
    }

    // "Thabo M." - full first name, last name initial only, to avoid exposing a customer's
    // full identity on a public feed post.
    public static string DisplayName(string firstName, string lastName)
    {
        var lastInitial = lastName.Length > 0 ? lastName[0] + "." : string.Empty;
        return string.IsNullOrWhiteSpace(lastInitial) ? firstName : $"{firstName} {lastInitial}";
    }

    public static string RelativeTime(DateTime utcTimestamp, DateTime? nowUtc = null)
    {
        var now = nowUtc ?? DateTime.UtcNow;
        var elapsed = now - utcTimestamp;

        if (elapsed.TotalSeconds < 60) return "just now";
        if (elapsed.TotalMinutes < 60) return $"{(int)elapsed.TotalMinutes}m ago";
        if (elapsed.TotalHours < 24) return $"{(int)elapsed.TotalHours}h ago";
        if (elapsed.TotalDays < 7) return $"{(int)elapsed.TotalDays}d ago";
        return utcTimestamp.ToString("dd MMM yyyy");
    }

    public static bool IsOpenNow(TimeSpan? openingTime, TimeSpan? closingTime, DateTime? nowUtc = null)
    {
        if (openingTime is null || closingTime is null)
            return false;

        var now = nowUtc ?? DateTime.UtcNow;
        var localTime = TimeZoneInfo.ConvertTimeFromUtc(now, SouthAfricaTimeZone).TimeOfDay;

        return openingTime <= closingTime
            ? localTime >= openingTime && localTime <= closingTime
            // Overnight hours (e.g. open 18:00, closes 02:00 the next day).
            : localTime >= openingTime || localTime <= closingTime;
    }

    public static string FormatHours(TimeSpan? openingTime, TimeSpan? closingTime)
    {
        if (openingTime is null || closingTime is null)
            return "Hours not set";

        return $"{FormatTime(openingTime.Value)} - {FormatTime(closingTime.Value)}";
    }

    private static string FormatTime(TimeSpan time) => new DateTime(1, 1, 1).Add(time).ToString("HH:mm");
}
